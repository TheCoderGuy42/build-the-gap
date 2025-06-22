# Build the Gap - Project Story

## Inspiration 💡

The inspiration for **Build the Gap** came from recognizing a fundamental challenge in education and professional development: the difficulty of creating engaging, personalized quizzes from various content sources. Whether you're a student trying to study from research papers, a professional learning from documentation, or an educator creating assessments, manually crafting quiz questions is time-consuming and often ineffective.

We envisioned a seamless solution that could instantly transform any PDF document or web page into an interactive quiz, making learning more accessible and engaging. The name "Build the Gap" reflects our mission to bridge the gap between passive content consumption and active learning through AI-powered quiz generation.

## What We Built 🚀

**Build the Gap** is a comprehensive AI-powered quiz generation platform that includes:

### Core Features:

- **PDF-to-Quiz Conversion**: Upload any PDF document and get AI-generated multiple-choice questions
- **Web-to-Quiz Conversion**: Enter any URL and generate quizzes from web content
- **Interactive Quiz Taking**: Clean, modern interface for taking quizzes with real-time scoring
- **User Authentication**: Secure user accounts with personal quiz libraries
- **Quiz Management**: Save, view, and delete your generated quizzes
- **Browser Extension**: One-click quiz generation from any webpage you're browsing

### Technical Architecture:

- **Frontend**: Next.js 15 with React 19, TypeScript, and Tailwind CSS
- **Backend**: tRPC for type-safe APIs with Express-like routing
- **AI Integration**: Google Gemini 2.0 Flash for intelligent content analysis and quiz generation
- **Database**: PostgreSQL with Prisma ORM for robust data management
- **Authentication**: Better Auth for secure user management
- **File Storage**: AWS S3 for PDF storage with presigned URLs
- **Content Processing**: Cheerio for HTML parsing and text extraction

## How We Built It 🛠️

### 1. **Foundation Setup**

We started with the T3 Stack (Next.js, TypeScript, Tailwind, tRPC, Prisma) for rapid, type-safe development. This gave us a solid foundation with modern React patterns and full-stack TypeScript.

### 2. **AI Integration**

The core innovation was integrating Google Gemini 2.0 Flash with structured output configuration. We designed a sophisticated prompt system that ensures consistent, high-quality quiz generation with proper JSON formatting.

### 3. **File Processing Pipeline**

- **PDFs**: Implemented S3 upload with presigned URLs, then base64 encoding for AI processing
- **Web Content**: Built a web scraping system using Cheerio to extract meaningful text from HTML pages
- **Content Sanitization**: Ensured clean, relevant content reaches the AI model

### 4. **Database Design**

Created a relational schema with Users, Quizzes, and Questions tables, ensuring proper data relationships and user isolation for privacy.

### 5. **Interactive Quiz Experience**

Built a React-based quiz interface with:

- Question navigation
- Answer selection and validation
- Real-time scoring
- Results visualization

### 6. **Browser Extension**

Developed a Chrome extension that captures the current tab's URL and redirects to our platform for instant quiz generation.

## Challenges We Faced 🎯

### 1. **AI Response Consistency**

**Challenge**: Getting consistent, properly formatted responses from the AI model.
**Solution**: Implemented structured output configuration with strict JSON schemas and robust error handling for response parsing.

### 2. **Content Extraction Quality**

**Challenge**: Extracting meaningful content from diverse PDF and HTML sources.
**Solution**: Used Cheerio for HTML parsing to focus on body content, and implemented proper base64 encoding for PDF processing.

### 3. **User Experience Flow**

**Challenge**: Creating an intuitive flow from content upload to quiz completion.
**Solution**: Designed a clean, single-page application with toast notifications and loading states to guide users through each step.

### 4. **Authentication & Data Security**

**Challenge**: Ensuring users can only access their own quizzes and data.
**Solution**: Implemented Better Auth with protected procedures and user-scoped database queries.

### 5. **File Upload Optimization**

**Challenge**: Handling large PDF files efficiently.
**Solution**: Used AWS S3 with presigned URLs to handle uploads client-side, reducing server load.

## What We Learned 📚

- **AI Integration Best Practices**: Learned the importance of structured prompts and response validation when working with language models
- **Modern React Patterns**: Gained experience with React 19 features and Next.js 15 optimization techniques
- **Type-Safe Full-Stack Development**: Deepened understanding of tRPC for end-to-end type safety
- **Cloud Services Integration**: Hands-on experience with AWS S3 and managing file uploads at scale
- **Browser Extension Development**: Understanding Chrome extension APIs and cross-origin communication
- **Database Design for Multi-User Applications**: Proper data isolation and relationship modeling

## Built With 🧰

### **Languages & Frameworks**

- **TypeScript** - Type-safe development across the entire stack
- **Next.js 15** - React framework with app router and server components
- **React 19** - Latest React features and hooks
- **Node.js** - Server-side JavaScript runtime

### **Styling & UI**

- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Elegant notification system

### **Backend & APIs**

- **tRPC** - End-to-end typesafe APIs
- **Prisma** - Next-generation ORM for database management
- **Better Auth** - Modern authentication solution
- **Zod** - TypeScript-first schema validation

### **Database & Cloud Services**

- **PostgreSQL** - Robust relational database
- **AWS S3** - Scalable file storage
- **Google Gemini 2.0 Flash** - Advanced AI model for content generation

### **Developer Tools**

- **ESLint & Prettier** - Code quality and formatting
- **pnpm** - Fast, disk space efficient package manager
- **Prisma Studio** - Database GUI for development

### **Browser Integration**

- **Chrome Extension APIs** - Browser extension development
- **Cheerio** - Server-side HTML parsing

## Try It Out 🌐

### **Live Application**

- **Main Platform**: [Your deployed URL here]
- **Source Code**: [GitHub Repository](https://github.com/[your-username]/build-the-gap)

### **Browser Extension**

1. Clone the repository
2. Load the `extension` folder as an unpacked extension in Chrome
3. Click the extension icon on any webpage to generate a quiz

### **Local Development**

```bash
# Clone the repository
git clone https://github.com/[your-username]/build-the-gap

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Start the database
./start-database.sh

# Run database migrations
pnpm db:migrate

# Start the development server
pnpm dev
```

### **Demo Features**

- Upload a PDF document and watch it transform into an interactive quiz
- Enter any educational website URL to generate questions
- Take quizzes with immediate feedback and scoring
- Use the browser extension for one-click quiz generation

---

_Built with ❤️ for [Hackathon Name] - Making learning more interactive and accessible through AI._
