import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { generateTravelPlan } from "../services/AiTripServices.js";

const CreateTrip = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedDest, setSelectedDest] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ budget: "", travelers: "", days: 1 });
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [generatingStep, setGeneratingStep] = useState(""); // loading status message
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [userProfile, setUserProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("userProfile")); } catch { return null; }
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [generatingTrip, setGeneratingTrip] = useState(false);
  const dropdownRef = useRef(null);
  const inputWrapRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    const handleClick = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputWrapRef.current && !inputWrapRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const updateDropdownPosition = useCallback(() => {
    if (inputWrapRef.current) {
      const rect = inputWrapRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, []);

  useEffect(() => {
    if (showDropdown) {
      updateDropdownPosition();
      window.addEventListener("resize", updateDropdownPosition);
      window.addEventListener("scroll", updateDropdownPosition, true);
    }
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [showDropdown, updateDropdownPosition]);

  // ── Google login hook ─────────────────────────────────────────────────────
  const googleLogin = useGoogleLogin({
    onSuccess: (tokenRes) => {
      localStorage.setItem("user", JSON.stringify(tokenRes));
      setUser(tokenRes);
      fetchUserProfile(tokenRes);
      setOpenDialog(false);
    },
    onError: (err) => console.error("Google login failed:", err),
  });

  // ── Fetch Google user profile ─────────────────────────────────────────────
  const fetchUserProfile = useCallback(async (userData) => {
    if (!userData?.access_token) return;
    try {
      const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${userData.access_token}` },
      });
      setUserProfile(res.data);
      localStorage.setItem("userProfile", JSON.stringify(res.data));
    } catch (err) {
      console.error("Profile fetch failed:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("userProfile");
      setUser(null);
      setUserProfile(null);
      setOpenDialog(true);
    }
  }, []);

  // ── Generate trip (auth-gated) ────────────────────────────────────────────
  const generateTrip = async () => {
    if (!selectedDest)        return alert("Please select a destination");
    if (!formData.budget)     return alert("Please select a budget");
    if (!formData.travelers)  return alert("Please select who you're traveling with");
    if (!user) { setOpenDialog(true); return; }

    setGeneratingTrip(true);
    setGeneratingStep("Verifying your account...");

    try {
      // Step 1 — re-verify Google token
      const profileRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${user.access_token}` },
      });
      setUserProfile(profileRes.data);
      localStorage.setItem("userProfile", JSON.stringify(profileRes.data));

      // Step 2 — call AI backend
      setGeneratingStep("AI is crafting your itinerary...");
      const plan = await generateTravelPlan({
        destination: selectedDest,
        budget:      formData.budget,
        travelers:   formData.travelers,
        days:        formData.days,
        userProfile: profileRes.data
      });

        localStorage.setItem("tripId", plan.tripId);


      // Step 3 — navigate to results
      setGeneratingStep("Almost ready...");
      navigate(`/view-trip/${plan.tripId}`, { state: plan });
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("userProfile");
        setUser(null);
        setUserProfile(null);
        setOpenDialog(true);
      } else {
        console.error("Trip generation failed:", err);
        alert(err?.response?.data?.message || "Failed to generate trip. Please try again.");
      }
    } finally {
      setGeneratingTrip(false);
      setGeneratingStep("");
    }
  };

  // ── Sign out ──────────────────────────────────────────────────────────────
  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userProfile");
    setUser(null);
    setUserProfile(null);
  };

  const fetchSuggestions = useCallback(async (val) => {
    if (!val || val.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&limit=6&addressdetails=1`
      );
      const data = await res.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
    } catch (err) {
      console.error(err);
    }
    setSearching(false);
  }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedDest(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
  };

  const handleSelect = (place) => {
    const city =
      place.address?.city ||
      place.address?.town ||
      place.address?.village ||
      place.display_name.split(",")[0];
    setSelectedDest({
      name: place.display_name,
      short: city,
      country: place.address?.country || "",
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
    });
    setQuery(city);
    setShowDropdown(false);
    setSuggestions([]);
    setActiveStep(2);
  };

  const getPlaceIcon = (type) => {
    const t = type || "";
    if (t.includes("city") || t.includes("town")) return "🏙️";
    if (t.includes("country")) return "🌍";
    if (t.includes("airport")) return "✈️";
    if (t.includes("beach") || t.includes("island")) return "🏝️";
    if (t.includes("mountain")) return "⛰️";
    if (t.includes("park")) return "🌿";
    return "📍";
  };

  const osmUrl = selectedDest
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${selectedDest.lon - 0.08},${selectedDest.lat - 0.08},${selectedDest.lon + 0.08},${selectedDest.lat + 0.08}&layer=mapnik&marker=${selectedDest.lat},${selectedDest.lon}`
    : null;

  const budgets = [
    { value: "cheap", label: "Budget", icon: "💸", desc: "Smart & economical" },
    { value: "moderate", label: "Moderate", icon: "💳", desc: "Balanced comfort" },
    { value: "luxury", label: "Luxury", icon: "💎", desc: "Premium experience" },
  ];

  const travelers = [
    { value: "solo", label: "Solo", icon: "🧍", desc: "Just me" },
    { value: "couple", label: "Couple", icon: "👫", desc: "Two of us" },
    { value: "family", label: "Family", icon: "👨‍👩‍👧", desc: "With kids" },
    { value: "friends", label: "Friends", icon: "🧑‍🤝‍🧑", desc: "Squad trip" },
  ];

  const steps = ["Destination", "Budget", "Travelers", "Days", "Ready"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-x-hidden">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-blue-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-300 opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-blue-200 opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-blue-200 opacity-30" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-16 pb-24">

        {/* Header */}
        <div className={`mb-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 bg-white bg-opacity-80 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs font-semibold text-blue-700 tracking-widest uppercase">AI Travel Planner</span>
            </div>

            {/* User avatar / sign-in */}
            {user && userProfile ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white bg-opacity-80 backdrop-blur-sm border border-blue-100 rounded-full pl-1.5 pr-3 py-1 shadow-sm">
                  <img src={userProfile.picture} alt={userProfile.name} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{userProfile.given_name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium px-2 py-1"
                >Sign out</button>
              </div>
            ) : (
              <button
                onClick={() => setOpenDialog(true)}
                className="flex items-center gap-2 bg-white bg-opacity-80 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-2 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Sign in
              </button>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4 tracking-tight">
            Plan your perfect{" "}
            <span className="text-blue-600 italic">journey</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-md">
            Tell us where you'd like to go and we'll craft a bespoke itinerary tailored just for you.
          </p>
        </div>

        {/* Progress Steps */}
        <div className={`flex bg-white bg-opacity-60 backdrop-blur-sm border border-blue-100 rounded-2xl p-1.5 mb-8 gap-1 transition-all duration-700 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {steps.map((s, i) => {
            const n = i + 1;
            const isActive = activeStep === n;
            const isDone = activeStep > n;
            return (
              <div
                key={s}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all duration-300
                  ${isActive ? "bg-white shadow-sm text-blue-700" : isDone ? "text-green-600" : "text-slate-400"}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${isActive ? "bg-blue-600 text-white" : isDone ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                  {isDone ? "✓" : n}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </div>
            );
          })}
        </div>

        {/* Cards */}
        <div className="space-y-5">

          {/* Destination Card */}
          <div className={`bg-white bg-opacity-75 backdrop-blur-md border border-blue-100 rounded-3xl p-6 shadow-sm transition-all duration-700 delay-150 hover:shadow-md
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-lg">🌍</div>
              <div>
                <p className="font-bold text-slate-800 text-base">Where to?</p>
                <p className="text-slate-400 text-xs">Search your dream destination</p>
              </div>
            </div>

            {/* Search with Dropdown */}
            <div className="relative">
              <div
                ref={inputWrapRef}
                className={`flex items-center gap-3 border-2 rounded-2xl px-4 py-3 bg-white transition-all duration-200
                ${showDropdown
                  ? "border-blue-400 shadow-lg shadow-blue-100 rounded-b-none"
                  : "border-blue-200 focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-100"}`}>

                <span className="text-lg flex-shrink-0 w-6 flex justify-center">
                  {searching ? (
                    <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </span>

                <input
                  type="text"
                  value={query}
                  onChange={handleQueryChange}
                  onFocus={() => { if (suggestions.length > 0) { setShowDropdown(true); updateDropdownPosition(); } }}
                  placeholder="e.g. Paris, Tokyo, Maldives..."
                  className="flex-1 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium bg-transparent"
                />

                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setSelectedDest(null);
                      setSuggestions([]);
                      setShowDropdown(false);
                    }}
                    className="text-slate-300 hover:text-slate-500 transition-colors text-xl leading-none font-light"
                  >×</button>
                )}
              </div>

              {/* Dropdown rendered via portal so it floats above all cards */}
              {showDropdown && suggestions.length > 0 && createPortal(
                <div
                  ref={dropdownRef}
                  style={dropdownStyle}
                  className="bg-white border-2 border-blue-400 border-t-0 rounded-b-2xl shadow-2xl shadow-blue-100 overflow-hidden"
                >
                  <div className="divide-y divide-slate-100">
                    {suggestions.map((place, idx) => {
                      const city =
                        place.address?.city ||
                        place.address?.town ||
                        place.address?.village ||
                        place.display_name.split(",")[0];
                      const country = place.address?.country || "";
                      const region = place.address?.state || place.address?.county || "";
                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelect(place)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left group"
                        >
                          <span className="text-xl w-8 text-center flex-shrink-0">
                            {getPlaceIcon(place.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                              {city}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {[region, country].filter(Boolean).join(", ")}
                            </p>
                          </div>
                          <span className="text-xs text-slate-300 group-hover:text-blue-500 transition-all group-hover:translate-x-0.5 flex-shrink-0">
                            →
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    </svg>
                    <span className="text-xs text-slate-400">Powered by OpenStreetMap</span>
                  </div>
                </div>,
                document.body
              )}
            </div>

            {/* Selected destination pill */}
            {selectedDest && (
              <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full pl-1.5 pr-4 py-1">
                <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">✓</span>
                <span className="text-xs font-semibold text-blue-700 truncate max-w-xs">
                  {selectedDest.short}{selectedDest.country ? `, ${selectedDest.country}` : ""}
                </span>
              </div>
            )}
          </div>

          {/* Budget Card */}
          <div className={`bg-white bg-opacity-75 backdrop-blur-md border border-blue-100 rounded-3xl p-6 shadow-sm transition-all duration-700 delay-200 hover:shadow-md
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-lg">💳</div>
              <div>
                <p className="font-bold text-slate-800 text-base">Budget Range</p>
                <p className="text-slate-400 text-xs">How much are you looking to spend?</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {budgets.map((b) => (
                <button
                  key={b.value}
                  onClick={() => {
                    setFormData({ ...formData, budget: b.value });
                    if (activeStep < 3) setActiveStep(3);
                  }}
                  className={`relative flex flex-col items-center gap-1.5 py-5 px-3 rounded-2xl border-2 transition-all duration-200
                    ${formData.budget === b.value
                      ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 -translate-y-0.5"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-sm"}`}
                >
                  {formData.budget === b.value && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">✓</span>
                  )}
                  <span className="text-2xl">{b.icon}</span>
                  <span className={`text-sm font-bold ${formData.budget === b.value ? "text-blue-700" : "text-slate-700"}`}>{b.label}</span>
                  <span className={`text-xs ${formData.budget === b.value ? "text-blue-500" : "text-slate-400"}`}>{b.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Travelers Card */}
          <div className={`bg-white bg-opacity-75 backdrop-blur-md border border-blue-100 rounded-3xl p-6 shadow-sm transition-all duration-700 delay-300 hover:shadow-md
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-lg">👥</div>
              <div>
                <p className="font-bold text-slate-800 text-base">Travel Party</p>
                <p className="text-slate-400 text-xs">Who's joining the adventure?</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {travelers.map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    setFormData({ ...formData, travelers: t.value });
                    if (activeStep < 4) setActiveStep(4);
                  }}
                  className={`relative flex flex-col items-center gap-1.5 py-4 px-2 rounded-2xl border-2 transition-all duration-200
                    ${formData.travelers === t.value
                      ? "border-blue-500 bg-blue-50 shadow-lg shadow-blue-100 -translate-y-0.5"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-sm"}`}
                >
                  {formData.travelers === t.value && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">✓</span>
                  )}
                  <span className="text-2xl">{t.icon}</span>
                  <span className={`text-xs font-bold ${formData.travelers === t.value ? "text-blue-700" : "text-slate-700"}`}>{t.label}</span>
                  <span className={`text-xs ${formData.travelers === t.value ? "text-blue-500" : "text-slate-400"}`}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Days Card */}
          <div className={`bg-white bg-opacity-75 backdrop-blur-md border border-blue-100 rounded-3xl p-6 shadow-sm transition-all duration-700 delay-[350ms] hover:shadow-md
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-lg">📅</div>
              <div>
                <p className="font-bold text-slate-800 text-base">Trip Duration</p>
                <p className="text-slate-400 text-xs">How many days are you planning to travel?</p>
              </div>
            </div>

            {/* Day display */}
            <div className="flex items-center justify-center mb-5">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl px-8 py-4 text-center min-w-[140px]">
                <p className="text-5xl font-bold text-blue-600 leading-none">{formData.days}</p>
                <p className="text-sm text-blue-400 font-medium mt-1">{formData.days === 1 ? "day" : "days"}</p>
              </div>
            </div>

            {/* Slider */}
            <div className="px-1">
              <input
                type="range"
                min={1}
                max={14}
                value={formData.days}
                onChange={(e) => {
                  setFormData({ ...formData, days: parseInt(e.target.value) });
                  if (activeStep < 5) setActiveStep(5);
                }}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #2563eb ${((formData.days - 1) / 13) * 100}%, #dbeafe ${((formData.days - 1) / 13) * 100}%)`,
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-slate-400 font-medium">1 day</span>
                <span className="text-xs text-slate-400 font-medium">14 days</span>
              </div>
            </div>

            {/* Quick-select day pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[1, 2, 3, 5, 7, 10, 14].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setFormData({ ...formData, days: d });
                    if (activeStep < 5) setActiveStep(5);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200
                    ${formData.days === d
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"}`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Map Card */}
          <div className={`bg-white bg-opacity-75 backdrop-blur-md border border-blue-100 rounded-3xl p-6 shadow-sm transition-all duration-700 delay-[400ms] hover:shadow-md
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-lg">🗺️</div>
              <div>
                <p className="font-bold text-slate-800 text-base">Destination Preview</p>
                <p className="text-slate-400 text-xs">
                  {selectedDest ? `${selectedDest.short}${selectedDest.country ? `, ${selectedDest.country}` : ""}` : "Search a destination above"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-blue-100 h-72 bg-gradient-to-br from-blue-50 to-blue-100">
              {selectedDest ? (
                <iframe
                  src={osmUrl}
                  title="Destination Map"
                  className="w-full h-full border-none block"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                  <span className="text-5xl opacity-25">🌐</span>
                  <p className="text-sm font-medium">Your destination will appear here</p>
                  <p className="text-xs text-slate-300">Search above to get started</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Generate Button */}
        <div className={`mt-6 transition-all duration-700 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
          <button
            onClick={generateTrip}
            disabled={generatingTrip}
            className="w-full py-4 rounded-2xl font-bold text-white text-base tracking-wide
              bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500
              shadow-lg shadow-blue-300
              hover:shadow-xl hover:shadow-blue-400 hover:-translate-y-0.5
              active:translate-y-0 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0
              transition-all duration-200
              flex items-center justify-center gap-3
              relative overflow-hidden group"
          >
            {generatingTrip ? (
              <>
                <svg className="w-5 h-5 animate-spin relative z-10" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="relative z-10">Generating your trip...</span>
              </>
            ) : (
              <>
                <span className="relative z-10">
                  {user ? "Generate My Itinerary" : "Sign in to Generate"}
                </span>
                <span className="relative z-10 text-blue-200 group-hover:translate-x-1.5 transition-transform duration-200 text-lg">→</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            )}
          </button>

          <p className="text-center text-slate-400 text-xs mt-3 tracking-wide">
            {user
              ? "✦ Powered by AI · Your itinerary is generated instantly"
              : "✦ Sign in with Google to unlock your personalized itinerary"}
          </p>
        </div>

      </div>

      {/* ── Generating Overlay ─────────────────────────────────────────────── */}
      {generatingTrip && (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl px-10 py-10 flex flex-col items-center gap-5 w-full max-w-xs mx-4"
            style={{ animation: "fadeUp 0.2s ease" }}>

            {/* Animated plane */}
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <span className="text-4xl" style={{ animation: "planeBounce 1.2s ease-in-out infinite" }}>✈️</span>
              </div>
              {/* Orbit ring */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-300 border-dashed"
                style={{ animation: "spin 3s linear infinite" }} />
            </div>

            <div className="text-center">
              <p className="text-base font-bold text-slate-800 mb-1">Building your trip</p>
              <p className="text-sm text-blue-600 font-medium">{generatingStep}</p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-400"
                  style={{ animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>

            {/* Trip summary pill */}
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {[
                { icon: "📍", text: selectedDest?.short },
                { icon: "📅", text: `${formData.days} day${formData.days > 1 ? "s" : ""}` },
                { icon: "💰", text: formData.budget },
                { icon: "👥", text: formData.travelers },
              ].map((tag) => tag.text && (
                <span key={tag.icon} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs font-semibold text-blue-700">
                  {tag.icon} {tag.text}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Google Sign-In Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900 bg-opacity-40 backdrop-blur-sm"
            onClick={() => setOpenDialog(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5"
            style={{ animation: "fadeUp 0.25s ease" }}>

            <button
              onClick={() => setOpenDialog(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none"
            >×</button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-3xl">
              ✈️
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900 mb-1.5">Sign in to continue</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Create a free account to generate and save your personalized travel itineraries.
              </p>
            </div>

            <button
              onClick={() => googleLogin()}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl border-2 border-slate-200
                bg-white hover:bg-slate-50 hover:border-blue-300 hover:shadow-md
                transition-all duration-200 group"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
                Continue with Google
              </span>
            </button>

            <p className="text-xs text-slate-400 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes planeBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%       { transform: translateY(-6px) rotate(5deg); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1.2); }
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #2563eb;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(37,99,235,0.4);
          cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          box-shadow: 0 2px 14px rgba(37,99,235,0.5);
          transform: scale(1.1);
        }
        input[type=range]::-moz-range-thumb {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: #2563eb;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(37,99,235,0.4);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default CreateTrip;