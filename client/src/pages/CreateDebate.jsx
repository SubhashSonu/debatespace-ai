import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDebate } from "../api/debateApi";
import { showError, showSuccess } from "../utils/toast";

function CreateDebate() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(600);

  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const createDebateRoom = async () => {
    try {
      if (!topic.trim()) {
        showError("Please enter a debate topic");
        return;
      }

      const response = await createDebate({
        topic,
        duration,
      });

    

      setRoomId(response.data.roomId);
      showSuccess("Debate room created successfully");
    } catch (error) {
      console.error(error);

      showError("Failed to create debate");
    }
  };

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}/video-debate/${roomId}`;

    await navigator.clipboard.writeText(inviteLink);

    showSuccess("Invite link copied");
  };

  const joinDebateRoom = () => {
    if (!joinRoomId.trim()) {
      showError("Please enter room ID");
      return;
    }

    navigate(`/video-debate/${joinRoomId}`);
  };

  const enterRoom = () => {
    navigate(`/video-debate/${roomId}`, {
      state: {
        topic,
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#020b2d] py-12 px-4 sm:px-6 lg:px-8 text-slate-100 font-sans selection:bg-cyan-500/30">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Debate Rooms
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Create a new debate room or join an existing discussion.
          </p>
        </div>

        {/* Feature Highlights Section */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-lg">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-white mb-1">Create Room</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Create private debate sessions
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-lg">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-white mb-1">
              Real-Time Video
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Powered by WebRTC
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 shadow-lg">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-lg font-bold text-white mb-1">AI Summary</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate debate summaries after discussions
            </p>
          </div>
        </div>

        {/* Main Action Forms */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Create Room Panel */}
          <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50"></div>

            <h2 className="mb-2 text-2xl font-bold text-white">
              Create Debate Room
            </h2>
            <p className="mb-8 text-sm text-slate-400">
              Generate a private debate room and invite another participant.
            </p>

            <div className="space-y-6 flex-1">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Debate Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Should AI replace teachers?"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm text-white outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 appearance-none cursor-pointer"
                >
                  <option value={300}>5 Minutes</option>
                  <option value={600}>10 Minutes</option>
                  <option value={900}>15 Minutes</option>
                  <option value={1200}>20 Minutes</option>
                  <option value={1800}>30 Minutes</option>
                </select>
              </div>
            </div>

            <button
              onClick={createDebateRoom}
              className="mt-8 w-full rounded-xl bg-cyan-400 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-300 active:scale-[0.98] shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            >
              Generate Room
            </button>

            {/* Success State / Room Details */}
            {roomId && (
              <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5 animate-[fadeIn_0.3s_ease-out]">
                <p className="text-xs font-semibold tracking-wider text-cyan-400 uppercase mb-1">
                  Room Created
                </p>
                <div className="flex items-center justify-between rounded-lg bg-slate-950 border border-slate-800 py-2 px-3 mb-4">
                  <span className="truncate font-mono text-sm text-slate-300">
                    {roomId}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={copyInviteLink}
                    className="flex-1 rounded-xl border border-cyan-500/30 bg-transparent px-4 py-2.5 text-sm font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/10 active:scale-[0.98]"
                  >
                    Copy Invite Link
                  </button>
                  <button
                    onClick={enterRoom}
                    className="flex-1 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-300 active:scale-[0.98]"
                  >
                    Enter Room
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Join Room Panel */}
          <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl h-fit">
            <h2 className="mb-2 text-2xl font-bold text-white">Join Debate</h2>
            <p className="mb-8 text-sm text-slate-400">
              Enter a room ID shared by another participant.
            </p>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Room ID
              </label>
              <input
                type="text"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                placeholder="Paste Room ID here..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm font-mono text-white placeholder:font-sans placeholder:text-slate-600 outline-none transition-all focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
              />
            </div>

            <button
              onClick={joinDebateRoom}
              className="w-full rounded-xl bg-slate-100 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-white active:scale-[0.98]"
            >
              Join Debate Room
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CreateDebate;
