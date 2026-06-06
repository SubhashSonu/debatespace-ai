# DebateSpace AI

A full-stack MERN application that helps users improve their debating and communication skills through real-time video debates and AI-powered debate practice.

---

 ## 🚀 Live Demo

[DebateSpace AI](https://debatespace-ai.vercel.app/)

---

## Screenshots

### Home Page

![Home Page](./screenshots/home.png)

### AI Debate

![AI Debate](./screenshots/ai-debate.png)

### Create Debate

![Create Debate](./screenshots/create-debate.png)

### Video Debate

![Video Debate](./screenshots/video-debate.png)

### Debate History

![History](./screenshots/history.png)

### Dashboard

![Dashboard](./screenshots/dashboard.png)

---

## Features

### 🎥 Real-Time Video Debates
- Create private debate rooms
- Join debates using Room ID
- One-to-one video communication using WebRTC
- Real-time participant synchronization with Socket.IO
- Debate timer support
- Automatic debate completion handling

### 🤖 AI Debate Opponent
- Debate against an AI opponent powered by Google Gemini
- Create multiple AI debate conversations
- Conversation history support
- Different debate styles and stances
- Delete AI conversations

### 📝 Debate Notes
- Take notes during debates
- Save important arguments and rebuttals
- Quick access while debating

### 📚 Debate History
- Track completed debates
- View participants and outcomes
- Delete debate history entries

### 📊 Dashboard
- Total debates participated
- Completed debates
- Total debate time
- Recent debate activity

### 🔐 Authentication
- User Signup
- User Login
- JWT Authentication
- Protected Routes

---

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- Axios
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO

### Real-Time Communication
- WebRTC
- Socket.IO

### AI
- Google Gemini API

---


## Project Structure

```text
debatespace-ai
│
├── client
│   ├── public
│   ├── src
│   │   ├── api
│   │   ├── assets
│   │   ├── components
│   │   ├── pages
│   │   ├── store
│   │   └── utils
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   └── sockets
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/SubhashSonu/debatespace-ai.git
cd debatespace-ai
```

### Install Client Dependencies

```bash
cd client
npm install
```

### Install Server Dependencies

```bash
cd ../server
npm install
```

---

## Environment Variables

### Server (.env)

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

CLIENT_URL=http://localhost:5173
```

### Client (.env)

```env
VITE_API_URL=http://localhost:5000/api

VITE_SOCKET_URL=http://localhost:5000
```

---

## Running the Application

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm run dev
```

Application will run at:

```text
http://localhost:5173
```

---

## Application Flow

### Video Debate

```text
Create Room
    ↓
Share Room ID
    ↓
Opponent Joins
    ↓
WebRTC Connection Established
    ↓
Live Debate
    ↓
Debate Ends
    ↓
History Saved
```

### AI Debate

```text
Create Conversation
    ↓
Enter Topic
    ↓
Send Argument
    ↓
Gemini Generates Counter Argument
    ↓
Conversation Saved
```

---

## Skills Demonstrated

This project showcases:

- Full Stack MERN Development
- REST API Design
- JWT Authentication
- MongoDB Data Modeling
- Socket.IO Integration
- WebRTC Integration
- Real-Time Communication
- AI Integration with Gemini
- State Management
- Frontend Architecture
- Backend Architecture

---

## Future Improvements

- Password Reset
- AI Debate Judge
- AI Debate Scoring
- Whiteboard Collaboration
- Spectator Mode
- User Profiles
- Debate Analytics
- Debate Rankings

---

## Author

**Subh**

Built to help users improve communication, critical thinking, and debating skills through both human-to-human and AI-powered debates.

---

⭐ If you like this project, consider giving it a star.
