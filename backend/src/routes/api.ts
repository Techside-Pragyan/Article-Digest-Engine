import { Router, Response } from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { 
  User, 
  Article, 
  Simplification, 
  Summary, 
  StudyNotes, 
  Analytics, 
  SavedContent 
} from '../models/Schemas';
import { protect, AuthRequest } from '../middleware/auth';
import { scrapeUrl, parsePdfBuffer, parseDocxBuffer } from '../services/parserService';
import { 
  simplifyArticle, 
  generateSummary, 
  generateStudyNotes, 
  explainConcept 
} from '../services/geminiService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit
const JWT_SECRET = process.env.JWT_SECRET || 'futuristic_quantum_secret_key_990';

// ==========================================
// IN-MEMORY MOCK STORAGE (IF MONGODB MISSING)
// ==========================================
export let isDatabaseConnected = false;
export const setDatabaseConnected = (status: boolean) => {
  isDatabaseConnected = status;
};

// In-Memory arrays for Mock Fallback DB
const mockUsers: any[] = [];
const mockArticles: any[] = [];
const mockSimplifications: any[] = [];
const mockSummaries: any[] = [];
const mockNotes: any[] = [];
const mockAnalytics: Record<string, any> = {};
const mockSaved: any[] = [];

// Helper to trigger Analytics updates
const updateAnalytics = async (userId: string, wordsCount: number, mode: string) => {
  const timeSaved = Math.max(1, Math.round(wordsCount / 150)); // Estimate 1 min saved per 150 words
  const today = new Date().toISOString().split('T')[0];

  if (isDatabaseConnected) {
    try {
      let analytics = await Analytics.findOne({ userId });
      if (!analytics) {
        analytics = new Analytics({ userId });
      }

      analytics.totalWordsSimplified += wordsCount;
      analytics.timeSavedMinutes += timeSaved;
      
      // Update mode usage safely
      const currentModeCount = (analytics.modeUsage as any)[mode] || 0;
      (analytics.modeUsage as any)[mode] = currentModeCount + 1;

      // Update daily activity
      const dayIndex = analytics.dailyActivity.findIndex(d => d.date === today);
      if (dayIndex >= 0) {
        analytics.dailyActivity[dayIndex].wordsCount += wordsCount;
        analytics.dailyActivity[dayIndex].articlesCount += 1;
      } else {
        analytics.dailyActivity.push({ date: today, wordsCount, articlesCount: 1 });
      }

      await analytics.save();
    } catch (err) {
      console.error('Error updating DB analytics:', err);
    }
  } else {
    // Mock analytics update
    if (!mockAnalytics[userId]) {
      mockAnalytics[userId] = {
        userId,
        totalWordsSimplified: 0,
        timeSavedMinutes: 0,
        modeUsage: { beginner: 0, student: 0, child: 0, professional_summary: 0, bullets: 0 },
        dailyActivity: []
      };
    }
    
    const ana = mockAnalytics[userId];
    ana.totalWordsSimplified += wordsCount;
    ana.timeSavedMinutes += timeSaved;
    if (ana.modeUsage[mode] !== undefined) {
      ana.modeUsage[mode]++;
    }

    const day = ana.dailyActivity.find((d: any) => d.date === today);
    if (day) {
      day.wordsCount += wordsCount;
      day.articlesCount += 1;
    } else {
      ana.dailyActivity.push({ date: today, wordsCount, articlesCount: 1 });
    }
  }
};


// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// Register route
router.post('/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All inputs (name, email, password) are required.' });
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    if (isDatabaseConnected) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists under this email.' });
      }

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
      });

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

      // Create initial empty analytics record
      await Analytics.create({ userId: user._id });

      return res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
      });
    } else {
      // Mock flow
      const userExists = mockUsers.find(u => u.email === email);
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists (Mock).' });
      }

      const mockId = 'mock_user_' + Math.random().toString(36).substr(2, 9);
      const user = {
        _id: mockId,
        name,
        email,
        password: hashedPassword,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
        createdAt: new Date()
      };
      mockUsers.push(user);

      // Create mock empty analytics
      mockAnalytics[mockId] = {
        userId: mockId,
        totalWordsSimplified: 0,
        timeSavedMinutes: 0,
        modeUsage: { beginner: 0, student: 0, child: 0, professional_summary: 0, bullets: 0 },
        dailyActivity: []
      };

      const token = jwt.sign({ id: mockId }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        success: true,
        token,
        user: { id: mockId, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
        message: 'Registered successfully (Offline Mode)'
      });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Registration Failure' });
  }
});

