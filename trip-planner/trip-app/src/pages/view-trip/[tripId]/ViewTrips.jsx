import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HotelCard from "../../../components/Card.jsx";
import Itinerary from "../../../components/Itinerary.jsx";
import { fetchPexelsImage } from "../../../services/GlobalApi.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  return parseInt(priceStr.replace(/[^0-9]/g, "")) || 0;
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-blue-100/70 rounded-xl ${className}`} />
);

const LoadingSkeleton = () => (
  <div className="max-w-5xl mx-auto px-5 py-12">
    <Skeleton className="h-4 w-28 mb-8" />
    <Skeleton className="h-6 w-48 mb-3" />
    <Skeleton className="h-12 w-3/4 mb-4" />
    <div className="flex gap-3 mb-10">
      {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-28" />)}
    </div>
    <div className="flex gap-2 mb-8">
      <Skeleton className="h-12 flex-1" />
      <Skeleton className="h-12 flex-1" />
    </div>
    <div className="flex flex-wrap gap-5">
      {[1, 2, 3].map((i) => <Skeleton key={i} className="h-72 w-72" />)}
    </div>
  </div>
);

const BUDGET_DISPLAY = {
  cheap:    { label: "Budget",   icon: "💸", color: "text-green-700 bg-green-50 border-green-200"     },
  moderate: { label: "Moderate", icon: "💳", color: "text-blue-700 bg-blue-50 border-blue-200"       },
  luxury:   { label: "Luxury",   icon: "💎", color: "text-purple-700 bg-purple-50 border-purple-200" },
};

const TRAVELERS_DISPLAY = {
  solo:    { label: "Solo",    icon: "🧍"    },
  couple:  { label: "Couple",  icon: "👫"    },
  family:  { label: "Family",  icon: "👨‍👩‍👧"  },
  friends: { label: "Friends", icon: "🧑‍🤝‍🧑" },
};

// ── HotelsTab with cancelled flag ─────────────────────────────────────────────
const HotelsTab = ({ hotels, destination }) => {
  const [hotelImages, setHotelImages] = useState({});

  useEffect(() => {
    if (!hotels.length) return;

    let cancelled = false; // ← prevents Strict Mode double-fire race condition

    hotels.forEach((hotel, idx) => {
      const query = `${hotel.name} ${destination?.short || destination?.name || ""}`.trim();

      fetchPexelsImage(query, idx).then((url) => {
        if (!cancelled && url) {
          setHotelImages((prev) => ({ ...prev, [idx]: url }));
        }
      });
    });

    return () => { cancelled = true; };
  }, [hotels, destination]);

  if (hotels.length === 0) {
    return (
      <div className="bg-white/75 border border-blue-100 rounded-3xl p-12 text-center">
        <div className="text-5xl mb-4 opacity-30">🏨</div>
        <p className="text-slate-400 font-medium">No hotels found for this trip.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-6">
      {hotels.map((hotel, idx) => (
        <HotelCard
          key={idx}
          image={hotelImages[idx] ?? hotel.imageUrl ?? null}
          name={hotel.name}
          description={hotel.description}
          price={parsePrice(hotel.price)}
          rating={hotel.rating}
          bestseason={hotel.bestseason ?? null}
        />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const ViewTrips = () => {
  const { tripId } = useParams();
  const navigate   = useNavigate();

  const [trip, setTrip]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [mounted, setMounted]     = useState(false);

  useEffect(() => {
    if (!tripId) { navigate("/create-trip"); return; }
    fetchTrip();
  }, [tripId]);

  const fetchTrip = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/trip/view-trip/${tripId}`);
      setTrip(res.data);
      setTimeout(() => setMounted(true), 80);
    } catch (err) {
      console.error("Error fetching trip:", err);
      setError(err?.response?.data?.message || "Failed to load trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-blue-200 opacity-30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-300 opacity-20 blur-3xl" />
        </div>
        <div className="relative z-10"><LoadingSkeleton /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-5">
        <div className="bg-white/80 backdrop-blur-md border border-red-100 rounded-3xl p-10 max-w-md w-full text-center shadow-xl">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Couldn't load trip</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={fetchTrip}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-blue-200">
              Try Again
            </button>
            <button onClick={() => navigate("/create-trip")}
              className="px-5 py-2.5 border border-slate-200 hover:border-blue-300 text-slate-600 text-sm font-semibold rounded-xl transition-colors">
              New Trip
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const { destination, budget, travelers, days, userProfile, plan, createdAt } = trip;

  const toArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return Object.keys(val).sort((a, b) => Number(a) - Number(b)).map((k) => val[k]);
  };

  const hotels    = toArray(plan?.hotels);
  const itinerary = toArray(plan?.itinerary).map((day) => ({
    ...day,
    activities: toArray(day?.activities),
  }));

  const budgetMeta   = BUDGET_DISPLAY[budget]      || { label: budget,    icon: "💰", color: "text-blue-700 bg-blue-50 border-blue-200" };
  const travelerMeta = TRAVELERS_DISPLAY[travelers] || { label: travelers, icon: "👥" };

  const parseDate = (val) => {
    if (!val) return null;
    if (val?.seconds) return new Date(val.seconds * 1000);
    if (typeof val === "string" || typeof val === "number") return new Date(val);
    return null;
  };
  const parsedDate    = parseDate(createdAt);
  const formattedDate = parsedDate
    ? parsedDate.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const totalActivities = itinerary.reduce((sum, d) => sum + (d.activities?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-x-hidden">

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-blue-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-300 opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-blue-200 opacity-20" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 py-12 pb-24">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className={`mb-10 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/create-trip")}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Plan a new trip
            </button>
            {formattedDate && (
              <span className="text-xs text-slate-400 font-medium hidden sm:block">
                Generated on {formattedDate}
              </span>
            )}
          </div>

          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-blue-700 tracking-widest uppercase">AI Generated Trip ✦ Ready to explore</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-2 tracking-tight">
            Your trip to{" "}
            <span className="text-blue-600 italic">
              {destination?.short || destination?.name || "your destination"}
            </span>
          </h1>

          {destination?.name && (
            <p className="text-slate-400 text-base mb-5 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
              {destination.name}{destination.country ? `, ${destination.country}` : ""}
            </p>
          )}

          <div className="flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              📅 {days} {days === 1 ? "Day" : "Days"}
            </span>
            <span className={`inline-flex items-center gap-1.5 border rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${budgetMeta.color}`}>
              {budgetMeta.icon} {budgetMeta.label}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              {travelerMeta.icon} {travelerMeta.label}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              🏨 {hotels.length} Hotel{hotels.length !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              🗓️ {totalActivities} Activities
            </span>
          </div>

          {userProfile?.name && (
            <div className="flex items-center gap-2.5 mt-5 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl px-4 py-3 w-fit">
              {userProfile.picture && (
                <img src={userProfile.picture} alt={userProfile.name} className="w-8 h-8 rounded-full object-cover" />
              )}
              <div>
                <p className="text-xs text-slate-400">Trip planned by</p>
                <p className="text-sm font-semibold text-slate-700">{userProfile.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Tab Switcher ──────────────────────────────────────────────────── */}
        <div className={`flex bg-white/60 backdrop-blur-sm border border-blue-100 rounded-2xl p-1.5 mb-8 gap-1 transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {[
            { key: "itinerary", icon: "🗓️", label: "Day-by-Day Itinerary",  count: `${itinerary.length} days`  },
            { key: "hotels",    icon: "🏨", label: "Hotel Recommendations", count: `${hotels.length} options`  },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300
                ${activeTab === tab.key ? "bg-white shadow-sm text-blue-700" : "text-slate-400 hover:text-slate-600"}`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.key === "itinerary" ? "Itinerary" : "Hotels"}</span>
              {activeTab === tab.key && (
                <span className="hidden sm:inline bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ───────────────────────────────────────────────────── */}
        <div className={`transition-all duration-500 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          {activeTab === "hotels" && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-lg">🏨</div>
                <div>
                  <p className="font-bold text-slate-800 text-base">Hotel Recommendations</p>
                  <p className="text-slate-400 text-xs">{hotels.length} option{hotels.length !== 1 ? "s" : ""} curated for your budget</p>
                </div>
              </div>
              <HotelsTab hotels={hotels} destination={destination} />
            </div>
          )}

          {activeTab === "itinerary" && (
            <Itinerary itinerary={itinerary} />
          )}

        </div>
      </div>
    </div>
  );
};

export default ViewTrips;