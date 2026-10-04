# 🌌 UNIVERSE AI

<p align="center">

<img src="https://img.shields.io/badge/Universe%20AI-Intelligent%20Assistant-orange?style=for-the-badge&logo=google-gemini&logoColor=white" alt="Universe AI">

<img src="https://img.shields.io/badge/AI-Gemini-blue?style=for-the-badge" alt="Gemini AI">

<img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">

<img src="https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">

<img src="https://img.shields.io/badge/Platform-Web%20%7C%20Android-black?style=for-the-badge" alt="Platforms">

</p>

<p align="center">
  <strong>A modern AI-powered intelligent assistant built with FastAPI, Gemini AI and a responsive web interface.</strong>
</p>

<p align="center">
  <a href="https://universe-ai-58di.onrender.com/">🌐 Live Demo</a>
  •
  <a href="https://github.com/shikhartiwari1508/Universe-AI">💻 GitHub</a>
  •
  <a href="https://github.com/shikhartiwari1508/Universe-AI/releases">📦 Releases</a>
</p>

---

## 🚀 About Universe AI

**Universe AI** is an AI-powered intelligent assistant designed to provide a smooth, modern and interactive conversational experience.

The project combines a **FastAPI backend**, **Google Gemini AI**, **SQLite-based conversation storage**, document upload support and a responsive frontend that can be accessed from both **web browsers and Android devices**.

Universe AI is designed to work like a personal AI assistant where users can:

- 💬 Start and continue conversations
- 🧠 Ask questions and receive AI-generated responses
- 🗂️ Maintain separate conversations
- ✨ Create new chats whenever required
- 📄 Upload PDF and TXT documents
- 🔎 Ask questions based on uploaded content
- 🗑️ Delete conversations
- 📱 Use the assistant through an Android APK
- 🌐 Access the application through the web

---

# ✨ Features

## 🤖 AI-Powered Conversations

Universe AI uses **Google Gemini** to generate intelligent responses.

Users can interact with the assistant naturally and ask questions about:

- Programming
- Education
- General knowledge
- Projects
- Technical concepts
- Documents
- Problem solving
- Everyday tasks

---

## 💬 ChatGPT-Style Conversation System

Universe AI provides a conversation-based interface.

Each conversation has its own session and message history.

### Conversation features

- ➕ New Chat
- 💬 Continuous conversation
- 🗂️ Multiple chat sessions
- 💾 Automatic message storage
- 🕒 Conversation timestamps
- 🗑️ Delete conversations
- 🔄 Load previous conversations

Messages are stored in SQLite so that conversations can persist between requests.

---

## 📄 Document Upload

Universe AI supports document-based interaction.

Supported formats:

```text
PDF
TXT
```

Users can upload a document and interact with its content through the AI assistant.

This can be useful for:

- 📚 Study material
- 📝 Notes
- 📖 Books
- 📄 Assignments
- 💻 Documentation
- 📑 Project files

The backend processes the uploaded content and provides it to the AI within the configured document context limits.

---

# 📱 Android Application

Universe AI is also available as an Android application.

The Android version packages the Universe AI web interface into a mobile application so users can access their AI assistant directly from their phone.

### 📲 Download APK

<p align="center">

<a href="https://github.com/shikhartiwari1508/Universe-AI/releases/latest">
<img src="https://img.shields.io/badge/Download%20Universe%20AI%20APK-FF6B00?style=for-the-badge&logo=android&logoColor=white" alt="Download APK">
</a>

</p>

### Installation

1. Download the latest `UNIVERSE AI.apk` from the Releases page.
2. Open the APK on your Android phone.
3. If Android asks for permission, allow installation from the required source.
4. Install the application.
5. Open **Universe AI**.
6. Start chatting with the AI assistant.

> **Note:** The APK should be uploaded to the GitHub Release as a release asset rather than being stored directly inside the source repository.

---

# 🌐 Live Web Application

You can use Universe AI directly from your browser without installing anything.

<p align="center">

<a href="https://universe-ai-58di.onrender.com/">
<img src="https://img.shields.io/badge/OPEN%20UNIVERSE%20AI-LIVE%20DEMO-orange?style=for-the-badge" alt="Live Demo">
</a>

</p>

