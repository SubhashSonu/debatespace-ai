import { Link } from "react-router-dom";
import { getDebateHistory } from "../api/debateApi";
import { useEffect, useState } from "react";
import PageLoader from "../components/PageLoader";

function Home() {
  const [latestDebate, setLatestDebate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestDebate = async () => {
      try {
        const response = await getDebateHistory();

        if (response.data.length > 0) {
          setLatestDebate(response.data[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestDebate();
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <main className="min-h-screen bg-[#020b2d] text-white">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left */}
          <div>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400">
              🎤 Real-Time Video Debates + AI Opponent
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight lg:text-6xl">
              Master Debate Skills Through
              <span className="block text-cyan-400">
                Live Debates & AI Challenges
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Create debate rooms, challenge AI opponents, capture notes during
              discussions, generate AI-powered summaries, and track your debate
              journey in one platform.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/create-debate"
                className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400"
              >
                Create Debate Room
              </Link>

              <Link
                to="/debate-ai"
                className="rounded-xl border border-cyan-500 px-6 py-3 font-semibold text-cyan-400 transition hover:bg-cyan-500/10"
              >
                Start AI Debate
              </Link>
            </div>
          </div>

          {/* Right */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="rounded-2xl bg-slate-950 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">
                  {latestDebate?.topic || "Start Your First Debate"}
                </h3>

                <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-400">
                  {latestDebate?.status === "ended"
                    ? "Completed"
                    : latestDebate?.status === "active"
                      ? "Live"
                      : "Waiting"}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <p className="text-sm text-slate-400">Duration</p>
                  <p className="mt-1 text-lg font-bold">
                    {latestDebate ? `${latestDebate.duration / 60} min` : "-"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <p className="text-sm text-slate-400">Participants</p>
                  <p className="mt-1 text-lg font-bold">
                    {latestDebate?.participants?.length || 0}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <p className="text-sm text-slate-400">Notes</p>
                  <p className="mt-1 text-lg font-bold">
                    {latestDebate?.notes?.length || 0}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <p className="text-sm text-slate-400">AI Summary</p>
                  <p className="mt-1 text-lg font-bold text-cyan-400">
                    {latestDebate?.summary ? "Available" : "Not Generated"}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                <p className="font-medium text-cyan-300">
                  AI Summary Generated
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  Main arguments, counter arguments, key takeaways and neutral
                  conclusion generated automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-12 text-center text-4xl font-bold">
          Everything You Need For Debating
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "🎥",
              title: "Live Video Debates",
              desc: "Debate face-to-face using WebRTC-powered video rooms.",
            },
            {
              icon: "🤖",
              title: "AI Debate Opponent",
              desc: "Challenge AI with rebuttals and counter arguments.",
            },
            {
              icon: "📝",
              title: "Debate Notes",
              desc: "Capture important arguments during live debates.",
            },
            {
              icon: "📄",
              title: "AI Summary",
              desc: "Generate structured summaries after every debate.",
            },
            {
              icon: "📚",
              title: "Debate History",
              desc: "Review previous debates and outcomes anytime.",
            },
            {
              icon: "📊",
              title: "Dashboard Analytics",
              desc: "Track debate participation and total debate time.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-500"
            >
              <div className="text-4xl">{feature.icon}</div>

              <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>

              <p className="mt-3 text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-12 text-center text-4xl font-bold">
          How DebateSpace Works
        </h2>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
          {[
            "Create Room",
            "Invite Opponent",
            "Join Debate",
            "Take Notes",
            "Generate Summary",
            "Review History",
          ].map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 font-bold text-black">
                {index + 1}
              </div>

              <h3 className="font-medium">{step}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800 bg-slate-900 p-12 text-center">
          <h2 className="text-4xl font-bold">
            Ready To Improve Your Debate Skills?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Practice against real people, challenge AI opponents, capture
            arguments, and review every debate with AI-powered summaries.
          </p>

          <Link
            to="/create-debate"
            className="mt-8 inline-block rounded-xl bg-cyan-500 px-8 py-4 font-semibold text-black hover:bg-cyan-400"
          >
            Start Debating
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
