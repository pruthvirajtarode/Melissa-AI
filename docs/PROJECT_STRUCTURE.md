# Project Structure

This document describes the organization of the MellissAI Business Development Chatbot codebase.

## 📁 Directory Overview

```
MellissAI-Business Development Chatbot/
│
├── frontend/              # All frontend files (HTML, CSS, JS)
│   ├── index.html        # Main chat interface
│   ├── admin.html        # Admin dashboard
│   ├── widget.html       # Embeddable widget
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JavaScript
│   ├── images/           # Static assets
│   ├── manifest.json     # PWA manifest
│   └── README.md         # Frontend documentation
│
├── backend/              # All backend files (Node.js/Express)
│   ├── index.js          # Express server entry point
│   ├── routes/           # API route handlers
│   │   ├── admin.js      # Admin endpoints
│   │   ├── chat.js       # Chat endpoints
│   │   └── upload.js     # Upload endpoints
│   ├── services/         # Business logic
│   │   ├── aiService.js
│   │   ├── documentProcessor.js
│   │   └── vectorStore.js
│   ├── scripts/          # Utility scripts
│   ├── data/             # Vector database storage
│   ├── uploads/          # Temporary file uploads
│   ├── sample-content/   # Sample documents
│   └── README.md         # Backend documentation
│
├── android/              # Android app files (Capacitor)
├── dist/                 # Build output
├── node_modules/         # NPM dependencies
│
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
│
├── package.json          # NPM package configuration
├── package-lock.json     # NPM lock file
├── nodemon.json          # Nodemon configuration
│
├── electron.js           # Electron app configuration
├── capacitor.config.ts   # Capacitor configuration
├── capacitor.config.json # Capacitor JSON config
│
├── vercel.json           # Vercel deployment config
│
├── README.md             # Main project README
├── PROJECT_STRUCTURE.md  # This file
├── PROJECT_SUMMARY.md    # Project summary
├── QUICKSTART.md         # Quick start guide
├── DEPLOYMENT.md         # Deployment instructions
├── DEPLOYMENT_OPTIONS.md # Deployment platform options
├── TROUBLESHOOTING.md    # Common issues and solutions
├── USER_GUIDE.md         # User guide
├── WIDGET_INTEGRATION.md # Widget integration guide
└── MOBILE_APP.md         # Mobile app documentation

```

## 🎯 Key Components

### Frontend (`/frontend`)
- **Purpose**: User interface for the chatbot
- **Technologies**: HTML5, CSS3, Vanilla JavaScript
- **Entry Points**:
  - `index.html` - Main chat application
  - `admin.html` - Admin dashboard
  - `widget.html` - Embeddable widget

### Backend (`/backend`)
- **Purpose**: API server and business logic
- **Technologies**: Node.js, Express, OpenAI API
- **Entry Point**: `index.js`
- **Port**: 3000 (configurable via .env)

## 🚀 NPM Scripts

- `npm start` - Start production server (runs `backend/index.js`)
- `npm run dev` - Start development server with hot reload
- `npm run electron` - Run Electron desktop app
- `npm run dist` - Build Electron app for distribution

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | NPM configuration and dependencies |
| `nodemon.json` | Nodemon watch configuration |
| `vercel.json` | Vercel deployment configuration |
| `capacitor.config.ts` | Capacitor mobile app config |
| `electron.js` | Electron desktop app config |
| `.env` | Environment variables (local only) |

## 📝 Documentation Files

- **README.md** - Main project documentation
- **QUICKSTART.md** - Quick start guide
- **DEPLOYMENT.md** - Deployment instructions
- **TROUBLESHOOTING.md** - Common issues
- **USER_GUIDE.md** - User instructions
- **WIDGET_INTEGRATION.md** - Widget integration guide
- **MOBILE_APP.md** - Mobile app setup

## 🌐 Deployment Targets

1. **Web** (Vercel)
   - Frontend served from `/frontend`
   - Backend API at `/api/*`

2. **Desktop** (Electron)
   - Packaged app with embedded server
   - Entry point: `electron.js`

3. **Mobile** (Capacitor)
   - Android/iOS apps
   - Connects to deployed web backend

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
```

## 📦 Dependencies

### Production
- `express` - Web server framework
- `openai` - OpenAI API client
- `multer` - File upload handling
- `cors` - CORS middleware
- `dotenv` - Environment variables

### Development
- `nodemon` - Development server with hot reload
- `electron` - Desktop app framework
- `@capacitor/cli` - Mobile app CLI

## 🎨 Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Frontend  │─────▶│   Backend    │─────▶│  OpenAI API │
│  (Browser)  │◀─────│  (Express)   │◀─────│   (GPT-4)   │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Vector Store │
                     │    (RAG)     │
                     └──────────────┘
```

## 🔄 Recent Changes

**Separation of Frontend and Backend** (2026-02-11)
- Moved all frontend files from `frontend/` to `frontend/`
- Moved all backend files from `server/` to `backend/`
- Updated all configuration files to reflect new structure
- Created separate README files for frontend and backend

## 📖 Additional Resources

- See `frontend/README.md` for frontend-specific documentation
- See `backend/README.md` for backend-specific documentation
- See `DEPLOYMENT.md` for deployment instructions
