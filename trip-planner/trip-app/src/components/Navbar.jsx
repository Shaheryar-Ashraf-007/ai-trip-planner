import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [scrolled, setScrolled]       = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser]               = useState(null);
  const profileRef                    = useRef(null);
  const navigate                      = useNavigate(); // ← correct hook

  // ── Load user (works for both Google & manual) ────────────────────────────
  useEffect(() => {
    const loadUser = () => {
      try { setUser(JSON.parse(localStorage.getItem("user"))); }
      catch { setUser(null); }
    };
    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  // ── Scroll effect ─────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("token");
    setUser(null);
    setProfileOpen(false);
    window.dispatchEvent(new Event("storage"));
    navigate("/"); // ← navigates to home after sign out
  };

  const firstName = user?.name?.split(" ")[0] || "";
  const initial   = firstName.charAt(0).toUpperCase();
  const isGoogle  = user?.provider === "google";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled
          ? "bg-white/90 backdrop-blur-md shadow-md py-3"
          : "bg-white/80 backdrop-blur-sm shadow-sm py-4"}`}
      >
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              ✈️
            </div>
            <span className="text-lg font-bold tracking-tight">
              AI <span className="text-blue-600">Trip</span> Planner
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={profileRef}>

                {/* Avatar button */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-full pl-1 pr-3 py-1 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  {isGoogle && user.picture ? (
                    <img
                      src={user.picture}
                      alt={firstName}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initial}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{firstName}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden"
                    style={{ animation: "dropIn 0.15s ease" }}
                  >
                    {/* User info */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50">
                      {isGoogle && user.picture ? (
                        <img src={user.picture} alt={firstName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {initial}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        to="/create-trip"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <span className="text-base">✈️</span> New Trip
                      </Link>
                      <Link
                        to="/my-trips"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <span className="text-base">🗺️</span> My Trips
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 py-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      <div className="h-16" />

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default Navbar;