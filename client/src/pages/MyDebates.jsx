import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDebate, getMyDebates } from "../api/debateApi";
import { showError, showSuccess } from "../utils/toast";
import PageLoader from "../components/PageLoader";

function MyDebates() {
  const [debates, setDebates] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebates = async () => {
      try {
        const response = await getMyDebates();

        setDebates(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDebates();
  }, []);

  const copyRoomId = async (roomId) => {
    try {
      await navigator.clipboard.writeText(roomId);

      showSuccess("Room ID copied");
    } catch (error) {
      console.error(error);
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

  if (loading) {
    return <PageLoader />;
  }

  return (
    <main className="min-h-screen bg-[#020b2d] py-12 px-4 sm:px-6 lg:px-8 text-slate-100 font-sans selection:bg-cyan-500/30">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left rounded-3xl border border-slate-800 bg-slate-900/50 p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            My Debates
          </h1>
          <p className="text-slate-400">
            Manage, review, and rejoin your active debate rooms.
          </p>
        </div>

        {/* Content Section */}
        {debates.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/30 py-20 px-4 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-4xl shadow-inner mb-6">
              🎤
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              No debates created yet
            </h2>
            <p className="text-slate-400 max-w-sm">
              You haven't set up any rooms. Create your first debate room to get
              started!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {debates.map((debate) => (
              <div
                key={debate._id}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  {/* Left Column: Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                          debate.status === "waiting"
                            ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                            : debate.status === "active"
                              ? "border-green-500/30 bg-green-500/10 text-green-400"
                              : "border-red-500/30 bg-red-500/10 text-red-400"
                        }`}
                      >
                        {debate.status === "waiting" && (
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                        )}
                        {debate.status === "active" && (
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        )}
                        {debate.status === "waiting"
                          ? "Waiting"
                          : debate.status === "active"
                            ? "Live"
                            : "Finished"}
                      </span>
                      <p className="text-xs font-medium text-slate-500">
                        {new Date(debate.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">
                      {debate.topic}
                    </h2>

                    <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Room ID
                      </span>
                      <span className="font-mono text-sm text-cyan-300 select-all">
                        {debate.roomId}
                      </span>
                    </div>

                    {debate.status === "ended" && (
                      <p className="mt-4 text-sm font-medium text-slate-400 bg-slate-800/50 inline-block px-3 py-1 rounded-md">
                        Ended By:{" "}
                        <span className="text-slate-300">
                          {debate.endReason === "timer"
                            ? "Timer Expired ⏱️"
                            : "Participant Left 🚪"}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-col items-stretch gap-3 sm:flex-row md:flex-col md:items-end justify-start md:min-w-[160px]">
                    {debate.status !== "ended" ? (
                      <>
                        <button
                          onClick={() =>
                            navigate(`/video-debate/${debate.roomId}`)
                          }
                          className="w-full sm:w-auto md:w-full rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-300 active:scale-[0.98] shadow-[0_0_15px_rgba(34,211,238,0.15)] text-center"
                        >
                          {debate.status === "active"
                            ? "Rejoin Debate"
                            : "Join Debate"}
                        </button>

                        <button
                          onClick={() => copyRoomId(debate.roomId)}
                          className="w-full sm:w-auto md:w-full rounded-xl border border-cyan-500/30 bg-transparent px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/10 active:scale-[0.98] text-center"
                        >
                          Copy ID
                        </button>

                        <button
                          onClick={() => handleDelete(debate.roomId)}
                          className="w-full sm:w-auto md:w-full rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 active:scale-[0.98] text-center"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-5 py-2.5 text-center text-sm font-semibold text-slate-400 cursor-not-allowed">
                          Closed
                        </div>
                        <button
                          onClick={() => handleDelete(debate.roomId)}
                          className="w-full sm:w-auto md:w-full rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 active:scale-[0.98] text-center"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default MyDebates;
