import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getApiErrorMessage, registerUser, saveAuthSession } from "../api/auth";
import { showError, showSuccess } from "../utils/toast";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await registerUser(formData);

      saveAuthSession(data);

      showSuccess("Account created successfully!");

      navigate("/");
    } catch (requestError) {
      showError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100svh-65px)] bg-[#020b2d] font-sans text-slate-100 selection:bg-cyan-500/30 flex items-center py-12">
      <section className="mx-auto w-full grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        {/* Left Column - Hero Text */}
        <div className="hidden lg:flex lg:flex-col lg:justify-center pr-8">
          <div className="mb-6 h-1 w-12 rounded-full bg-cyan-500"></div>
          <p className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Join DebateSpace
          </p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
            Start your next debate.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-400 font-medium">
            Create debate rooms, join live video debates, take notes, and
            practice arguments with an AI debate partner.
          </p>

          {/* Feature Highlights */}
          <div className="mt-10 grid gap-4 text-sm font-medium text-slate-300 pr-12">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm flex items-center gap-3">
              <span className="text-cyan-400 text-lg">🎥</span>
              Live one-on-one video debates
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm flex items-center gap-3">
              <span className="text-cyan-400 text-lg">🔒</span>
              Private debate rooms with shared notes
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-sm flex items-center gap-3">
              <span className="text-cyan-400 text-lg">🤖</span>
              Debate against AI anytime
            </div>
          </div>
        </div>

        {/* Right Column - Signup Card */}
        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl sm:p-10 relative overflow-hidden">
          {/* Subtle top gradient bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-50"></div>

          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Create account
            </h2>
            <p className="mt-3 text-sm font-medium text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                placeholder="e.g. asha_mehta"
              />
            </div>

            <div>
              <label
                htmlFor="signupEmail"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Email address
              </label>
              <input
                id="signupEmail"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="signupPassword"
                className="block text-sm font-semibold text-slate-300 mb-2"
              >
                Password
              </label>
              <input
                id="signupPassword"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="block w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                placeholder="Create a password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-cyan-400 px-4 py-3.5 text-sm font-bold text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all hover:bg-cyan-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-slate-950"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default Signup;
