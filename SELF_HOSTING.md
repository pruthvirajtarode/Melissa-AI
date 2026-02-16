# Self-Hosting Guide - MellissAI

MellissAI is designed to be easily self-hosted on your own infrastructure (VPS, Local Server, or Cloud).

## Prerequisites
- Node.js 18 or higher
- OpenAI API Key
- Basic knowledge of terminal/command prompt

## Option 1: Manual Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd "MellissAI-Business-Development-Chatbot"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key_here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

5. **Access the application**:
   - Chat Interface: `http://localhost:3000`
   - Admin Dashboard: `http://localhost:3000/admin.html`

## Option 2: Docker (Easiest)

1. **Create a `docker-compose.yml` file**:
   ```yaml
   version: '3.8'
   services:
     melissa-ai:
       build: .
       ports:
         - "3000:3000"
       environment:
         - OPENAI_API_KEY=your_openai_api_key_here
         - ADMIN_USERNAME=admin
         - ADMIN_PASSWORD=admin_password
       volumes:
         - ./data:/app/data
         - ./frontend/images/uploads:/app/frontend/images/uploads
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

## Production Recommendations
- **SSL**: Always use a reverse proxy like Nginx or Caddy to provide HTTPS.
- **Backups**: Regularly backup the `data/` directory which contains your knowledge base and settings.
- **Process Management**: Use `pm2` for manual installations to ensure the server stays running.
