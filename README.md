# Melissa AI - Business Development Chatbot

<div align="center">

![Melissa AI](https://img.shields.io/badge/Melissa-AI-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

**Your Expert AI Assistant for Business Development, Strategy, and Execution**

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [Usage](#usage) • [Documentation](#documentation)

</div>

---

## 🎯 Overview

Melissa AI is an AI-powered conversational chatbot focused on business development. It combines proprietary internal business content with OpenAI language models to deliver accurate, structured, and actionable business guidance.

### Key Benefits

- ✅ **Intelligent Responses** - Powered by OpenAI GPT-4 with RAG (Retrieval Augmented Generation)
- 📚 **Knowledge Integration** - Upload PDFs, DOCX files, or import web content
- 🎯 **Business-Focused** - Specialized in strategy, growth, marketing, sales, and operations
- 🔒 **Secure & Private** - Local vector storage with secure API key management
- 🎨 **Premium UI** - Modern, responsive design with glassmorphism effects
- 📱 **Embeddable Widget** - Easy integration into any website

---

## ✨ Features

### For Users

- **Natural Language Chat** - Ask questions in plain English
- **Multi-turn Conversations** - Context-aware follow-up discussions
- **Actionable Guidance** - Structured, practical business advice
- **Fast Responses** - Under 3 seconds response time
- **Mobile Responsive** - Works on all devices

### For Admins

- **Content Management** - Upload and manage proprietary documents
- **Analytics Dashboard** - Track usage and knowledge base metrics
- **Document Processing** - Automatic chunking and embedding
- **Re-indexing** - Update embeddings on demand
- **Web Scraping** - Import content from URLs

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone or navigate to the project folder**
   ```bash
   cd "Melissa AI-Business Development Chatbot"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your OpenAI API key
   # OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Or production mode
   npm start
   ```

5. **Access the application**
   - Main Chat: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin.html
   - Widget Demo: http://localhost:3000/widget.html

---

## 📖 Usage Guide

### Chat Interface

1. **Start Chatting**
   - Click on suggestion cards or type your question
   - Press Enter or click send
   - Get instant, AI-powered responses

2. **Example Questions**
   - "How do I create an effective go-to-market strategy?"
   - "What are the key metrics for a SaaS startup?"
   - "How should I price my product?"
   - "What are best practices for scaling operations?"

### Admin Dashboard

**Default Credentials:**
- Username: `admin`
- Password: `admin123`
- ⚠️ **Change these in production!**

**Admin Features:**

1. **Upload Documents**
   - Click "Choose File" and select PDF, DOCX, or TXT
   - Documents are automatically processed and indexed
   - Each document is chunked for optimal retrieval

2. **Import from URL**
   - Enter any public webpage URL
   - Content is extracted and indexed automatically

3. **Manage Knowledge Base**
   - View all uploaded documents
   - Delete individual documents
   - Re-index all documents
   - Clear entire knowledge base

### Embeddable Widget

Add Melissa AI to any website:

```html
<!-- Add to your website -->
<iframe 
  src="http://your-domain.com/widget.html" 
  style="position: fixed; bottom: 0; right: 0; width: 450px; height: 700px; border: none; z-index: 9999;"
></iframe>
```

---

## 🏗️ Project Structure

```
Melissa AI-Business Development Chatbot/
├── server/
│   ├── index.js              # Main server file
│   ├── routes/
│   │   ├── chat.js          # Chat API endpoints
│   │   ├── admin.js         # Admin API endpoints
│   │   └── upload.js        # Document upload endpoints
│   └── services/
│       ├── openai.js        # OpenAI integration
│       ├── vectorStore.js   # Vector database
│       └── documentProcessor.js  # Document processing
├── public/
│   ├── index.html           # Main chat interface
│   ├── admin.html           # Admin dashboard
│   ├── widget.html          # Embeddable widget
│   ├── css/
│   │   ├── styles.css       # Main styles
│   │   ├── admin.css        # Admin styles
│   │   └── widget.css       # Widget styles
│   └── js/
│       ├── app.js           # Main app logic
│       ├── admin.js         # Admin logic
│       └── widget.js        # Widget logic
├── data/
│   └── vectors/
│       └── store.json       # Vector database (auto-created)
├── uploads/                 # Temporary file uploads
├── package.json
├── .env.example
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following:

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
PORT=3000
JWT_SECRET=your_jwt_secret_here_change_in_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# For production vector database (optional)
# PINECONE_API_KEY=your_pinecone_api_key
# PINECONE_ENVIRONMENT=your_pinecone_environment
# PINECONE_INDEX=melissa-ai-index
```

### Customization

**System Prompt:**  
Edit `server/services/openai.js` to customize the AI's personality and rules.

**Styling:**  
Modify CSS files in `public/css/` to match your brand.

**Model Selection:**  
Change `model` in `server/services/openai.js` (e.g., `gpt-4`, `gpt-3.5-turbo`)

---

## 📚 API Reference

### Chat Endpoint

```http
POST /api/chat
Content-Type: application/json

{
  "message": "How do I price my product?",
  "conversationId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "response": "AI-generated response here...",
  "conversationId": "conv_123456",
  "responseTime": 1234,
  "contextUsed": true,
  "relevantDocuments": 2
}
```

### Upload Document

```http
POST /api/upload
Content-Type: multipart/form-data

file: [PDF/DOCX/TXT file]
```

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <token>` header.

- `POST /api/admin/login` - Admin login
- `GET /api/admin/documents` - List all documents
- `DELETE /api/admin/document/:id` - Delete document
- `POST /api/admin/reindex` - Re-index all documents
- `GET /api/admin/analytics` - Get analytics

---

## 🚢 Deployment

### Frontend (Netlify/Vercel)

1. Build is not required (static files)
2. Deploy the `public/` folder
3. Set environment variables in hosting platform

### Backend (Render/Railway/Heroku)

1. Set environment variables
2. Deploy with `npm start`
3. Ensure `PORT` is set correctly

### Full-Stack (Single Server)

The app serves both frontend and backend from the same server. Just deploy and access!

---

## 🔒 Security Notes

⚠️ **Important Security Considerations:**

1. **Change Default Credentials** - Update `ADMIN_USERNAME` and `ADMIN_PASSWORD`
2. **Use Strong JWT Secret** - Generate a secure random string for `JWT_SECRET`
3. **HTTPS in Production** - Always use HTTPS for production deployments
4. **Rate Limiting** - Consider adding rate limiting to prevent abuse
5. **API Key Protection** - Never commit `.env` file to version control

---

## 🎨 Design Features

- **Dark Mode** - Elegant dark theme by default
- **Glassmorphism** - Modern frosted glass effects
- **Smooth Animations** - Micro-interactions for better UX
- **Gradient Accents** - Beautiful purple gradient theme
- **Responsive Design** - Mobile-first, works on all screen sizes
- **Premium Typography** - Inter and Space Grotesk fonts

---

## 📝 System Prompt & Guardrails

Melissa AI follows strict guidelines:

**Allowed Scope:**
- Strategy and growth
- Revenue and pricing
- Marketing and sales
- Operations and scaling
- Financial planning
- Fundraising and leadership

**Guardrails:**
- ❌ No legal, tax, or investment advice
- ❌ No fabricated information
- ❌ No hallucinated policies or documents
- ✅ Clearly states assumptions
- ✅ Says "I don't have enough information" when unsure

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Node.js, Express
- **AI:** OpenAI GPT-4, OpenAI Embeddings
- **Vector Store:** In-memory JSON (upgradeable to Pinecone)
- **Document Processing:** pdf-parse, mammoth, cheerio
- **Authentication:** JWT, bcryptjs

---

## 📈 Future Enhancements

- [ ] React Native mobile app
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Conversation export
- [ ] Advanced analytics
- [ ] Team collaboration features
- [ ] Integration with business tools (Slack, Teams)
- [ ] Pinecone vector database integration

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - Feel free to use this for commercial or personal projects.

---

## 🙋 Support

For issues or questions:
1. Check the documentation
2. Review the code comments
3. Open an issue on GitHub

---

<div align="center">

**Built with ❤️ for entrepreneurs and business leaders**

[⬆ Back to Top](#melissa-ai---business-development-chatbot)

</div>
