import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchPexelsImage } from "../services/GlobalApi.js"; // ← adjust path if needed

// ── Activity image with skeleton + fallback ───────────────────────────────────
const FullImage = ({ image, title }) => {
  const [loaded,  setLoaded]  = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [image]);

  const showPlaceholder = !image || errored;

  return (
    <div className="relative w-full h-56 sm:h-72 bg-blue-50 overflow-hidden rounded-2xl">
      {/* Skeleton */}
      {!loaded && !showPlaceholder && (
        <div className="absolute inset-0 animate-pulse bg-blue-100/70 rounded-2xl" />
      )}

      {showPlaceholder ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
          <span className="text-6xl">🗺️</span>
          <span className="text-blue-300 text-sm font-medium">No image available</span>
        </div>
      ) : (
        <img
          src={image}
          alt={title}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className="w-full h-full object-cover rounded-2xl"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease" }}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl" />
    </div>
  );
};

// ── Activity card ─────────────────────────────────────────────────────────────
const ActivityCard = ({ activity, image, index }) => {
  return (
    <div
      className="bg-white rounded-3xl overflow-hidden border border-blue-100 shadow-sm"
      style={{
        opacity:    1,
        animation:  `fadeUp 0.4s ease ${index * 80}ms both`,
      }}
    >
      {/* Full image */}
      <FullImage image={image} title={activity.name} />

      {/* Content */}
      <div className="p-6">
        {/* Time badge */}
        {activity.bestTimeToVisit && (
          <span className="inline-flex items-center gap-1.5 text-blue-500 text-xs font-semibold tracking-wider uppercase mb-3">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {activity.bestTimeToVisit}
          </span>
        )}

        <h3 className="text-slate-900 font-bold text-xl mb-2 leading-tight">{activity.name}</h3>

        {activity.details && (
          <p className="text-slate-500 text-sm leading-relaxed mb-5">{activity.details}</p>
        )}

        {/* Pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {activity.travelTime && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {activity.travelTime}
            </span>
          )}
          {activity.ticketPricing && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100">
              {activity.ticketPricing}
            </span>
          )}
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-100">
                Summer Season
            </span>
        </div>

        {/* Maps button */}
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(activity.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 w-full justify-center py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-md shadow-blue-100 no-underline"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
          View on Google Maps
        </a>
      </div>
    </div>
  );
};

// ── Main ViewPage ─────────────────────────────────────────────────────────────
const ViewPage = () => {
  const location = useLocation();
  const navigate  = useNavigate();

  // dayPlan passed via navigate("/view-place", { state: { dayPlan } })
  const dayPlan = location.state?.dayPlan;

  const [activityImages, setActivityImages] = useState({});

  useEffect(() => {
    if (!dayPlan?.activities?.length) return;

    let cancelled = false;

    dayPlan.activities.forEach((activity, idx) => {
      fetchPexelsImage(activity.name || "", idx).then((url) => {
        if (!cancelled && url) {
          setActivityImages((prev) => ({ ...prev, [idx]: url }));
        }
      });
    });

    return () => { cancelled = true; };
  }, [dayPlan]);

  // Guard: if someone navigates here directly without state
  if (!dayPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center px-5">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-slate-700 font-semibold text-lg mb-2">No day data found</p>
          <p className="text-slate-400 text-sm mb-6">Please open this page from a trip itinerary.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-blue-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-x-hidden">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-blue-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-300 opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-10 pb-20">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors group mb-8"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to itinerary
        </button>

        {/* Page header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-blue-700 tracking-widest uppercase">
              Full Day View
            </span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            Day {dayPlan.day}
          </h1>
          <p className="text-slate-400 text-base mt-1">
            {dayPlan.activities?.length} {dayPlan.activities?.length === 1 ? "activity" : "activities"} planned
          </p>
        </div>

        {/* Activity cards */}
        <div className="space-y-6">
          {dayPlan.activities?.map((activity, idx) => (
            <ActivityCard
              key={idx}
              activity={activity}
              image={activityImages[idx] ?? activity.imageUrl ?? null}
              index={idx}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
};

export default ViewPage;