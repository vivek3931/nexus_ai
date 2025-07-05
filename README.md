# ✨ Nexus AI: Your Intelligent Search Companion

Nexus AI is a full-stack web application that redefines your search experience by combining Google's image search with advanced AI-driven text generation—all in a modern, intuitive interface.

---

## 🚀 Features

### ⚡ Intelligent Search Modes
- **Text-to-AI:** Receive smart, AI-generated responses to complex queries.
- **Image-to-AI (Google-Powered):** Discover relevant images from Google, enhanced with AI interpretations.

### 🗣️ Dynamic Chat History
- **Persistent Conversations:** Chats are saved and accessible in a sidebar.
- **Smart Title Generation:** Conversations are auto-titled for easy identification.
- **Real-time Updates:** Active chats appear at the top.
- **Searchable History:** Quickly find past conversations.
- **Effortless Management:** Start new chats, delete individual or all conversations.

### 🔐 Robust User Authentication
- **Secure Login & Registration:** Protect your data with user accounts.
- **Free Trial System:** Limited searches or time-bound trial available.
- **Membership Management:** Upgrade for premium features and unlimited usage.

### 📱 Responsive & Adaptive UI
- **Desktop & Mobile Friendly:** Seamless experience on all devices.
- **Collapsible Sidebar:** Optimize screen space on desktop and mobile.

### 🛠️ Developer-Friendly Architecture
- **Modular & Scalable:** Easy maintenance and future enhancements.

---

## ⚙️ Tech Stack & Architecture

**Frontend:**
- React
- Plain CSS (Tailwind CSS principles)
- React Router DOM
- Font Awesome

**Backend:**
- Node.js
- Express.js
- RESTful API

**Database:**
- MongoDB

---

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- MongoDB Community Server or MongoDB Atlas

### Installation

1. **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/nexus-ai.git
    cd nexus-ai
    ```

2. **Install Dependencies**
    - **Frontend**
      ```bash
      cd frontend
      npm install
      ```
    - **Backend**
      ```bash
      cd ../backend
      npm install
      ```

3. **Configure Environment Variables**
    - **Backend (`backend/.env`):**
      ```
      MONGO_URI=mongodb://localhost:27017/nexusai
      PORT=5000
      GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
      GOOGLE_CSE_ID=YOUR_GOOGLE_CUSTOM_SEARCH_ENGINE_ID
      JWT_SECRET=YOUR_SUPER_SECRET_KEY
      ```
    - **Frontend (`frontend/.env`):**
      ```
      VITE_API_URL=http://localhost:5000/api
      ```

4. **Run the Application**
    - **Backend**
      ```bash
      npm start
      ```
      Runs at [http://localhost:5000](http://localhost:5000)
    - **Frontend**
      ```bash
      npm start
      ```
      Opens at [http://localhost:3000](http://localhost:3000)

---

## 📂 Folder Structure

```
/
├── frontend/             # React application (client-side)
│   ├── public/           # Static assets
│   ├── src/              # Components, styles, logic
│   │   ├── components/   # Reusable UI components
│   │   ├── App.jsx       # Main app component
│   │   ├── Layout.jsx    # Layout structure
│   │   └── main.jsx      # Root, contexts, router
│   ├── .env              # Frontend environment variables
│   └── package.json      # Frontend dependencies
│
└── backend/              # Node.js Express server (API)
     ├── controllers/      # Request handlers
     ├── models/           # MongoDB schemas
     ├── routes/           # API routes
     ├── .env              # Backend environment variables
     └── package.json      # Backend dependencies
```

---

## 📜 License

Licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by Vivek Singh.  
Contributions welcome—open issues or pull requests!
