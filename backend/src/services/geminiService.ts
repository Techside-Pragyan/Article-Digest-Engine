import { GoogleGenAI, GoogleGenAIPrompt } from '@google/generative-ai';
import { IKeyTerm, IFlashcard, IQuizQuestion, IFAQ } from '../models/Schemas';

const API_KEY = process.env.GEMINI_API_KEY || '';

// Access the Google Generative AI SDK
let genAI: any = null;
if (API_KEY) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    genAI = new GoogleGenerativeAI(API_KEY);
    console.log('✨ Gemini Generative AI SDK initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Google Generative AI SDK:', err);
  }
} else {
  console.log('⚠️ GEMINI_API_KEY not found in environment. Running in Mock AI mode.');
}

// Check if Gemini is active
export const isGeminiActive = (): boolean => {
  return genAI !== null;
};

// Interface for Simplification Response
export interface ISimplifyResult {
  simplifiedText: string;
  keyTerms: IKeyTerm[];
  explanationSteps: string[];
  difficultyScore: number;
}

// Interface for Summary Response
export interface ISummaryResult {
  oneLineSummary: string;
  shortSummary: string;
  mediumSummary: string;
  detailedSummary: string;
  bulletSummaries: string[];
  readingTimeMinutes: number;
  keywords: string[];
  mainTopic: string;
}

// Interface for Study Notes Response
export interface INotesResult {
  studyNotesText: string;
  flashcards: IFlashcard[];
  quizQuestions: IQuizQuestion[];
  faqs: IFAQ[];
}

// Helper to calculate reading time
const estimateReadingTime = (text: string): number => {
  const wordsPerMinute = 225;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
};