// Login route
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    if (isDatabaseConnected) {
      const user = await User.findOne({ email });
      if (!user || !user.password) {
        return res.status(400).json({ success: false, message: 'Invalid credentials. User not found.' });
      }

      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
      });
    } else {
      // Mock flow
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid credentials. Mock user not found.' });
      }

      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials. Mock incorrect password.' });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
        message: 'Logged in successfully (Offline Mode)'
      });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Login Failure' });
  }
});

// Google Authentication Mock
router.post('/auth/google', async (req, res) => {
  const { email, name, avatarUrl } = req.body;
  if (!email || !name) {
    return res.status(400).json({ success: false, message: 'Missing Google credentials fields.' });
  }

  try {
    if (isDatabaseConnected) {
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name,
          email,
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
        });
        await Analytics.create({ userId: user._id });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
      });
    } else {
      let user = mockUsers.find(u => u.email === email);
      if (!user) {
        const mockId = 'mock_google_' + Math.random().toString(36).substr(2, 9);
        user = {
          _id: mockId,
          name,
          email,
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
          createdAt: new Date()
        };
        mockUsers.push(user);
        mockAnalytics[mockId] = {
          userId: mockId,
          totalWordsSimplified: 0,
          timeSavedMinutes: 0,
          modeUsage: { beginner: 0, student: 0, child: 0, professional_summary: 0, bullets: 0 },
          dailyActivity: []
        };
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
        message: 'Google auth successful (Offline Mode)'
      });
    }
  } catch (err: any) {
    console.error('Google oauth failure:', err);
    res.status(500).json({ success: false, message: 'Google Authentication failed.' });
  }
});

// Profile route
router.get('/auth/me', protect, async (req: AuthRequest, res) => {
  try {
    if (isDatabaseConnected) {
      const user = await User.findById(req.userId).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User profile not found.' });
      }
      return res.json({ success: true, user });
    } else {
      const user = mockUsers.find(u => u._id === req.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Mock profile not found.' });
      }
      const { password, ...safeUser } = user;
      return res.json({ success: true, user: safeUser });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ==========================================
// 2. FILE/URL PARSING PIPELINES
// ==========================================

// Parse file (PDF / DOCX)
router.post('/parse/file', protect, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const fileType = req.file.originalname.split('.').pop()?.toLowerCase();
  const buffer = req.file.buffer;

  try {
    let parsedText = '';
    if (fileType === 'pdf') {
      parsedText = await parsePdfBuffer(buffer);
    } else if (fileType === 'docx') {
      parsedText = await parseDocxBuffer(buffer);
    } else if (fileType === 'txt') {
      parsedText = buffer.toString('utf-8');
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file format. Please upload PDF, DOCX, or TXT.' });
    }

    // Limit extreme text lengths to protect AI token boundaries (e.g. 50000 chars approx 10000 words)
    const characterLimit = 60000;
    if (parsedText.length > characterLimit) {
      parsedText = parsedText.substring(0, characterLimit) + '\n\n... [Text truncated due to size limitations]';
    }

    return res.json({
      success: true,
      title: req.file.originalname.replace(`.${fileType}`, ''),
      content: parsedText,
      originalType: fileType
    });
  } catch (error: any) {
    console.error('File parse API failed:', error);
    res.status(500).json({ success: false, message: error.message || 'File parsing failed.' });
  }
});

// Scrape website URL
router.post('/parse/url', protect, async (req: AuthRequest, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'Target website URL is required.' });
  }

  try {
    const data = await scrapeUrl(url);
    
    // Truncate if extreme
    const characterLimit = 60000;
    if (data.content.length > characterLimit) {
      data.content = data.content.substring(0, characterLimit) + '\n\n... [Content truncated due to size limitations]';
    }

    return res.json({
      success: true,
      title: data.title,
      content: data.content,
      originalType: 'url',
      source: url
    });
  } catch (error: any) {
    console.error('URL parse API failed:', error);
    res.status(500).json({ success: false, message: error.message || 'URL scraping failed.' });
  }
});


// ==========================================
// 3. AI CORE ENGINES
// ==========================================

