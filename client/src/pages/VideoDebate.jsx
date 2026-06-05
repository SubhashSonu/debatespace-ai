import { useEffect, useRef, useState } from "react";
import { socket } from "../api/socket";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthUser } from "../api/auth";
import {
  addNote,
  deleteNote,
  endDebate,
  getDebate,
  getNotes,
} from "../api/debateApi";

import { Mic, MicOff, Video, VideoOff, FileText, PhoneOff } from "lucide-react";
import { showError } from "../utils/toast";

function VideoDebate() {
  const peerRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const offerSentRef = useRef(false);

  const [isMuted, setIsMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const { roomId } = useParams();
  const user = getAuthUser();
  const [isRemoteConnected, setIsRemoteConnected] = useState(false);

  const navigate = useNavigate();

  const [roomData, setRoomData] = useState(null);
  const [debate, setDebate] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [debateEnded, setDebateEnded] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState([]);

  const [noteTitle, setNoteTitle] = useState("");

  const [noteContent, setNoteContent] = useState("");

  const localUsername = user?.username || "You";
  const remoteUser = roomData?.users?.find((u) => u.username !== localUsername);

  const createPeer = () => {
  peerRef.current = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },

      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },

      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },

      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
  });

    console.log("Peer Created:", peerRef.current);

    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("ICE Candidate Generated:", event.candidate);

        socket.emit("webrtc:ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    peerRef.current.onconnectionstatechange = () => {
      console.log("Connection State:", peerRef.current.connectionState);
    };

    peerRef.current.ontrack = (event) => {
      console.log("Remote Track Received");

      console.log("Remote Stream:", event.streams[0]);

      setIsRemoteConnected(true);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  };

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log("Stream received:", stream);

      localStreamRef.current = stream;

      stream.getTracks().forEach((track) => {
        console.log("Adding Track:", track.kind);

        peerRef.current.addTrack(track, stream);
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createOffer = async () => {
    try {
      const offer = await peerRef.current.createOffer();

      console.log("Offer Created:", offer);

      await peerRef.current.setLocalDescription(offer);

      console.log("Local Description Set:", peerRef.current.localDescription);

      socket.emit("webrtc:offer", {
        roomId,
        offer,
      });

      console.log("Offer Sent");
    } catch (error) {
      console.error(error);
    }
  };

  const createAnswer = async (offer) => {
    try {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(offer),
      );

      console.log("Remote Description Set");

      const answer = await peerRef.current.createAnswer();

      console.log("Answer Created:", answer);

      await peerRef.current.setLocalDescription(answer);

      console.log("Local Answer Set");

      socket.emit("webrtc:answer", {
        roomId,
        answer,
      });

      console.log("Answer Sent");
    } catch (error) {
      console.error(error);
    }
  };

  const handleAnswer = async (answer) => {
    try {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );

      console.log("Remote Answer Set");
    } catch (error) {
      console.error(error);
    }
  };

  const handleIceCandidate = async (candidate) => {
    try {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));

      console.log("ICE Candidate Added");
    } catch (error) {
      console.error(error);
    }
  };

  const toggleMute = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];

    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;

    setIsMuted(!audioTrack.enabled);

    console.log("Microphone:", audioTrack.enabled ? "ON" : "OFF");
  };

  const toggleCamera = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];

    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;

    setCameraOff(!videoTrack.enabled);

    console.log("Camera:", videoTrack.enabled ? "ON" : "OFF");
  };

  const leaveCall = async () => {
    try {
      await endDebate(roomId, "user_left");

      console.log("Debate ended because user left");

      socket.emit("debate:end", {
        roomId,
        reason: "user_left",
      });
    } catch (error) {
      console.error(error);
    }
    console.log("Leaving Call");

    localStreamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    peerRef.current?.close();

    offerSentRef.current = false;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsRemoteConnected(false);
    setDebateEnded(true);
  };

  const fetchNotes = async () => {
    try {
      const response = await getNotes(roomId);

      setNotes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDebate = async () => {
    try {
      const response = await getDebate(roomId);

      if (response.data.status === "ended") {
        showError("This debate has already ended");

        navigate("/");

        return;
      }

      setDebate(response.data);

      console.log("DEBATE:", response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDebate();
    fetchNotes();
  }, [roomId]);

  useEffect(() => {
    console.log("DEBATE STATE", debate);

    if (!debate?.topic) {
      return;
    }

    const init = async () => {
      createPeer();

      await startLocalVideo();

      console.log("JOIN EMITTED");
      socket.emit("video:join", {
        roomId,
        userId: user?.id,
        username: user?.username,
        topic: debate?.topic,
        duration: debate?.duration,
      });

      console.log("Joined Video Room:", roomId);
    };

    init();
    const userJoinedHandler = async () => {
      if (offerSentRef.current) {
        return;
      }

      offerSentRef.current = true;

      await createOffer();
    };

    const handleOffer = async ({ offer }) => {
      console.log("Offer Received:", offer);

      await createAnswer(offer);
    };

    const answerHandler = async ({ answer }) => {
      console.log("Answer Received:", answer);

      await handleAnswer(answer);
    };

    const iceHandler = async ({ candidate }) => {
      console.log("ICE Candidate Received:", candidate);

      await handleIceCandidate(candidate);
    };

    const userLeftHandler = () => {
      setIsRemoteConnected(false);
    };

    const roomUpdateHandler = (room) => {
      console.log("ROOM UPDATE", room);

      console.log("START TIME:", room.startTime);

      console.log("DURATION:", room.duration);

      setRoomData(room);
    };

    const debateEndedHandler = (data) => {
      console.log("DEBATE ENDED", data);

      localStreamRef.current?.getTracks().forEach((track) => track.stop());

      peerRef.current?.close();

      setDebateEnded(true);
    };

    socket.on("video:user-joined", userJoinedHandler);

    socket.on("webrtc:offer", handleOffer);

    socket.on("webrtc:answer", answerHandler);

    socket.on("webrtc:ice-candidate", iceHandler);

    socket.on("video:user-left", userLeftHandler);

    socket.on("room:update", roomUpdateHandler);

    socket.on("debate:ended", debateEndedHandler);

    return () => {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());

      peerRef.current?.close();

      offerSentRef.current = false;

      socket.off("video:user-joined", userJoinedHandler);
      socket.off("webrtc:offer", handleOffer);
      socket.off("webrtc:answer", answerHandler);
      socket.off("webrtc:ice-candidate", iceHandler);
      socket.off("video:user-left", userLeftHandler);
      socket.off("room:update", roomUpdateHandler);
      socket.off("debate:ended", debateEndedHandler);
    };
  }, [debate]);

  const handleDebateEnd = async (reason) => {
    try {
      await endDebate(roomId, reason);

      console.log("Debate ended in DB");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!roomData?.debateStarted || !roomData?.startTime) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - roomData.startTime) / 1000);

      const remaining = Math.max(roomData.duration - elapsed, 0);

      if (remaining <= 0) {
        handleDebateEnd("timer");

        setTimeLeft(0);

        localStreamRef.current?.getTracks().forEach((track) => {
          track.stop();
        });

        peerRef.current?.close();

        setDebateEnded(true);

        clearInterval(interval);

        return;
      }

      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [roomData]);

  const minutes = Math.floor(timeLeft / 60);

  const seconds = timeLeft % 60;

  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const handleAddNote = async () => {
    if (!noteTitle.trim()) {
      showError("Please enter note title");
      return;
    }

    if (!noteContent.trim()) {
      showError("Please enter note content");
      return;
    }

    if (debateEnded) {
      showError("Debate has already ended");
      return;
    }
    try {
      await addNote(roomId, {
        title: noteTitle,
        content: noteContent,
      });

      setNoteTitle("");

      setNoteContent("");

      fetchNotes();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(roomId, noteId);

      fetchNotes();
    } catch (error) {
      console.error(error);
    }
  };

  console.log("Debate Ended:", debateEnded);
  console.log("NOTES:", notes);
  if (debateEnded) {
    return (
      <main className="min-h-screen bg-[#020b2d] font-sans text-slate-100 flex items-center justify-center px-4 py-12 selection:bg-cyan-500/30">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Subtle top gradient bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50"></div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-cyan-500/10 mb-6 border border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.15)] animate-[scaleIn_0.5s_ease-out]">
              <span className="text-5xl">🏁</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
              Debate Finished
            </h1>
            <p className="text-slate-400 text-lg">
              The debate timer has ended.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="space-y-4">
            {/* Topic Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 transition hover:border-slate-700">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Debate Topic
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">
                {roomData?.topic}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Participants Count */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center transition hover:border-slate-700">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Participants
                </p>
                <p className="text-4xl font-black text-cyan-400">
                  {roomData?.users?.length || 0}
                </p>
              </div>

              {/* Duration */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center transition hover:border-slate-700">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Duration
                </p>
                <p className="text-4xl font-black text-cyan-400">
                  {roomData?.duration / 60}{" "}
                  <span className="text-lg font-medium text-slate-500">
                    min
                  </span>
                </p>
              </div>
            </div>

            {/* Roster */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 transition hover:border-slate-700">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                Participant Roster
              </p>
              <div className="flex flex-wrap gap-2.5">
                {roomData?.users?.map((user) => (
                  <span
                    key={user.socketId}
                    className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300"
                  >
                    {user.username}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto min-w-[240px] rounded-xl bg-cyan-400 px-8 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-300 active:scale-[0.98] shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            >
              Return Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#020b2d] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-4 rounded-2xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Live Debate Room
              </p>

              <h1 className="mt-1 text-2xl font-bold">Video Debate</h1>
            </div>

            <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-cyan-300">
              Room #{roomId}
            </div>
          </div>
        </div>

        <div className="text-red-500 text-xl">
          {debateEnded ? "DEBATE FINISHED" : ""}
        </div>

        {/* Topic + Timer */}
        <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
            Debate Topic
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {roomData?.topic || "Loading..."}
          </h2>

          <div className="mt-4 inline-flex rounded-xl border border-cyan-500/20 bg-slate-900/80 px-6 py-2 shadow-lg">
            <span className="text-2xl font-bold">
              {roomData?.debateStarted ? formattedTime : "Waiting..."}
            </span>
          </div>
        </div>

        {/* Video Grid */}
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          {/* Local Video */}
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur p-3">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-[320px] w-full rounded-xl bg-slate-800 object-cover"
            />

            <div className="mt-3 text-center">
              <span className="rounded-full bg-cyan-500/20 px-5 py-1.5 text-sm font-medium text-cyan-300">
                {localUsername}
              </span>
            </div>
          </div>

          {/* Remote Video */}
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur p-3">
            <div className="relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="h-[320px] w-full rounded-xl bg-slate-800 object-cover"
              />

              {!isRemoteConnected && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/80">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">👤</div>

                    <h3 className="text-base font-semibold">
                      Waiting for opponent
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Share your invite link
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 text-center">
              <span className="rounded-full bg-slate-800 px-5 py-1.5 text-sm font-medium">
                {remoteUser?.username || "waiting"}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={toggleMute}
            className="rounded-lg bg-yellow-500 px-5 py-2.5 font-medium text-black transition hover:scale-105"
          >
            <span className="flex items-center gap-2">
              {isMuted ? (
                <>
                  <MicOff size={18} />
                  Unmute
                </>
              ) : (
                <>
                  <Mic size={18} />
                  Mute
                </>
              )}
            </span>
          </button>

          <button
            onClick={toggleCamera}
            className="rounded-lg bg-slate-800 px-5 py-2.5 font-medium transition hover:bg-slate-700"
          >
            <span className="flex items-center gap-2">
              {cameraOff ? (
                <>
                  <VideoOff size={18} />
                  Camera On
                </>
              ) : (
                <>
                  <Video size={18} />
                  Camera Off
                </>
              )}
            </span>
          </button>

          <button
            onClick={() => setNotesOpen(true)}
            className="rounded-lg bg-cyan-500 px-5 py-2.5 font-medium transition hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <FileText size={18} />
              Notes
            </span>
          </button>

          <button
            onClick={leaveCall}
            className="rounded-lg bg-red-500 px-5 py-2.5 font-medium transition hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <PhoneOff size={18} />
              Leave Call
            </span>
          </button>
        </div>

        {notesOpen && (
          <div className="fixed top-0 right-0 z-50 flex h-screen w-[420px] flex-col border-l border-cyan-500/20 bg-[#071235] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <h2 className="text-xl font-bold">Notes</h2>

              <button
                onClick={() => setNotesOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="border-b border-slate-800 p-4 space-y-3">
              <input
                type="text"
                placeholder="Title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full rounded-lg border border-cyan-500/10 bg-slate-900 p-3 outline-none focus:border-cyan-500"
              />

              <textarea
                placeholder="Write your note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-cyan-500/10 bg-slate-900 p-3 outline-none focus:border-cyan-500"
              />

              <button
                onClick={handleAddNote}
                className="w-full rounded-lg bg-cyan-600 py-3 font-medium hover:bg-cyan-700"
              >
                Save Note
              </button>
            </div>

            <div className="h-0 flex-1 overflow-y-auto p-4 space-y-3">
              {notes.length === 0 ? (
                <p className="text-slate-400">No notes yet</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note._id}
                    className="rounded-xl border border-cyan-500/10 bg-slate-900 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{note.title}</h3>

                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        🗑️
                      </button>
                    </div>

                    <p className="mt-2 text-sm text-slate-300">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoDebate;