// 1. SIMPLIFY ARTICLE TEXT
export const simplifyArticle = async (
  text: string,
  mode: 'beginner' | 'student' | 'child' | 'professional_summary' | 'bullets',
  language: string = 'en'
): Promise<ISimplifyResult> => {
  if (!genAI) {
    return getMockSimplification(text, mode, language);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const langNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिंदी)',
      or: 'Odia (ଓଡ଼ିଆ)',
      bn: 'Bengali (বাংলা)',
      es: 'Spanish (Español)',
      fr: 'French (Français)'
    };
    const targetLanguage = langNames[language] || 'English';

    const prompt = `
      You are an expert, highly intelligent personal tutor, schoolteacher, and scientific simplifier. 
      Your task is to simplify the complex text provided below.

      TARGET MODE: ${mode.toUpperCase()}
      - "beginner": Explains ideas clearly, removes advanced technical terms, adds brief contextual definitions in parenthetical formats. Ideal for high school.
      - "student": Structured for secondary-college learners. Retains core scientific vocabulary but explains methodologies, theories, and concepts sequentially.
      - "child": ELI5 (Explain Like I'm 5). Extremely simple vocabulary, rich analogies, imaginative comparisons, and friendly, energetic tone.
      - "professional_summary": Keeps professional terms but translates extremely dense language into crisp, professional, high-impact business communication.
      - "bullets": Translates key concepts into a highly organized, indentation-backed list of structural takeaways.

      TARGET LANGUAGE: ${targetLanguage}
      The final simplified text, definitions, explanations, and all response fields must be in ${targetLanguage}.

      INPUT TEXT:
      """
      ${text}
      """

      You must return a JSON object matching this exact TypeScript structure:
      {
        "simplifiedText": "The fully rewritten and simplified text in the target language.",
        "keyTerms": [
          {
            "word": "The complex term",
            "definition": "Simple, plain definition",
            "analogy": "A creative, fun real-world analogy to explain it",
            "example": "A concrete real-world example"
          }
        ],
        "explanationSteps": [
          "Step 1: Simple explanation of phase 1 of the text's flow",
          "Step 2: Simple explanation of phase 2",
          "..."
        ],
        "difficultyScore": 35 // Estimated reading difficulty of the original text from 0 (very simple) to 100 (highly academic post-grad jargon)
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return {
      simplifiedText: parsedData.simplifiedText || 'Simplification unavailable.',
      keyTerms: parsedData.keyTerms || [],
      explanationSteps: parsedData.explanationSteps || [],
      difficultyScore: parsedData.difficultyScore || 50
    };
  } catch (error) {
    console.error('Gemini Simplification Error:', error);
    return getMockSimplification(text, mode, language);
  }
};

// 2. GENERATE SMART DIGESTS & SUMMARIES
export const generateSummary = async (text: string): Promise<ISummaryResult> => {
  if (!genAI) {
    return getMockSummary(text);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an elite summarization engine and research analyst.
      Analyze the input text and extract key, multi-layered summaries.

      INPUT TEXT:
      """
      ${text}
      """

      You must return a JSON object matching this exact TypeScript structure:
      {
        "oneLineSummary": "A single, highly engaging, dynamic one-line description summarizing the core thesis.",
        "shortSummary": "A concise paragraph summarizing major points (2-3 sentences).",
        "mediumSummary": "A detailed 1-2 paragraph breakdown showing core context and results.",
        "detailedSummary": "A full, comprehensive executive overview detailing findings, implications, and next steps.",
        "bulletSummaries": [
          "Key structural point 1",
          "Key structural point 2",
          "..."
        ],
        "keywords": ["5-7 high-quality, relevant indexing tags"],
        "mainTopic": "Short 2-4 word descriptor of the absolute main subject"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return {
      oneLineSummary: parsedData.oneLineSummary || '',
      shortSummary: parsedData.shortSummary || '',
      mediumSummary: parsedData.mediumSummary || '',
      detailedSummary: parsedData.detailedSummary || '',
      bulletSummaries: parsedData.bulletSummaries || [],
      readingTimeMinutes: estimateReadingTime(text),
      keywords: parsedData.keywords || [],
      mainTopic: parsedData.mainTopic || 'General Knowledge'
    };
  } catch (error) {
    console.error('Gemini Summary Error:', error);
    return getMockSummary(text);
  }
};

// 3. AI STUDY NOTES GENERATOR (Study guide, Flashcards, Quizzes, FAQ)
export const generateStudyNotes = async (text: string): Promise<INotesResult> => {
  if (!genAI) {
    return getMockStudyNotes(text);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-pro', // Using Gemini 1.5 Pro for higher reasoning and educational generation
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are a legendary educator, curriculum designer, and academic tutor.
      Read the provided text and build standard educational materials:
      1. Structured Study Notes (incorporates headers, concise conceptual explanations).
      2. Flashcards (Questions & Answers).
      3. Multiple-Choice Quiz questions (with 4 options, a marked correct answer, and an in-depth pedagogical explanation of why it is correct).
      4. Frequently Asked Questions (FAQ).

      INPUT TEXT:
      """
      ${text}
      """

      You must return a JSON object matching this exact TypeScript structure:
      {
        "studyNotesText": "Markdown-formatted deep academic study guide summarizing concepts, processes, formulas, and histories with structural headers (e.g. ##, ###). Ensure this is comprehensive, engaging, and rich.",
        "flashcards": [
          { "question": "Clear concept question?", "answer": "Concise, precise answer." }
        ],
        "quizQuestions": [
          {
            "question": "Probing multiple choice question covering major claims?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "The exact string representing the correct option",
            "explanation": "Why this answer is scientifically correct, and why other options are incorrect."
          }
        ],
        "faqs": [
          { "question": "Commonly asked student question?", "answer": "Clear, direct teacher response." }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return {
      studyNotesText: parsedData.studyNotesText || 'Study notes unavailable.',
      flashcards: parsedData.flashcards || [],
      quizQuestions: parsedData.quizQuestions || [],
      faqs: parsedData.faqs || []
    };
  } catch (error) {
    console.error('Gemini Study Notes Error:', error);
    return getMockStudyNotes(text);
  }
};

// 4. WORD CONCEPT EXPLAINER (When clicking a hard word in-text)
export interface IWordExplanation {
  word: string;
  definition: string;
  analogy: string;
  example: string;
  contextUsage: string;
}

export const explainConcept = async (word: string, contextSentence: string): Promise<IWordExplanation> => {
  if (!genAI) {
    return getMockConceptExplanation(word, contextSentence);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an elite, child-friendly science educator.
      Explain the following difficult term/concept based on the context in which it was used.

      CONCEPT WORD: "${word}"
      CONTEXT SENTENCE: "${contextSentence}"

      You must return a JSON object matching this exact TypeScript structure:
      {
        "word": "${word}",
        "definition": "A simple, jargon-free definition explaining what this means to a 10-year-old.",
        "analogy": "An incredibly creative and fun real-world analogy (e.g. comparing it to baking a cake, building with Lego, or cosmic traffic).",
        "example": "A concrete real-world application where this word plays a role.",
        "contextUsage": "A brief explanation of what this word signifies specifically in the sentence provided."
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return {
      word: parsedData.word || word,
      definition: parsedData.definition || 'Simple explanation not available.',
      analogy: parsedData.analogy || 'Analogy not available.',
      example: parsedData.example || 'Example not available.',
      contextUsage: parsedData.contextUsage || 'Usage explanation not available.'
    };
  } catch (error) {
    console.error('Gemini Concept Explainer Error:', error);
    return getMockConceptExplanation(word, contextSentence);
  }
};


// ==========================================
// MOCK AI ENGINE FALLBACKS (RICH & REALISTIC)
// ==========================================

const getMockSimplification = (text: string, mode: string, language: string): ISimplifyResult => {
  // Simple NLP parser to get some words for terms
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
  const coreParagraph = sentences.slice(0, 3).join('. ') + '.';
  
  let simplifiedText = `[MOCK SIMPLIFICATION - ${mode.toUpperCase()} - ${language.toUpperCase()}]\n\n`;
  let steps: string[] = [];
  let score = 50;

  if (mode === 'child') {
    simplifiedText += `Imagine you are holding a giant magical box of crayons! Instead of talking in super heavy coding jargon, here is how it works: We are looking at a super neat way to read, learn, and absorb giant articles like lightning. This text is about sharing concepts, just like building cool towers out of toy blocks. One by one, we stack them up so anyone can understand them!`;
    steps = [
      "Find a massive, dusty book with hard words.",
      "Wave a magic wand to shrink the heavy sentences.",
      "Explain the ideas using toys, cookies, and rockets!"
    ];
    score = 82;
  } else if (mode === 'bullets') {
    simplifiedText += `• **Core Premise**: Reading complex literature takes too much time and contains unnecessary technical filler.\n• **The Solution**: Synthesize major points into direct, high-impact claims.\n• **Context Retention**: Core factual assertions are preserved while adjusting secondary syntax.\n• **Vocabulary Integration**: Difficult jargon is translated or annotated for easier access.`;
    steps = [
      "Identify key factual assertions in the article.",
      "Strip administrative and repetitive language.",
      "Index major points chronologically or by structural weight."
    ];
    score = 40;
  } else if (mode === 'professional_summary') {
    simplifiedText += `Executive Summary: The analyzed text outlines a methodology for improving cognitive reading velocity and informational digest rates. By utilizing adaptive linguistic models, users can bypass standard technical barriers, yielding a 3.5x reduction in conceptual acquisition latency while maintaining core contextual relevance for cross-functional stakeholders.`;
    steps = [
      "Deconstruct scientific nomenclature into industry-standard summaries.",
      "Summarize strategic business outcomes and technical impacts.",
      "Formulate key operational takeaways."
    ];
    score = 25;
  } else { // beginner or student
    simplifiedText += `This text discusses a highly structured approach to managing complex information. Essentially, when we encounter articles loaded with academic terms (difficult language), our brain spends more energy trying to parse the vocabulary than understanding the central concepts. This system solves that problem by breaking the article down, explaining the terms in parenthesis, and mapping the workflow step-by-step.`;
    steps = [
      "Scan the document for heavy academic phrases.",
      "Analyze structural difficulty and determine the reading index.",
      "Translate key terms into standard beginner-friendly grammar."
    ];
    score = 65;
  }

  // Key terms generated realistically
  const keyTerms: IKeyTerm[] = [
    {
      word: "Neural Network",
      definition: "A computer program that mimics how a human brain learns to solve complex problems.",
      analogy: "Like a giant team of little detectives passing notes to each other to figure out a mystery.",
      example: "How Netflix knows exactly what movie you want to watch next."
    },
    {
      word: "Algorithm",
      definition: "A set of step-by-step instructions given to a computer to accomplish a task.",
      analogy: "A recipe for baking a chocolate cake, detailing when to add eggs and when to stir.",
      example: "The exact directions GPS maps use to find the quickest route to school."
    }
  ];

  return {
    simplifiedText,
    keyTerms,
    explanationSteps: steps,
    difficultyScore: score
  };
};

const getMockSummary = (text: string): ISummaryResult => {
  return {
    oneLineSummary: "A futuristic AI-powered reader designed to bypass technical jargon and boost reading speed.",
    shortSummary: "This system deconstructs complex literature and re-authors it in simple terminology. It accelerates information absorption and is designed for researchers, students, and competitive learners alike.",
    mediumSummary: "The document details an innovative solution to the 'information fatigue' faced by students and researchers. By feeding heavy texts into a language engine, the system automatically translates scientific nomenclature, models methodology steps, generates summaries of different lengths, and provides audio read-outs. The core architecture uses next-generation language models to optimize cognitive load.",
    detailedSummary: "Detailed Technical Synthesis:\n1. Problem Statement: Modern academic publications and professional blogs contain high syntactic density, which increases reading friction and cognitive load. This results in longer comprehension timelines.\n2. Methodology: The application parses PDFs/URLs, feeds raw text into a specialized Prompt Engine (powered by Gemini), and returns highly structural breakdowns including ELI5 formats, glossary cards, and interactive quizzes.\n3. Outcomes: Users exhibit a measured 70% decrease in study notes preparation times, an average 2.5x increase in reading speed, and significantly better recall rates on mock assessments.",
    bulletSummaries: [
      "Synthesizes heavy documentation into digestible knowledge cards.",
      "Provides multiple simplification modes (ELI5, Student, Beginner).",
      "Features client-side audio TTS engines for multi-sensory reading.",
      "Includes a full revision suite containing flashcards and interactive quizzes."
    ],
    readingTimeMinutes: Math.max(1, estimateReadingTime(text)),
    keywords: ["Information Science", "AI Simplifier", "Academic Tutor", "Cognitive Load", "Speed Reading"],
    mainTopic: "AI Educational Technology"
  };
};

const getMockStudyNotes = (text: string): INotesResult => {
  const notesMarkdown = `# 📚 COMPLETE STUDY NOTES: INFORMATION SIMPLIFICATION

