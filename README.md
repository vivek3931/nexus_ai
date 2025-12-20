<div align="center">

# ✨ Nexus AI

<img src="frontend/public/soul_logo.svg" alt="Nexus AI Logo" width="120" height="120"/>

### 🚀 Premium AI Chatbot with Beautiful UI/UX

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Powered by Groq](https://img.shields.io/badge/Powered%20by-Groq-FF6B35?style=for-the-badge&logo=lightning&logoColor=white)](https://groq.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)

<br/>

**A modern, premium AI chatbot featuring streaming responses, image search, PDF generation, live code preview, and a stunning amber-themed dark UI.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Tech Stack](#-tech-stack) • [API](#-api)

---

</div>

## 🎯 Features

<table>
<tr>
<td width="50%">

### � AI Chat
- **Streaming Responses** - Real-time text streaming with fade-blur animations
- **Smart Intent Detection** - Auto-detects code, PDF, and image requests
- **Conversation Memory** - Chats persist across page refresh
- **Chat History** - Switch between previous conversations

</td>
<td width="50%">

### 🖼️ Image Search
- **Auto Image Display** - 4 Wikimedia images with every response
- **Image Modal** - Click to expand with smooth spring animation
- **Smart Keywords** - AI extracts relevant search terms
- **High Quality** - Direct from Wikimedia Commons

</td>
</tr>
<tr>
<td width="50%">

### 📄 PDF Generation
- **One-Click Export** - Generate beautiful PDFs from any response
- **Styled Documents** - Professional formatting with PDFKit
- **Pro Feature** - Available for Pro subscribers

</td>
<td width="50%">

### � Live Code Preview
- **Toggle View** - Switch between code and output
- **Multi-Language** - HTML, CSS, JavaScript support
- **Real Execution** - Run code directly in browser
- **Pro Feature** - Available for Pro subscribers

</td>
</tr>
</table>

---

## 🎨 UI/UX Highlights

<div align="center">

| Feature | Description |
|---------|-------------|
| 🌙 **Dark Theme** | Premium dark UI with amber (#fbbf24) accent colors |
| 💊 **Pill-Shaped UI** | Modern rounded elements throughout |
| ✨ **Animations** | Smooth Framer Motion transitions |
| 📱 **Responsive** | Overlay sidebar on mobile, collapsible on desktop |
| 🔒 **Pro Gating** | Feature locks with upgrade prompts |
| ⌨️ **Floating Input** | Beautiful floating input with blur gradient |

</div>

---

## 🚀 Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Groq API Key

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/nexus-ai.git
cd nexus-ai

# Install backend dependencies
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Start backend server
npm run dev

# In a new terminal, install frontend dependencies
cd ../frontend
npm install

# Start frontend dev server
npm run dev
```

### Environment Variables

Create a `.env` file in the `backend` folder:

```env
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URI=mongodb://localhost:27017/nexus_ai
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
PORT=5000
```

---

## 🛠️ Tech Stack

<div align="center">

### Frontend

| Technology | Purpose |
|------------|---------|
| ![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black) | UI Framework |
| ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white) | Build Tool |
| ![Framer](https://img.shields.io/badge/-Framer%20Motion-0055FF?style=flat-square&logo=framer&logoColor=white) | Animations |
| ![Lucide](https://img.shields.io/badge/-Lucide%20Icons-F56565?style=flat-square&logo=feather&logoColor=white) | Icon Library |

### Backend

| Technology | Purpose |
|------------|---------|
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white) | Runtime |
| ![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white) | Web Framework |
| ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white) | Database |
| ![Groq](https://img.shields.io/badge/-Groq%20API-FF6B35?style=flat-square&logo=lightning&logoColor=white) | AI Model (Llama 3.1) |

</div>

---

## � Project Structure

```
nexus-ai/
├── 📂 backend/
│   ├── 📂 models/          # MongoDB schemas
│   ├── 📂 routes/          # API routes (auth, chat)
│   ├── 📂 services/        # Business logic
│   │   ├── groqService.js  # AI chat integration
│   │   ├── pdfService.js   # PDF generation
│   │   ├── otpService.js   # Email OTP
│   │   └── searchService.js # Wikimedia images
│   └── server.js           # Express entry point
│
├── 📂 frontend/
│   ├── 📂 public/          # Static assets
│   │   └── soul_logo.svg   # App logo
│   └── 📂 src/
│       ├── 📂 components/
│       │   ├── Auth.jsx    # OTP authentication
│       │   ├── Chat.jsx    # Main chat interface
│       │   ├── CodeBlock.jsx # Code with live preview
│       │   ├── ImageModal.jsx # Image viewer
│       │   └── Pricing.jsx # Subscription plans
│       ├── App.jsx         # Router + Auth context
│       ├── main.jsx        # React entry
│       └── index.css       # Global styles
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/request-otp` | Send OTP to email |
| `POST` | `/api/auth/verify-otp` | Verify OTP & login |
| `GET` | `/api/auth/me` | Get current user |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send message (non-streaming) |
| `POST` | `/api/chat/stream` | Send message (streaming) |
| `POST` | `/api/chat/ocr` | Analyze uploaded image |
| `GET` | `/api/chat/images` | Search Wikimedia images |

---

## 💳 Pro Features

| Feature | Free | Pro |
|---------|:----:|:---:|
| AI Chat | ✅ | ✅ |
| Image Search | ✅ | ✅ |
| Streaming Responses | ✅ | ✅ |
| PDF Generation | ❌ | ✅ |
| Live Code Preview | ❌ | ✅ |
| Image OCR | ❌ | ✅ |
| Priority Responses | ❌ | ✅ |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### Made with ❤️ and ☕

**Star ⭐ this repo if you found it helpful!**

[![GitHub stars](https://img.shields.io/github/stars/vivek3931/nexus_ai?style=social)](https://github.com/vivek3931/nexus_ai)

</div>