// AI Text Simplification endpoint
router.post('/ai/simplify', protect, async (req: AuthRequest, res) => {
  const { articleId, text, title, mode, language, originalType, source } = req.body;

  if (!text || !mode) {
    return res.status(400).json({ success: false, message: 'Text and Mode are required for simplification.' });
  }

  try {
    // 1. Solve/Find Article Reference
    let articleObj: any = null;
    
    if (articleId) {
      if (isDatabaseConnected) {
        articleObj = await Article.findById(articleId);
      } else {
        articleObj = mockArticles.find(a => a._id === articleId);
      }
    }

    if (!articleObj) {
      // Save a new Article reference
      const cleanTitle = title || 'Untitled Article';
      if (isDatabaseConnected) {
        articleObj = await Article.create({
          title: cleanTitle,
          content: text,
          originalType: originalType || 'text',
          source: source || 'Direct Paste',
          userId: req.userId
        });
      } else {
        const mockArtId = 'mock_art_' + Math.random().toString(36).substr(2, 9);
        articleObj = {
          _id: mockArtId,
          title: cleanTitle,
          content: text,
          originalType: originalType || 'text',
          source: source || 'Direct Paste',
          userId: req.userId,
          createdAt: new Date()
        };
        mockArticles.push(articleObj);
      }
    }

    // 2. Call Simplification Service
    const aiResult = await simplifyArticle(text, mode, language || 'en');

    // 3. Save Simplification record
    let simplificationObj: any = null;
    if (isDatabaseConnected) {
      simplificationObj = await Simplification.create({
        articleId: articleObj._id,
        userId: req.userId,
        mode,
        language: language || 'en',
        simplifiedText: aiResult.simplifiedText,
        keyTerms: aiResult.keyTerms,
        explanationSteps: aiResult.explanationSteps,
        difficultyScore: aiResult.difficultyScore
      });
    } else {
      const mockSimpId = 'mock_simp_' + Math.random().toString(36).substr(2, 9);
      simplificationObj = {
        _id: mockSimpId,
        articleId: articleObj._id,
        userId: req.userId,
        mode,
        language: language || 'en',
        simplifiedText: aiResult.simplifiedText,
        keyTerms: aiResult.keyTerms,
        explanationSteps: aiResult.explanationSteps,
        difficultyScore: aiResult.difficultyScore,
        createdAt: new Date()
      };
      mockSimplifications.push(simplificationObj);
    }

    // 4. Update user analytics record asynchronously
    const wordsCount = text.split(/\s+/).length;
    await updateAnalytics(req.userId!, wordsCount, mode);

    return res.json({
      success: true,
      articleId: articleObj._id,
      simplificationId: simplificationObj._id,
      simplifiedText: aiResult.simplifiedText,
      keyTerms: aiResult.keyTerms,
      explanationSteps: aiResult.explanationSteps,
      difficultyScore: aiResult.difficultyScore
    });
  } catch (error: any) {
    console.error('AI Simplification route failed:', error);
    res.status(500).json({ success: false, message: error.message || 'AI Simplification failed.' });
  }
});

// AI Summarizer endpoint
router.post('/ai/summary', protect, async (req: AuthRequest, res) => {
  const { articleId, text, title, originalType, source } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, message: 'Text is required to generate summaries.' });
  }

  try {
    let articleObj: any = null;
    if (articleId) {
      articleObj = isDatabaseConnected ? await Article.findById(articleId) : mockArticles.find(a => a._id === articleId);
    }

    if (!articleObj) {
      const cleanTitle = title || 'Untitled Article';
      if (isDatabaseConnected) {
        articleObj = await Article.create({
          title: cleanTitle,
          content: text,
          originalType: originalType || 'text',
          source: source || 'Direct Paste',
          userId: req.userId
        });
      } else {
        const mockArtId = 'mock_art_' + Math.random().toString(36).substr(2, 9);
        articleObj = {
          _id: mockArtId,
          title: cleanTitle,
          content: text,
          originalType: originalType || 'text',
          source: source || 'Direct Paste',
          userId: req.userId,
          createdAt: new Date()
        };
        mockArticles.push(articleObj);
      }
    }

    const aiResult = await generateSummary(text);

    let summaryObj: any = null;
    if (isDatabaseConnected) {
      summaryObj = await Summary.create({
        articleId: articleObj._id,
        userId: req.userId,
        ...aiResult
      });
    } else {
      const mockSumId = 'mock_sum_' + Math.random().toString(36).substr(2, 9);
      summaryObj = {
        _id: mockSumId,
        articleId: articleObj._id,
        userId: req.userId,
        ...aiResult,
        createdAt: new Date()
      };
      mockSummaries.push(summaryObj);
    }

    return res.json({
      success: true,
      articleId: articleObj._id,
      summaryId: summaryObj._id,
      ...aiResult
    });
  } catch (error: any) {
    console.error('AI Summarization failed:', error);
    res.status(500).json({ success: false, message: error.message || 'AI Summary generation failed.' });
  }
});