## 1. Core Principles
- **Cognitive Load Reduction**: The human working memory can only hold 4-7 pieces of information at once. Synthesizing dense articles into structured text reduces the strain on memory.
- **Scaffolded Learning**: Introducing concepts sequentially (e.g. definition first, then an analogy, then a real-world example) creates a learning scaffold that leads to deep mastery.

## 2. Key Methodologies
### A. Vocabulary Annotation
- Traditional reading forces a student to stop and look up words, disrupting flow.
- Active in-context hover explanations allow continuous reading, boosting speed by up to 250%.

### B. Active Recall & Revision
- Reading is passive. Flipping flashcards and answering quiz questions is active, forcing the brain to retrieve information.
- This active retrieval strengthens neural pathways and ensures long-term memory encoding.
`;

  const flashcards: IFlashcard[] = [
    {
      question: "What is the primary limit of human working memory?",
      answer: "The human working memory can typically only hold between 4 to 7 items or concepts simultaneously."
    },
    {
      question: "How does active recall differ from passive reading?",
      answer: "Passive reading is simply consuming information. Active recall requires your brain to actively retrieve information from memory, which builds stronger neural connections."
    },
    {
      question: "What is the purpose of educational scaffolding?",
      answer: "Scaffolding provides structured steps (like adding an analogy before a hard definition) to help a beginner safely build up to a complex topic."
    }
  ];

  const quizQuestions: IQuizQuestion[] = [
    {
      question: "Which of the following best describes the ELI5 simplification mode?",
      options: [
        "A highly academic summary utilizing professional jargon.",
        "A professional outline styled for corporate executives.",
        "An extremely simple explanation using rich analogies and friendly language.",
        "A multi-lingual translation with grammatical highlighting."
      ],
      correctAnswer: "An extremely simple explanation using rich analogies and friendly language.",
      explanation: "ELI5 stands for 'Explain Like I'm 5'. It utilizes simple vocabulary and rich, playful analogies so that even a child or complete beginner can quickly grasp the fundamental concepts."
    },
    {
      question: "Why is passive reading considered less effective than active quiz testing for exam preparation?",
      options: [
        "Passive reading does not use working memory at all.",
        "Quiz testing forces active recall, which consolidates long-term memory.",
        "Quizzes are easier and require less focus than reading.",
        "Reading articles takes zero cognitive energy."
      ],
      correctAnswer: "Quiz testing forces active recall, which consolidates long-term memory.",
      explanation: "Studies in cognitive psychology prove that testing yourself forces your brain to actively retrieve information, which creates far more robust neural memory traces than merely re-reading a textbook."
    }
  ];

  const faqs: IFAQ[] = [
    {
      question: "Does the AI change the core facts of the article?",
      answer: "No. The AI's prompt is designed to preserve 100% of the core facts and findings, modifying only the vocabulary, sentence complexity, and organizational structure."
    },
    {
      question: "What formats can I export my study materials in?",
      answer: "You can easily copy any text to your clipboard, download the full simplified layouts as PDFs, or export them as Word DOCX files."
    }
  ];

  return {
    studyNotesText: notesMarkdown,
    flashcards,
    quizQuestions,
    faqs
  };
};

const getMockConceptExplanation = (word: string, contextSentence: string): IWordExplanation => {
  return {
    word: word,
    definition: `A simple, easy-to-understand representation of "${word}" in general contexts.`,
    analogy: `Imagine a tiny librarian inside your mind organizing folders. "${word}" acts like a giant colored bookmark in the librarian's drawer, letting them instantly grab the right book!`,
    example: `How you recognize your dog's bark out of a hundred other sounds.`,
    contextUsage: `In the sentence "${contextSentence}", the word "${word}" is used to indicate a key mechanism that simplifies dense structures.`
  };
};
