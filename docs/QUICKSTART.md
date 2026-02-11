# Quick Start Guide - Melissa AI

## 🚀 Getting Started in 3 Minutes

### Step 1: Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

### Step 2: Configure Your API Key

Open the `.env` file in the project root and replace the placeholder:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### Step 3: Start the Server

```bash
npm run dev
```

### Step 4: Access the Application

Open your browser and visit:

- **Main Chat Interface:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin.html
  - Username: `admin`
  - Password: `admin123`
- **Widget Demo:** http://localhost:3000/widget.html

---

## 📝 What to Do First

### 1. Upload Some Business Content

1. Go to http://localhost:3000/admin.html
2. Login with `admin` / `admin123`
3. Upload a business-related PDF, DOCX, or TXT file
4. Or enter a URL to import web content (try a business blog post)

**Suggested Content to Upload:**
- Business strategy documents
- Marketing playbooks
- Sales guides
- Product documentation
- Industry reports

### 2. Start Chatting

1. Go to http://localhost:3000
2. Try these example questions:
   - "How do I create a go-to-market strategy?"
   - "What are important SaaS metrics to track?"
   - "How should I price my product?"
   - "What are best practices for customer acquisition?"

### 3. Test the Widget

1. Go to http://localhost:3000/widget.html
2. Click the chat button in the bottom-right
3. Start a conversation

---

## 🎯 Tips for Best Results

### For Better AI Responses:

✅ **Upload relevant content** - The more business content you upload, the better the responses  
✅ **Be specific** - Ask detailed questions about your business challenges  
✅ **Provide context** - Mention your industry, stage, or specific situation  
✅ **Follow up** - Ask follow-up questions to dive deeper  

### Example Good Questions:

- "I'm launching a B2B SaaS product for small businesses. What should my pricing strategy be?"
- "Our customer acquisition cost is $200 but LTV is only $150. How do we fix this?"
- "What are the key metrics we should track in our first 6 months?"

---

## ⚙️ Customization

### Change Admin Credentials

Edit `.env`:
```env
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
```

### Customize AI Personality

Edit `server/services/openai.js` and modify the `SYSTEM_PROMPT` constant.

### Change Colors/Design

Edit CSS files in `public/css/`:
- `styles.css` - Main chat interface
- `admin.css` - Admin dashboard
- `widget.css` - Chat widget

---

## 🔧 Troubleshooting

### "Failed to generate response"

- Check that your OpenAI API key is correct in `.env`
- Ensure you have credits in your OpenAI account
- Check the terminal for error messages

### "Port 3000 is already in use"

Change the port in `.env`:
```env
PORT=3001
```

### Documents not uploading

- Check file size (max 10MB)
- Ensure file type is PDF, DOCX, or TXT
- Check terminal for error messages

---

## 📚 Next Steps

1. **Deploy to Production**
   - See deployment section in README.md
   - Use Render, Railway, or Heroku for backend
   - Use Netlify or Vercel for frontend (if separating)

2. **Add More Features**
   - Integrate with Slack or Teams
   - Add conversation export
   - Implement user analytics

3. **Upgrade Vector Store**
   - Switch to Pinecone for production
   - Better scalability and performance

---

## 🆘 Need Help?

Check the main README.md for:
- Full API documentation
- Deployment guides
- Security best practices
- Architecture details

---

**You're all set! Start building your AI-powered business assistant! 🚀**