// AI Study Notes endpoint
router.post('/ai/notes', protect, async (req: AuthRequest, res) => {
  const { articleId, text, title, originalType, source } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, message: 'Text is required to build study notes.' });
  }

  try {
    let articleObj: any = null;
    if (articleId) {
      articleObj = isDatabaseConnected ? await Article.findById(articleId) : mockArticles.find(a => a._id === articleId);
    }

    if (!articleObj) {
      const cleanTitle = title || 'Untitled Article';
      if (isDatabaseConnected) {
        articleObj = await Article.create({
          title: cleanTitle,
          content: text,
          originalType: originalType || 'text',
          source: source || 'Direct Paste',
          userId: req.userId
        });
      } else {
        const mockArtId = 'mock_art_' + Math.random().toString(36).substr(2, 9);
        articleObj = {
          _id: mockArtId,
          title: cleanTitle,
          content: text,
          originalType: originalType || 'text',
          source: source || 'Direct Paste',
          userId: req.userId,
          createdAt: new Date()
        };
        mockArticles.push(articleObj);
      }
    }

    const aiResult = await generateStudyNotes(text);

    let notesObj: any = null;
    if (isDatabaseConnected) {
      notesObj = await StudyNotes.create({
        articleId: articleObj._id,
        userId: req.userId,
        ...aiResult
      });
    } else {
      const mockNotesId = 'mock_notes_' + Math.random().toString(36).substr(2, 9);
      notesObj = {
        _id: mockNotesId,
        articleId: articleObj._id,
        userId: req.userId,
        ...aiResult,
        createdAt: new Date()
      };
      mockNotes.push(notesObj);
    }

    return res.json({
      success: true,
      articleId: articleObj._id,
      notesId: notesObj._id,
      ...aiResult
    });
  } catch (error: any) {
    console.error('AI Study notes compilation failed:', error);
    res.status(500).json({ success: false, message: error.message || 'AI Study Notes compilation failed.' });
  }
});

// Click-to-explain Concept Endpoint
router.post('/ai/explain-concept', protect, async (req, res) => {
  const { word, contextSentence } = req.body;

  if (!word) {
    return res.status(400).json({ success: false, message: 'Target concept word is required.' });
  }

  try {
    const explanation = await explainConcept(word, contextSentence || '');
    return res.json({ success: true, explanation });
  } catch (error: any) {
    console.error('AI Explain concept failed:', error);
    res.status(500).json({ success: false, message: error.message || 'AI concept explanation failed.' });
  }
});


// ==========================================
// 4. USER DASHBOARD & HISTORY SERVICES
// ==========================================

