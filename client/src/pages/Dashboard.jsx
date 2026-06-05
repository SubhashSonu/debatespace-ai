import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDebateHistory } from "../api/debateApi";

function Dashboard() {
  const navigate = useNavigate();

  const [debates, setDebates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDebateHistory();
        setDebates(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const totalDebates = debates.length;

  const completedDebates = debates.filter(
    (debate) => debate.status === "ended",
  ).length;

  const userLeftDebates = debates.filter(
    (debate) => debate.endReason === "user_left",
  ).length;


  const totalDebateSeconds = debates.reduce((total, debate) => {
    if (!debate.startedAt || !debate.endedAt) {
      return total;
    }

    return (
      total + (new Date(debate.endedAt) - new Date(debate.startedAt)) / 1000
    );
  }, 0);

  const totalTimeDisplay =
    totalDebateSeconds < 3600
      ? `${Math.floor(totalDebateSeconds / 60)}m`
      : `${(totalDebateSeconds / 3600).toFixed(1)}h`;

  const latestDebate = debates.length > 0 ? debates[0] : null;

  return (
    <main className="min-h-screen bg-[#020b2d] text-white">
      {" "}
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Welcome */}

        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h2 className="text-3xl font-bold">Welcome Back 👋</h2>

          <p className="mt-3 text-slate-400">
            You have participated in {totalDebates} debates.
          </p>
        </div>

        {/* Quick Actions */}

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Quick Actions</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => navigate("/create-debate")}
              className="rounded-2xl bg-cyan-600 p-6 text-left transition hover:bg-cyan-700"
            >
              <p className="text-lg font-semibold">Create Debate</p>
            </button>

            <button
              onClick={() => navigate("/debate-ai")}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-cyan-500"
            >
              <p className="text-lg font-semibold">AI Debate</p>
            </button>

            <button
              onClick={() => navigate("/history")}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-left transition hover:border-cyan-500"
            >
              <p className="text-lg font-semibold">View History</p>
            </button>
          </div>
        </div>

        {/* Latest Debate */}

        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Latest Debate</h2>

          {latestDebate ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-2xl font-bold">{latestDebate.topic}</h3>

              <div className="mt-4 flex flex-wrap gap-3">
                <span className="rounded-full bg-green-500/20 px-4 py-2 text-sm text-green-400">
                  Completed
                </span>

                <span className="rounded-full bg-red-500/20 px-4 py-2 text-sm text-red-400">
                  {latestDebate.endReason === "user_left"
                    ? "Participant Left"
                    : "Timer Expired"}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              No debates yet
            </div>
          )}
        </div>

        {/* Stats */}
        <h2 className="mb-4 text-2xl font-bold">Statistics</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Debates</p>

            <p className="mt-2 text-3xl font-bold text-cyan-400">
              {totalDebates}
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Completed</p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {completedDebates}
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 p-5">
            <p className="text-sm text-slate-400">User Left</p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {userLeftDebates}
            </p>
          </div>

          <div className="rounded-xl bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Time</p>

            <p className="mt-2 text-3xl font-bold text-cyan-400">
              {totalTimeDisplay}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