**Live URL:**  
https://universe-ai-58di.onrender.com/

---

# 🧠 AI Technology

Universe AI uses **Google Gemini** as its AI model provider.

The backend communicates with the Gemini API through the configured AI interaction endpoint.

### AI flow

```text
User
  │
  ▼
Universe AI Frontend
  │
  ▼
FastAPI Backend
  │
  ├── Chat History
  │
  ├── Document Processing
  │
  ▼
Google Gemini
  │
  ▼
AI Response
  │
  ▼
Universe AI Interface
```

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      User            │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   Web / Android App  │
                    └──────────┬───────────┘
                               │
                         HTTP / API
                               │
                    ┌──────────▼───────────┐
                    │    FastAPI Backend   │
                    └──────┬───────┬───────┘
                           │       │
                    ┌──────▼──┐ ┌──▼─────────────┐
                    │ SQLite  │ │ Document       │
                    │ Database│ │ Processing     │
                    └─────────┘ └──────┬─────────┘
                                       │
                              ┌────────▼────────┐
                              │   Gemini AI     │
                              └────────┬────────┘
                                       │
                              ┌────────▼────────┐
                              │ AI Response     │
                              └─────────────────┘
```

---

# 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| 🐍 Python | Backend programming |
| ⚡ FastAPI | REST API backend |
| 🤖 Google Gemini | Artificial Intelligence |
| 🗄️ SQLite | Chat history database |
| 🌐 HTML | Frontend structure |
| 🎨 CSS | Frontend styling |
| ⚙️ JavaScript | Frontend functionality |
| 📱 Android | Mobile application |
| 🚀 Render | Cloud deployment |
| 🐙 GitHub | Source code & version control |

---

# 📂 Project Structure

```text
Universe-AI/
│
├── backend/
│   └── main.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── ...
│
├── frontend/android/
│   ├── app/
│   ├── gradle/
│   ├── build.gradle
│   ├── settings.gradle
│   └── ...
│
├── requirements.txt
├── .gitignore
├── Start_Universe_AI.bat
└── README.md
```

> The exact project structure may change as new features are added.

---

# 💻 Run Universe AI Locally

## 1. Clone the repository

```bash
git clone https://github.com/shikhartiwari1508/Universe-AI.git
```

Move into the project:

```bash
cd Universe-AI
```

---

## 2. Create a Python virtual environment

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

---

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 4. Configure Gemini API Key

Create/configure your environment variable:

```text
GEMINI_API_KEY=your_api_key_here
```

**Never commit your real API key to GitHub.**

---

## 5. Start the backend

```bash
uvicorn backend.main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

---

# 🔌 API Endpoints

Universe AI provides API endpoints for managing the application.

### Health Check

```http
GET /api/health
```

Checks backend and AI service status.

---

### Get Chats

```http
GET /api/chats
```

Returns available conversations.

---

### Create / Continue Chat

```http
POST /api/chat
```

Sends a user message and receives an AI response.

---

### Get Chat Messages

```http
GET /api/chats/{chat_id}/messages
```

Returns messages belonging to a specific conversation.

---

### Delete Chat

```http
DELETE /api/chats/{chat_id}
```

Deletes a conversation.

---

### Upload Document

```http
POST /api/upload
```

Uploads supported PDF or TXT documents for AI interaction.

---

# 🗄️ Database

Universe AI uses **SQLite** for storing conversations.

The database contains two primary logical entities:

```text
Chats
 ├── id
 ├── title
 ├── created_at
 └── updated_at

Messages
 ├── id
 ├── chat_id
 ├── role
 ├── content
 └── created_at
```

This structure allows multiple conversations to maintain independent message histories.

---

# 🔐 Security

Universe AI follows basic security practices for API-based applications.

### Important

Do not upload or commit:

```text
.env
API keys
Passwords
Private credentials
Database secrets
```

Use environment variables instead:

```text
GEMINI_API_KEY
```

The `.gitignore` file should prevent sensitive local files from being committed.

---

# ☁️ Deployment

Universe AI is deployed using **Render**.

### Deployment architecture

```text
GitHub Repository
       │
       ▼
     Render
       │
       ▼
 FastAPI Backend
       │
       ▼
   Gemini API
```

