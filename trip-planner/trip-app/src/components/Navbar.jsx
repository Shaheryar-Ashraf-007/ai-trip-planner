import { useState, useEffect, useRef } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const [userProfile, setUserProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userProfile"));
    } catch {
      return null;
    }
  });

  const profileRef = useRef(null);

  // Shrink navbar on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Google Login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenRes) => {
      localStorage.setItem("user", JSON.stringify(tokenRes));
      setUser(tokenRes);
      setOpenDialog(false);
      try {
        const res = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenRes.access_token}` },
          },
        );
        setUserProfile(res.data);
        localStorage.setItem("userProfile", JSON.stringify(res.data));
      } catch (err) {
        console.error("Profile fetch failed:", err);
      }
    },
    onError: (err) => console.error("Google login error:", err),
  });

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    setUser(null);
    setUserProfile(null);
    setProfileOpen(false);
  };

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${
            scrolled
              ? "bg-white/90 backdrop-blur-md shadow-md shadow-blue-100/50 py-3"
              : "bg-white/80 backdrop-blur-sm shadow-sm py-4"
          }`}
      >
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          {/* ── Logo ────────────────────────────────────────────────────────── */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200 group-hover:shadow-blue-300 transition-shadow">
              <img
                src="/logo.png"
                alt="logo"
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span className="text-white text-base hidden">✈️</span>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              AI <span className="text-blue-600">Trip</span> Planner
            </span>
          </a>

          {/* ── Right Side ────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            {user && userProfile ? (
              /* ── Logged-in: Avatar + Dropdown ─────────────────────────── */
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center gap-2.5 bg-white border border-blue-100 rounded-full pl-1 pr-3 py-1 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
                >
                  <img
                    src={userProfile.picture}
                    alt={userProfile.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-sm font-semibold text-slate-700 hidden sm:inline">
                    {userProfile.given_name}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-blue-100 border border-blue-50 overflow-hidden"
                    style={{ animation: "fadeDown 0.18s ease" }}
                  >
                    {/* User info */}
                    <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-white border-b border-blue-100 flex items-center gap-3">
                      <img
                        src={userProfile.picture}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {userProfile.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {userProfile.email}
                        </p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div
                      className="py-1.5"
                      onClick={() => (window.location.href = "/my-trips")}
                    >
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                        🗺️
                        <span>My Trips</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 py-1.5">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Logged-out: Sign-in Button ──────────────────────────── */
              <button
                onClick={() => setOpenDialog(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold
                  px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300
                  transition-all duration-200 hover:-translate-y-px active:translate-y-0"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Sign in
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <span
                className={`block w-5 h-0.5 bg-slate-600 rounded-full transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-slate-600 rounded-full transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`block w-5 h-0.5 bg-slate-600 rounded-full transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ─────────────────────────────────────────────── */}
      </nav>

      {/* Spacer so page content doesn't sit under fixed navbar */}
      <div className="h-16" />

      {/* ── Google Sign-In Dialog ──────────────────────────────────────────── */}
      {openDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpenDialog(false)}
          />

          {/* Modal */}
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5"
            style={{ animation: "fadeUp 0.25s ease" }}
          >
            <button
              onClick={() => setOpenDialog(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none"
            >
              ×
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-3xl">
              ✈️
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900 mb-1.5">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Sign in to access your trips and generate new personalized
                itineraries.
              </p>
            </div>

            <button
              onClick={() => googleLogin()}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl border-2 border-slate-200
                bg-white hover:bg-slate-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                Continue with Google
              </span>
            </button>

            <p className="text-xs text-slate-400 text-center">
              By signing in, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
