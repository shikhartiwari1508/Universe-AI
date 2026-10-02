# 🌌 UNIVERSE AI

### Intelligent AI Assistant powered by Google Gemini

<p align="center">
  <strong>A modern AI chatbot for learning, coding, problem solving and exploring ideas.</strong>
</p>

<p align="center">

<a href="https://universe-ai-58di.onrender.com/">
<img src="https://img.shields.io/badge/🌐%20Live%20Demo-UNIVERSE%20AI-orange?style=for-the-badge">
</a>

<img src="https://img.shields.io/badge/AI-Google%20Gemini-blue?style=for-the-badge">

<img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge">

<img src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JavaScript-yellow?style=for-the-badge">

<img src="https://img.shields.io/badge/Deployment-Render-purple?style=for-the-badge">

</p>

---

## 🚀 About

**UNIVERSE AI** is a web-based AI assistant built with **Python, FastAPI, HTML, CSS and JavaScript**, using **Google Gemini** as its AI provider.

The application provides an interactive chat interface where users can ask questions, learn concepts, work with programming problems, generate ideas and explore different topics through natural-language conversations.

The project includes both a local development setup and a publicly deployed web version.

---

## ✨ Features

### 🤖 AI Chat
- Google Gemini powered responses
- Natural-language conversations
- Conversation history
- New chat creation
- Delete conversations
- Streaming-style response display

### 💻 Coding & Learning
- Programming questions
- Python code generation
- Code explanations
- Concept explanations
- Beginner-friendly learning assistance
- Project idea generation

### 📎 File Support
- Upload text files
- Upload PDF files
- Extract text from supported files
- Use uploaded content during conversations

### 🎙️ Voice
- Voice input
- Browser speech recognition
- Text-to-speech support

### 💬 Conversation Tools
- Search conversations
- Export conversations
- Copy AI responses
- Conversation timestamps
- Character counter
- Typing indicator

### 🎨 User Interface
- Futuristic AI interface
- Responsive design
- Dark/light theme
- Mobile sidebar
- Fullscreen mode
- Interactive prompt cards
- Notification sound option

### 🔐 Configuration & Security
- Gemini API key through environment variables
- `.env` excluded through `.gitignore`
- Local database excluded from Git
- API credentials are not stored in source code

---

## 🧠 Architecture

```text
┌──────────────────────────────┐
│          USER                │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       UNIVERSE AI            │
│   HTML + CSS + JavaScript    │
└──────────────┬───────────────┘
               │
               │ HTTP / API
               ▼
┌──────────────────────────────┐
│          FastAPI             │
│        backend/main.py       │
└──────────────┬───────────────┘
               │
               │ Gemini API
               ▼
┌──────────────────────────────┐
│       Google Gemini          │
│      AI Model / API          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       AI Response            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          USER                │
└──────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- Google Fonts
- Browser Web APIs

### Backend

- Python
- FastAPI
- Uvicorn
- SQLite
- Pydantic
- HTTP requests

### AI

- Google Gemini
- Gemini Interactions API

### File Processing

- PyPDF

### Deployment

- GitHub
- Render

---

## 📁 Project Structure

```text
Universe-AI/
│
├── backend/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   └── index.html
│
├── static/
│   ├── favicon.svg
│   ├── script.js
│   └── style.css
│
├── .gitignore
├── Start_Universe_AI.bat
│
├── robots.txt
├── sitemap.xml
├── google7f0479994c6a88dd.html
│
└── README.md
```

> Runtime files such as the local SQLite database, Python cache files and environment files are intentionally excluded from Git.

---

# ⚙️ Local Setup

## 1. Clone the Repository

```bash
git clone https://github.com/shikhartiwari1508/Universe-AI.git
```

Go into the project:

```bash
cd Universe-AI
```

---

## 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

---

## 3. Install Backend Dependencies

Move into the backend directory:

```bash
cd backend
```

Install the required packages:

```bash
pip install -r requirements.txt
```

---

## 4. Configure Google Gemini

Create a `.env` file inside the `backend` directory and add your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

**Never upload your API key to GitHub.**

---

## 5. Start the Backend

From the project root:

```bash
uvicorn backend.main:app --reload
```

The application will be available at:

```text
http://127.0.0.1:8000
```

You can also use the included Windows startup file:

```text
Start_Universe_AI.bat
```

---

# 🌐 Live Demo

Try the deployed version of UNIVERSE AI:

**https://universe-ai-58di.onrender.com/**

---

# 🔌 API Endpoints

The FastAPI backend currently provides endpoints for:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Check backend and Gemini status |
| `/api/chats` | POST | Create a conversation |
| `/api/chats` | GET | Retrieve conversations |
| `/api/chats/{session_id}` | GET | Retrieve a conversation |
| `/api/chats/{session_id}` | DELETE | Delete a conversation |
| `/api/chat` | POST | Send a message to the AI |
| `/api/upload` | POST | Upload supported files |

The backend also serves the frontend application.

---

# 🔑 Environment Variables

The application uses environment variables for sensitive configuration.

```env
GEMINI_API_KEY=your_api_key_here
```

The `.env` file should remain local and must not be committed to GitHub.

---

# ☁️ Deployment

UNIVERSE AI is deployed as a web service using **Render**.

The application is connected to the GitHub repository, allowing updates pushed to the repository to be deployed through the configured Render service.

### Production URL

```text
https://universe-ai-58di.onrender.com/
```

---

# 🔎 SEO

The deployed application includes basic search-engine configuration:

- SEO title
- Meta description
- Canonical URL
- Robots meta tag
- `robots.txt`
- `sitemap.xml`
- Google Search Console verification
- JSON-LD structured data
- WebApplication structured data

These configurations help search engines crawl and understand the public homepage.

---

# 🎯 Project Objectives

UNIVERSE AI was created as a practical full-stack AI project to explore:

- Generative AI integration
- Google Gemini API integration
- FastAPI backend development
- Frontend development with vanilla JavaScript
- REST API communication
- File processing
- Conversation storage
- Git and GitHub
- Cloud deployment
- Search-engine discoverability

---

# 🔮 Future Improvements

Planned improvements may include:

- 🧠 Improved long-term conversation memory
- 🔐 User authentication
- ☁️ Cloud-based conversation storage
- 🖼️ Image understanding
- 📄 More advanced document processing
- 🌍 Multi-language support
- 📱 Progressive Web App support
- 📊 Usage and analytics features

---

# 👨‍💻 Developer

## Shikhar Tiwari

**BCA-MCA Data Science Student**

Interested in:

- Artificial Intelligence
- Machine Learning
- Data Science
- Python
- FastAPI
- Generative AI
- Web Development

### 🔗 Profiles

**GitHub**  
https://github.com/shikhartiwari1508

**LinkedIn**  
https://linkedin.com/in/shikhar-tiwari-222007372

**Portfolio**  
https://shikhartiwari1508.github.io/Shikhar_Tiwari-Portfolio/

---

## ⭐ Support

If you find **UNIVERSE AI** interesting, consider giving the repository a ⭐ on GitHub.

---

<p align="center">

### 🌌 UNIVERSE AI

**Explore • Learn • Create**

Built with Python, FastAPI & Google Gemini.

</p>