Live application:

**https://universe-ai-58di.onrender.com/**

---

# 📱 Android Build

The project includes an Android wrapper/application structure.

For development, the Android project can be built using Gradle.

Example:

```powershell
cd frontend/android
```

Then:

```powershell
cmd /c gradlew.bat assembleDebug
```

The generated debug APK is normally placed under:

```text
frontend/android/app/build/outputs/apk/debug/
```

The final APK can then be uploaded to a GitHub Release for users to download.

---

# 🔄 Updating the Android App

Whenever the web application frontend is updated:

```text
Frontend Changes
       │
       ▼
Sync Web Files
       │
       ▼
Android www Folder
       │
       ▼
Build APK
       │
       ▼
GitHub Release
```

This keeps the Android application synchronized with the latest Universe AI interface.

---

# 🎨 User Interface

Universe AI follows a modern AI-assistant design approach with:

- 🌌 Futuristic interface
- 🌓 Dark visual design
- ✨ Modern chat experience
- 💬 Message bubbles
- 📱 Responsive layout
- 🗂️ Conversation sidebar
- 📄 Document upload
- ⚡ Interactive controls
- 🎯 Mobile-friendly interface

---

# 📸 Screenshots

Add screenshots of the application here:

```text
docs/
├── home.png
├── chat.png
├── new-chat.png
├── document-upload.png
└── android.png
```

Example:

```markdown
![Universe AI Home](docs/home.png)

![Universe AI Chat](docs/chat.png)

![Universe AI Android](docs/android.png)
```

---

# 🧪 Current Capabilities

| Feature | Status |
|---|---|
| AI Chat | ✅ |
| Gemini Integration | ✅ |
| Multiple Conversations | ✅ |
| Chat History | ✅ |
| New Chat | ✅ |
| Delete Chat | ✅ |
| PDF Upload | ✅ |
| TXT Upload | ✅ |
| FastAPI Backend | ✅ |
| SQLite Storage | ✅ |
| Web Application | ✅ |
| Android APK | ✅ |
| Cloud Deployment | ✅ |

---

# 🔮 Future Improvements

Planned improvements may include:

- 🎙️ Voice input
- 🔊 Text-to-speech
- 🖼️ Image understanding
- 📎 More document formats
- 🔐 User authentication
- ☁️ Cloud database
- 👤 User profiles
- 🌍 Multilingual conversations
- 📊 AI usage analytics
- 🎨 More personalization options
- 🔔 Notifications
- 📱 Improved Android experience

---

# 🤝 Contributing

Contributions are welcome.

If you want to improve Universe AI:

1. Fork the repository.
2. Create a new branch.

```bash
git checkout -b feature/new-feature
```

3. Make your changes.
4. Commit your changes.

```bash
git add .
git commit -m "Add new feature"
```

5. Push the branch.

```bash
git push origin feature/new-feature
```

6. Open a Pull Request.

---

# 🐛 Bug Reports

If you find a bug, please open an issue on GitHub and provide:

- Description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/device information
- Screenshots if possible

---

# 📜 License

This project is currently maintained as a personal/educational AI project.

If a formal open-source license is added in the future, this section will be updated accordingly.

---

# 👨‍💻 Developer

## Shikhar Tiwari

**BCA-MCA Data Science Student**  
**University of Allahabad**

### Connect with me

- 🐙 GitHub:  
  https://github.com/shikhartiwari1508

- 💼 LinkedIn:  
  https://linkedin.com/in/shikhar-tiwari-222007372

- 🌐 Portfolio:  
  https://shikhartiwari1508.github.io/Shikhar_Tiwari-Portfolio/

---

# ⭐ Support the Project

If you find **Universe AI** useful:

⭐ Star the repository  
🍴 Fork the project  
🐛 Report bugs  
💡 Suggest features  
📢 Share the project

Every star and contribution helps the project grow.

---

# 🌌 Universe AI

<p align="center">

<strong>Think Beyond Limits. Explore the Universe of AI.</strong>

</p>

<p align="center">

🤖 AI • 💬 Conversations • 📄 Documents • 📱 Android • 🌐 Web

</p>

---

<p align="center">
Made with ❤️ by <strong>Shikhar Tiwari</strong>
</p>