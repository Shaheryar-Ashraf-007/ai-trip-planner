import { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [authMode, setAuthMode]     = useState("login");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [name, setName]             = useState("");
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState("");
  const navigate                    = useNavigate();

  const clearError = () => setError("");

  // ── Manual Login ──────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); clearError();
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  // ── Manual Signup ─────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true); clearError();
    try {
      const res = await axios.post("http://localhost:3000/api/auth/signup", { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed. Please try again.");
    } finally { setLoading(false); }
  };

  // ── Google Login ──────────────────────────────────────────────────────────
  const googleLogin = useGoogleLogin({
  onSuccess: async (tokenRes) => {
    setGoogleLoading(true); clearError();
    try {
      // Step 1 — get Google profile
      const { data: googleData } = await axios.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${tokenRes.access_token}` } }
      );

      // Step 2 — exchange with YOUR backend for a real JWT
      const { data } = await axios.post(
        "http://localhost:3000/api/auth/google-auth",
        {
          name:    googleData.name,
          email:   googleData.email,
          picture: googleData.picture,
        }
      );

      // Step 3 — save the real JWT (not Google's access token)
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));
      navigate("/create-trip");

    } catch {
      setError("Google login failed. Please try again.");
    } finally { setGoogleLoading(false); }
  },
  onError: () => setError("Google login was cancelled."),
});

  const handleSubmit = () => authMode === "login" ? handleLogin() : handleSignup();

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background blobs — same as CreateTrip */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-blue-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-300 opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-blue-200 opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-md" style={{ animation: "fadeUp 0.35s ease" }}>

        {/* Card */}
        <div className="bg-white bg-opacity-80 backdrop-blur-md border border-blue-100 rounded-3xl shadow-xl p-8">

          {/* Logo */}
          <div className="flex justify-center mb-7">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                ✈️
              </div>
              <span className="text-lg font-bold tracking-tight">
                AI <span className="text-blue-600">Trip</span> Planner
              </span>
            </Link>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-7 gap-1">
            {["login", "signup"].map((mode) => (
              <button
                key={mode}
                onClick={() => { setAuthMode(mode); clearError(); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                  ${authMode === mode
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"}`}
              >
                {mode === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {authMode === "login" ? "Welcome back 👋" : "Create your account ✨"}
            </h1>
            <p className="text-sm text-slate-400">
              {authMode === "login"
                ? "Sign in to access your travel plans."
                : "Start planning your perfect journey today."}
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-5"
              style={{ animation: "fadeUp 0.2s ease" }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Fields */}
          <div className="space-y-3 mb-5">

            {/* Name — signup only */}
            {authMode === "signup" && (
              <div className="relative" style={{ animation: "fadeUp 0.2s ease" }}>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError(); }}
                  onKeyDown={handleKeyDown}
                  className="w-full border-2 border-slate-200 focus:border-blue-400 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all bg-white"
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError(); }}
                onKeyDown={handleKeyDown}
                className="w-full border-2 border-slate-200 focus:border-blue-400 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all bg-white"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                onKeyDown={handleKeyDown}
                className="w-full border-2 border-slate-200 focus:border-blue-400 rounded-2xl pl-10 pr-12 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPass ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm tracking-wide
              bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500
              shadow-lg shadow-blue-200
              hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5
              active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
              transition-all duration-200 flex items-center justify-center gap-2 mb-4"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {authMode === "login" ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              authMode === "login" ? "Log in" : "Create account"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">or continue with</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Google button */}
          <button
            onClick={() => googleLogin()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl border-2 border-slate-200
              bg-white hover:bg-slate-50 hover:border-blue-300 hover:shadow-md
              disabled:opacity-70 disabled:cursor-not-allowed
              transition-all duration-200 group mb-6"
          >
            {googleLoading ? (
              <svg className="w-4 h-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </span>
          </button>

          {/* Footer note */}
          <p className="text-xs text-slate-400 text-center">
            By continuing, you agree to our{" "}
            <span className="text-blue-500 hover:underline cursor-pointer">Terms</span>
            {" "}and{" "}
            <span className="text-blue-500 hover:underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-5">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 transition-colors font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Login;