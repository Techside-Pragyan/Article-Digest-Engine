import { Schema, model, Document } from 'mongoose';

// 1. USER SCHEMA & INTERFACE
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String },
  avatarUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export const User = model<IUser>('User', UserSchema);


// 2. ARTICLE SCHEMA & INTERFACE
export interface IArticle extends Document {
  title: string;
  content: string;
  originalType: 'text' | 'pdf' | 'docx' | 'url';
  source: string; // URL link or File Name
  userId?: Schema.Types.ObjectId;
  createdAt: Date;
}

const ArticleSchema = new Schema<IArticle>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  originalType: { type: String, enum: ['text', 'pdf', 'docx', 'url'], required: true },
  source: { type: String, default: '' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  createdAt: { type: Date, default: Date.now }
});

export const Article = model<IArticle>('Article', ArticleSchema);


// 3. SIMPLIFICATION SCHEMA & INTERFACE
export interface IKeyTerm {
  word: string;
  definition: string;
  analogy: string;
  example: string;
}

export interface ISimplification extends Document {
  articleId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  mode: 'beginner' | 'student' | 'child' | 'professional_summary' | 'bullets';
  language: string; // 'en', 'hi', 'or', 'bn', 'es', 'fr'
  simplifiedText: string;
  keyTerms: IKeyTerm[];
  explanationSteps: string[];
  difficultyScore: number; // 0-100 (difficulty)
  createdAt: Date;
}

const SimplificationSchema = new Schema<ISimplification>({
  articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  mode: { 
    type: String, 
    enum: ['beginner', 'student', 'child', 'professional_summary', 'bullets'], 
    required: true 
  },
  language: { type: String, required: true, default: 'en' },
  simplifiedText: { type: String, required: true },
  keyTerms: [{
    word: { type: String, required: true },
    definition: { type: String, required: true },
    analogy: { type: String, required: true },
    example: { type: String, required: true }
  }],
  explanationSteps: [{ type: String }],
  difficultyScore: { type: Number, default: 50 },
  createdAt: { type: Date, default: Date.now }
});

export const Simplification = model<ISimplification>('Simplification', SimplificationSchema);


// 4. SUMMARY SCHEMA & INTERFACE
export interface ISummary extends Document {
  articleId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  oneLineSummary: string;
  shortSummary: string;
  mediumSummary: string;
  detailedSummary: string;
  bulletSummaries: string[];
  readingTimeMinutes: number;
  keywords: string[];
  mainTopic: string;
  createdAt: Date;
}

const SummarySchema = new Schema<ISummary>({
  articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  oneLineSummary: { type: String, required: true },
  shortSummary: { type: String, required: true },
  mediumSummary: { type: String, required: true },
  detailedSummary: { type: String, required: true },
  bulletSummaries: [{ type: String }],
  readingTimeMinutes: { type: Number, required: true },
  keywords: [{ type: String }],
  mainTopic: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Summary = model<ISummary>('Summary', SummarySchema);


// 5. STUDY NOTES SCHEMA & INTERFACE
export interface IFlashcard {
  question: string;
  answer: string;
}

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface IFAQ {
  question: string;
  answer: string;
}

export interface IStudyNotes extends Document {
  articleId: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId;
  studyNotesText: string;
  flashcards: IFlashcard[];
  quizQuestions: IQuizQuestion[];
  faqs: IFAQ[];
  createdAt: Date;
}

const StudyNotesSchema = new Schema<IStudyNotes>({
  articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  studyNotesText: { type: String, required: true },
  flashcards: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  quizQuestions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, required: true }
  }],
  faqs: [{
    question: { type: String, required: true },
    answer: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const StudyNotes = model<IStudyNotes>('StudyNotes', StudyNotesSchema);


// 6. ANALYTICS SCHEMA & INTERFACE
export interface IAnalytics extends Document {
  userId: Schema.Types.ObjectId;
  totalWordsSimplified: number;
  timeSavedMinutes: number;
  modeUsage: {
    beginner: number;
    student: number;
    child: number;
    professional_summary: number;
    bullets: number;
  };
  dailyActivity: Array<{
    date: string; // YYYY-MM-DD
    wordsCount: number;
    articlesCount: number;
  }>;
  createdAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  totalWordsSimplified: { type: Number, default: 0 },
  timeSavedMinutes: { type: Number, default: 0 },
  modeUsage: {
    beginner: { type: Number, default: 0 },
    student: { type: Number, default: 0 },
    child: { type: Number, default: 0 },
    professional_summary: { type: Number, default: 0 },
    bullets: { type: Number, default: 0 }
  },
  dailyActivity: [{
    date: { type: String, required: true },
    wordsCount: { type: Number, default: 0 },
    articlesCount: { type: Number, default: 0 }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const Analytics = model<IAnalytics>('Analytics', AnalyticsSchema);


// 7. BOOKMARKED/SAVED CONTENT SCHEMA & INTERFACE
export interface ISavedContent extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  type: 'simplification' | 'summary' | 'notes';
  referenceId: Schema.Types.ObjectId;
  createdAt: Date;
}

const SavedContentSchema = new Schema<ISavedContent>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['simplification', 'summary', 'notes'], required: true },
  referenceId: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const SavedContent = model<ISavedContent>('SavedContent', SavedContentSchema);
