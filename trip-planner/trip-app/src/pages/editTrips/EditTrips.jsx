import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const BUDGET_OPTIONS = [
  { value: "cheap",    label: "Budget",   icon: "💸", desc: "Affordable & practical",   color: "border-green-300 bg-green-50 text-green-800"    },
  { value: "moderate", label: "Moderate", icon: "💳", desc: "Balance of cost & comfort", color: "border-blue-300 bg-blue-50 text-blue-800"       },
  { value: "luxury",   label: "Luxury",   icon: "💎", desc: "Premium experience",        color: "border-purple-300 bg-purple-50 text-purple-800" },
];

export default function EditTrips() {
  const { tripId } = useParams();
  const navigate   = useNavigate();

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState(null);
  const [budget,   setBudget]   = useState("");

  // Read-only display info
  const [tripInfo, setTripInfo] = useState({ destination: "", days: "" });

  useEffect(() => {
    fetchTrip();
  }, []);

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const res  = await axios.get(`${API_BASE}/api/trip/view-trip/${tripId}`);
      const data = res.data;
      setBudget(data.budget || "");
      setTripInfo({
        destination: data.destination?.name || data.location || "—",
        days:        data.days || "—",
      });
      setTimeout(() => setMounted(true), 60);
    } catch (err) {
      console.error("Error fetching trip:", err);
      setError("Failed to load trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!budget) { setError("Please select a budget."); return; }
    setSaving(true);
    setError(null);
    try {
      await axios.put(`${API_BASE}/api/trip/update-trips/${tripId}`, { budget });
      setSuccess(true);
      setTimeout(() => navigate(-1), 1200);
    } catch (err) {
      console.error("Update error:", err);
      setError(err?.response?.data?.message || "Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-x-hidden">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-blue-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-300 opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-5 py-12">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors group mb-8"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to trip
        </button>

        {/* Card */}
        <div
          className="bg-white/80 backdrop-blur-md rounded-3xl border border-blue-100 shadow-xl shadow-blue-100/40 overflow-hidden"
          style={{
            opacity:    mounted ? 1 : 0,
            transform:  mounted ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-7">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">Edit Trip</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Change Budget 💰</h1>
            <p className="text-blue-100 text-sm mt-1">Select a new budget for your trip</p>
          </div>

          <div className="px-8 py-8 space-y-6">

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-16 bg-blue-100/60 rounded-2xl" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-28 bg-blue-100/60 rounded-2xl" />
                  <div className="h-28 bg-blue-100/60 rounded-2xl" />
                  <div className="h-28 bg-blue-100/60 rounded-2xl" />
                </div>
                <div className="h-12 bg-blue-100/60 rounded-2xl" />
              </div>
            ) : (
              <>
                {/* Trip info pill — read only */}
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-medium">Trip</p>
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {tripInfo.destination} · {tripInfo.days} {tripInfo.days === 1 ? "day" : "days"}
                    </p>
                  </div>
                </div>

                {/* Budget selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 tracking-widest uppercase">
                    Select Budget
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {BUDGET_OPTIONS.map((opt) => {
                      const selected = budget === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setBudget(opt.value); setError(null); }}
                          className={`relative flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer
                            ${selected
                              ? `${opt.color} shadow-md scale-[1.04]`
                              : "border-slate-100 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50/40"
                            }`}
                        >
                          {selected && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </span>
                          )}
                          <span className="text-2xl">{opt.icon}</span>
                          <span className="text-xs font-bold leading-tight">{opt.label}</span>
                          <span className="text-[10px] leading-tight opacity-60">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                    <span className="text-lg">⚠️</span>
                    <p className="text-red-600 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
                    <span className="text-lg">✅</span>
                    <p className="text-green-700 text-sm font-medium">Budget updated! Redirecting…</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-semibold hover:border-blue-200 hover:text-blue-600 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={saving || success}
                    className="flex-[2] py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Saving…
                      </>
                    ) : success ? <>✅ Saved!</> : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Update Budget
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}