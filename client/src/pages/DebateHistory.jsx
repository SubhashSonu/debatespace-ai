import { useEffect, useState } from "react";
import {
  deleteDebate,
  generateSummary,
  getDebateHistory,
} from "../api/debateApi";
import { showError, showSuccess } from "../utils/toast";

function DebateHistory() {
  const [debates, setDebates] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState({});

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getDebateHistory();

        setDebates(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchHistory();
  }, []);

  const getActualDuration = (startedAt, endedAt) => {
    const diff = new Date(endedAt) - new Date(startedAt);

    const totalSeconds = Math.floor(diff / 1000);

    const minutes = Math.floor(totalSeconds / 60);

    const seconds = totalSeconds % 60;

    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (date) => {
    const d = new Date(date);

    const datePart = d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const timePart = d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });

    return `${datePart}, ${timePart}`;
  };

  const handleGenerateSummary = async (roomId) => {
    try {
      setLoadingSummary(roomId);

      const response = await generateSummary(roomId);

      setDebates((prev) =>
        prev.map((debate) =>
          debate.roomId === roomId
            ? {
                ...debate,
                summary: response.data.summary,
              }
            : debate,
        ),
      );
    } catch (error) {
      console.error(error);

      showError(error.response?.data?.message || "Failed to generate summary");
    } finally {
      setLoadingSummary(null);
    }
  };

  const handleDelete = async (roomId) => {
    const confirmed = window.confirm("Delete this debate?");

    if (!confirmed) return;

    try {
      await deleteDebate(roomId);

      setDebates((current) =>
        current.filter((debate) => debate.roomId !== roomId),
      );

      showSuccess("Debate deleted successfully");
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete debate");
    }
  };

  return (
    <main className="min-h-screen bg-[#020b2d] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}

        <div className="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-4xl font-bold">Debate History</h1>

          <p className="mt-2 text-slate-400">View all your previous debates.</p>
        </div>

        {/* History List */}

        <div className="space-y-5">
          {debates.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <div className="text-5xl">🎤</div>

              <h2 className="mt-4 text-2xl font-bold">No debates yet</h2>

              <p className="mt-2 text-slate-400">
                Start your first debate to see history.
              </p>
            </div>
          )}

          {debates.map((debate) => (
            <div
              key={debate._id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-500"
            >
              {/* Topic */}

              <h2 className="text-2xl font-bold text-white">{debate.topic}</h2>
              <p className="mt-2 text-sm text-slate-400">
                {formatDate(debate.createdAt)}
              </p>

              {/* Status */}

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm text-green-400">
                  {debate.status === "ended" ? "Completed" : debate.status}
                </span>

                <span className="rounded-full bg-red-500/20 px-4 py-2 text-sm text-red-400">
                  {debate.endReason === "user_left"
                    ? "Participant Left"
                    : debate.endReason === "timer"
                      ? "Timer Expired"
                      : "Unknown"}
                </span>
              </div>

              {/* Info Grid */}

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Max Duration</p>

                  <p className="mt-1 text-xl font-bold">
                    {debate.duration / 60} min
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Actual Duration</p>

                  <p className="mt-1 text-xl font-bold text-cyan-400">
                    {getActualDuration(debate.startedAt, debate.endedAt)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Started</p>

                  <p className="mt-1">{formatDate(debate.startedAt)}</p>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                  <p className="text-sm text-slate-400">Ended</p>

                  <p className="mt-1">{formatDate(debate.endedAt)}</p>
                </div>
              </div>

              {/* Participants */}

              <div className="mt-6">
                <p className="mb-3 text-sm text-slate-400">Participants</p>

                <div className="flex flex-wrap gap-2">
                  {debate.participants.map((participant) => (
                    <span
                      key={participant._id}
                      className="rounded-full bg-cyan-600/20 px-4 py-2 text-sm font-medium text-cyan-300"
                    >
                      {participant.username}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {!debate.summary ? (
                  <>
                    <button
                      onClick={() => handleGenerateSummary(debate.roomId)}
                      disabled={loadingSummary === debate.roomId}
                      className="rounded-xl bg-cyan-600 px-4 py-2 font-medium hover:bg-cyan-700 disabled:opacity-50"
                    >
                      {loadingSummary === debate.roomId
                        ? "Generating..."
                        : "Generate AI Summary"}
                    </button>

                    <button
                      onClick={() => handleDelete(debate.roomId)}
                      className="rounded-xl bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
                    >
                      Delete Debate
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setExpandedSummary((prev) => ({
                          ...prev,
                          [debate.roomId]: !prev[debate.roomId],
                        }))
                      }
                      className="rounded-xl border border-cyan-500 px-4 py-2 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      {expandedSummary[debate.roomId]
                        ? "📄 Hide Summary"
                        : "📄 View AI Summary"}
                    </button>

                    <button
                      onClick={() => handleDelete(debate.roomId)}
                      className="rounded-xl bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
                    >
                      Delete Debate
                    </button>

                    {expandedSummary[debate.roomId] && (
                      <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-5">
                        <h3 className="mb-4 text-lg font-semibold text-cyan-400">
                          AI Generated Summary
                        </h3>

                        <div className="whitespace-pre-wrap leading-8 text-slate-200">
                          {debate.summary}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default DebateHistory;
