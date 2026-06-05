import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { connectSocket, socket } from "./api/socket";
import Navbar from "./components/Navbar";
import AiDebate from "./pages/AiDebate";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VideoDebate from "./pages/VideoDebate";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateDebate from "./pages/CreateDebate";
import DebateHistory from "./pages/DebateHistory";
import Dashboard from "./pages/Dashboard";
import MyDebates from "./pages/MyDebates";
import { Toaster } from "react-hot-toast";

function App() {
  useEffect(() => {
    const handleConnect = () => {
      console.info("Socket connected:", socket.id);
      socket.emit("client:ping", { source: "react-client" }, (response) => {
        console.info("Socket ping response:", response);
      });
    };

    const handleServerConnected = (payload) => {
      console.info("Socket server handshake:", payload);
    };

    const handleDisconnect = (reason) => {
      console.info("Socket disconnected:", reason);
    };

    socket.on("connect", handleConnect);
    socket.on("server:connected", handleServerConnected);
    socket.on("disconnect", handleDisconnect);
    connectSocket();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("server:connected", handleServerConnected);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-slate-900">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />

          <Route
            path="/create-debate"
            element={
              <ProtectedRoute>
                <CreateDebate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/debate-ai"
            element={
              <ProtectedRoute>
                <AiDebate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/video-debate/:roomId"
            element={
              <ProtectedRoute>
                <VideoDebate />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <DebateHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-debates"
            element={
              <ProtectedRoute>
                <MyDebates />
              </ProtectedRoute>
            }
          />
        </Routes>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#0f172a",
              color: "#fff",
              border: "1px solid #06b6d4",
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