// Get Simplifications history
router.get('/history/simplifications', protect, async (req: AuthRequest, res) => {
  try {
    if (isDatabaseConnected) {
      const list = await Simplification.find({ userId: req.userId })
        .populate('articleId', 'title originalType source createdAt')
        .sort({ createdAt: -1 });
      return res.json({ success: true, list });
    } else {
      const list = mockSimplifications
        .filter(s => s.userId === req.userId)
        .map(s => {
          const art = mockArticles.find(a => a._id.toString() === s.articleId.toString()) || {};
          return { ...s, articleId: art };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return res.json({ success: true, list });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get detailed individual summary / notes historical records
router.get('/history/summaries/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDatabaseConnected) {
      const summary = await Summary.findOne({ articleId: id }).populate('articleId');
      return res.json({ success: true, summary });
    } else {
      const summary = mockSummaries.find(s => s.articleId.toString() === id.toString());
      if (summary) {
        const art = mockArticles.find(a => a._id.toString() === id.toString());
        return res.json({ success: true, summary: { ...summary, articleId: art } });
      }
      return res.status(404).json({ success: false, message: 'Summary not found in Mock' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/history/notes/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDatabaseConnected) {
      const notes = await StudyNotes.findOne({ articleId: id }).populate('articleId');
      return res.json({ success: true, notes });
    } else {
      const notes = mockNotes.find(s => s.articleId.toString() === id.toString());
      if (notes) {
        const art = mockArticles.find(a => a._id.toString() === id.toString());
        return res.json({ success: true, notes: { ...notes, articleId: art } });
      }
      return res.status(404).json({ success: false, message: 'Study Notes not found in Mock' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Analytics aggregation data
router.get('/analytics', protect, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    
    if (isDatabaseConnected) {
      let analytics = await Analytics.findOne({ userId });
      if (!analytics) {
        analytics = await Analytics.create({ userId });
      }
      return res.json({ success: true, analytics });
    } else {
      let analytics = mockAnalytics[userId];
      if (!analytics) {
        mockAnalytics[userId] = {
          userId,
          totalWordsSimplified: 12450, // Starting seed for high premium feel in mock
          timeSavedMinutes: 83,
          modeUsage: { beginner: 4, student: 9, child: 5, professional_summary: 3, bullets: 7 },
          dailyActivity: [
            { date: '2026-05-18', wordsCount: 1500, articlesCount: 2 },
            { date: '2026-05-19', wordsCount: 3100, articlesCount: 3 },
            { date: '2026-05-20', wordsCount: 800, articlesCount: 1 },
            { date: '2026-05-21', wordsCount: 4200, articlesCount: 4 },
            { date: '2026-05-22', wordsCount: 2850, articlesCount: 3 }
          ]
        };
        analytics = mockAnalytics[userId];
      }
      return res.json({ success: true, analytics });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// ==========================================
// 5. BOOKMARK / SAVED CONTENT ENDPOINTS
// ==========================================

// Add or remove bookmark
router.post('/bookmarks', protect, async (req: AuthRequest, res) => {
  const { title, type, referenceId } = req.body;

  if (!title || !type || !referenceId) {
    return res.status(400).json({ success: false, message: 'Title, type, and referenceId are required to bookmark.' });
  }

  try {
    if (isDatabaseConnected) {
      const existing = await SavedContent.findOne({ userId: req.userId, referenceId });

      if (existing) {
        await SavedContent.deleteOne({ _id: existing._id });
        return res.json({ success: true, bookmarked: false, message: 'Removed from bookmarks.' });
      } else {
        const bookmark = await SavedContent.create({
          userId: req.userId,
          title,
          type,
          referenceId
        });
        return res.json({ success: true, bookmarked: true, bookmark });
      }
    } else {
      // Mock bookmarks
      const existingIndex = mockSaved.findIndex(s => s.userId === req.userId && s.referenceId.toString() === referenceId.toString());

      if (existingIndex >= 0) {
        mockSaved.splice(existingIndex, 1);
        return res.json({ success: true, bookmarked: false, message: 'Removed from bookmarks (Mock).' });
      } else {
        const mockSaveId = 'mock_save_' + Math.random().toString(36).substr(2, 9);
        const bookmark = {
          _id: mockSaveId,
          userId: req.userId,
          title,
          type,
          referenceId,
          createdAt: new Date()
        };
        mockSaved.push(bookmark);
        return res.json({ success: true, bookmarked: true, bookmark });
      }
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Bookmark operation failed.' });
  }
});

// Fetch all user bookmarks
router.get('/bookmarks', protect, async (req: AuthRequest, res) => {
  try {
    if (isDatabaseConnected) {
      const bookmarks = await SavedContent.find({ userId: req.userId }).sort({ createdAt: -1 });
      return res.json({ success: true, bookmarks });
    } else {
      const bookmarks = mockSaved
        .filter(s => s.userId === req.userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return res.json({ success: true, bookmarks });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Check individual bookmark status
router.get('/bookmarks/status/:id', protect, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    if (isDatabaseConnected) {
      const bookmark = await SavedContent.findOne({ userId: req.userId, referenceId: id });
      return res.json({ success: true, bookmarked: !!bookmark });
    } else {
      const bookmark = mockSaved.find(s => s.userId === req.userId && s.referenceId.toString() === id.toString());
      return res.json({ success: true, bookmarked: !!bookmark });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
