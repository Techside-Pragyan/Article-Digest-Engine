# 🌌 AI Article Simplifier

Welcome to the **AI Article Simplifier**, a state-of-the-art, premium AI SaaS application built to simplify difficult texts, research papers, news, and complex articles into digestible explanations. Whether you are a student, AI/ML learner, or curious general reader, this application behaves like a dedicated intelligent personal tutor.

Designed with **ultra-modern glassmorphic styles**, glowing gradients, typing indicators, interactive graphs, and smooth Framer Motion animations.

---

## 🚀 Features

1. **AI Simplification Engine**: Translates complex text/jargon into several levels: *Child (ELI5)*, *Beginner*, *Student*, and *Professional Bullet Summary*.
2. **Interactive Concept Explainer**: Highlights difficult terms within text. Clicking any word fetches definitions, real-world analogies, and step-by-step breakdowns.
3. **Smart Summary Generator**: Generates reading time estimations, key terms list, one-line, short, medium, or comprehensive bullet-point digests.
4. **AI Research Paper Simplifier**: Tailor-made parsing interface that decomposes research abstracts, methodology, findings, and complex inline formulas.
5. **AI Study Notes & Revision Center**: Automatically builds study guides, dynamic flashcards with click-to-flip motion, and interactive multiple-choice quizzes with grading feedback.
6. **Multi-Language Simplification**: Simplifies and translates concurrently across English, Hindi, Odia, Bengali, Spanish, and French.
7. **Client-Side Text-To-Speech (TTS)**: Seamless voice playback controls, voice selection, and speed regulators.
8. **Dashboard & Metrics**: Tracks time saved, words simplified, vocabulary expansion charts, and bookmarks history.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts/ChartJS.
- **Backend**: Node.js, Express, Mongoose (MongoDB), Cheerio (Web Scraper), PDF-Parse, Mammoth (DOCX parser).
- **AI Core**: Google Gemini 1.5 Flash / 1.5 Pro.
- **Authentication**: JWT local secure session storing encrypted records in MongoDB.

---

## 🎛️ Quick Start Guide

### Prerequisites
- Node.js (version 18+)
- MongoDB running locally (or MongoDB Atlas URI)
- Google Gemini API Key (Optional: A robust local mock service activates automatically if no key is provided!)

### Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Techside-Pragyan/Article-Digest-Engine.git
   cd Article-Digest-Engine
   ```

2. **Install Dependencies**
   Install root, frontend, and backend packages with a single command:
   ```bash
   npm run install:all
   ```

3. **Set Up Environments**
   Create a `.env` in the `backend/` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/simplifier
   JWT_SECRET=futuristic_quantum_secret_key_990
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Launch Application**
   Run both frontend and backend concurrently in developer mode:
   ```bash
   npm run dev
   ```
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend**: [http://localhost:5000](http://localhost:5000)

---

## 📂 Repository Layout
Refer to the `implementation_plan.md` in the brain history for complete service code mappings and controller structures.

Enjoy reading faster and smarter! 🌌
