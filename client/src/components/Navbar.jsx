import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { clearAuthSession, getAuthUser } from "../api/auth";
import { showSuccess } from "../utils/toast";

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-slate-950 text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
  }`;

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => getAuthUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncAuthUser = () => setUser(getAuthUser());

    window.addEventListener("auth-changed", syncAuthUser);
    window.addEventListener("storage", syncAuthUser);

    return () => {
      window.removeEventListener("auth-changed", syncAuthUser);
      window.removeEventListener("storage", syncAuthUser);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();

    showSuccess("Logged out successfully");

    setMobileMenuOpen(false);

    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-cyan-600 text-sm font-bold text-white">
            DS
          </span>

          <span className="text-lg font-semibold text-slate-950">
            DebateSpace
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {user && (
            <>
              <NavLink to="/" className={navLinkClass}>
                Home
              </NavLink>

              <NavLink
                to="/my-debates"
                className={navLinkClass}
              >
                My Debates
              </NavLink>

              <NavLink
                to="/debate-ai"
                className={navLinkClass}
              >
                AI Debate
              </NavLink>

              <NavLink
                to="/create-debate"
                className={navLinkClass}
              >
                Create Debate
              </NavLink>

              <NavLink
                to="/history"
                className={navLinkClass}
              >
                History
              </NavLink>

              <NavLink
                to="/dashboard"
                className={navLinkClass}
              >
                Dashboard
              </NavLink>
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(!mobileMenuOpen)
            }
            className="rounded-md p-2 text-slate-700 md:hidden"
          >
            {mobileMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

          {user ? (
            <>
              <span className="hidden text-sm font-medium text-slate-600 sm:inline">
                {user.username}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 md:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:inline-flex"
              >
                Sign In
              </Link>

              <Link
                to="/signup"
                className="hidden rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-cyan-600/20 transition hover:bg-cyan-700 sm:inline-flex"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="flex flex-col gap-2 p-4">
            {user ? (
              <>
                <p className="mb-2 text-sm font-medium text-slate-500">
                  {user.username}
                </p>

                <NavLink
                  to="/"
                  className={navLinkClass}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  Home
                </NavLink>

                <NavLink
                  to="/my-debates"
                  className={navLinkClass}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  My Debates
                </NavLink>

                <NavLink
                  to="/debate-ai"
                  className={navLinkClass}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  AI Debate
                </NavLink>

                <NavLink
                  to="/create-debate"
                  className={navLinkClass}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  Create Debate
                </NavLink>

                <NavLink
                  to="/history"
                  className={navLinkClass}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  History
                </NavLink>

                <NavLink
                  to="/dashboard"
                  className={navLinkClass}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                >
                  Dashboard
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="mt-2 rounded-md border border-slate-300 px-4 py-2 text-left text-sm font-medium text-slate-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
                >
                  Sign In
                </Link>

                <Link
                  to="/signup"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className="rounded-md bg-cyan-600 px-3 py-2 text-center font-medium text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;