import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchPexelsImage } from "../../services/GlobalApi.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const BUDGET_LABELS = {
  cheap: "Budget",
  moderate: "Moderate Budget",
  luxury: "Luxury Budget",
};

const formatBudget = (budget) =>
  BUDGET_LABELS[budget?.toLowerCase()] || budget || "—";

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden animate-pulse">
    <div className="h-52 bg-blue-100/70" />
    <div className="bg-white px-4 py-3 border border-t-0 border-gray-100 rounded-b-2xl space-y-2">
      <div className="h-4 bg-blue-100/70 rounded w-3/4" />
      <div className="h-3 bg-blue-100/70 rounded w-1/2" />
    </div>
  </div>
);

// ── Trip card ─────────────────────────────────────────────────────────────────
const TripCard = ({ trip, index, onClick, onDelete, onEdit }) => {
  const [hovered, setHovered] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const locationQuery =
    trip.destination?.short ||
    trip.destination?.name ||
    trip.location ||
    "";

  const budget = formatBudget(trip.budget);
  const days = trip.days || "?";

  useEffect(() => {
    if (!locationQuery) return;
    fetchPexelsImage(locationQuery, index).then((url) => {
      if (url) setImageUrl(url);
    });
  }, [locationQuery, index]);

  const showPlaceholder = !imageUrl || imgError;

  return (
    <div
      onClick={() => onClick(trip.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer rounded-2xl overflow-hidden relative"
      style={{
        boxShadow: hovered
          ? "0 16px 40px rgba(37,99,235,0.15)"
          : "0 2px 12px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {/* Action Buttons */}
      <div
        className="absolute top-3 right-3 flex gap-2 z-10"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Delete */}

        <button
          onClick={() => onEdit(trip.id)}
          className="bg-white/90 hover:bg-white text-blue-600 text-xs font-semibold px-3 py-1 rounded-lg shadow"
        >
          Edit
        </button>


        <button
          onClick={() => onDelete(trip.id)}
          className="bg-white/90 hover:bg-white text-red-600 text-xs font-semibold px-3 py-1 rounded-lg shadow"
        >
          Delete
        </button>

        

      </div>

      {/* Image */}
      <div className="relative overflow-hidden h-52 bg-blue-50">
        {!imgLoaded && !showPlaceholder && (
          <div className="absolute inset-0 animate-pulse bg-blue-100/70" />
        )}

        {showPlaceholder ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-blue-100">
            <span className="text-5xl">🗺️</span>
            <span className="text-blue-300 text-xs font-medium">
              No image available
            </span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={locationQuery}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            style={{
              opacity: imgLoaded ? 1 : 0,
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition:
                "transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.3s ease",
            }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Info */}
      <div className="bg-white px-4 py-3 border border-t-0 border-gray-100 rounded-b-2xl">
        <h3 className="text-gray-900 font-bold text-base truncate">
          {trip.destination?.name || trip.location || "Unknown destination"}
        </h3>
        <p className="text-gray-500 text-sm mt-0.5">
          {days} {days === 1 ? "Day" : "Days"} · {budget}
        </p>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MyTrips() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/api/trip/my-trips`);
      setTrips(res.data);
    } catch (err) {
      console.error("Error fetching trips:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load trips. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ DELETE FUNCTION
  const handleDelete = async (tripId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this trip?");
    if (!confirmDelete) return;

    try {
await axios.delete(`${API_BASE}/api/trip/delete-trip/${tripId}`);
      setTrips((prev) => prev.filter((trip) => trip.id !== tripId));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete trip");
    }
  };

  return (
    <div className="min-h-screen bg-white px-8 py-10 max-w-5xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Trips</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-400 mt-0.5">
              {trips.length} trip{trips.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
        <button
          onClick={() => navigate("/create-trip")}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md shadow-blue-100"
        >
          New Trip
        </button>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-slate-700 font-semibold text-lg mb-1">
            Couldn't load trips
          </p>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <button
            onClick={fetchTrips}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-blue-200"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="text-slate-700 font-semibold text-lg mb-1">
            No trips yet
          </p>
          <p className="text-slate-400 text-sm mb-6">
            Start planning your first adventure!
          </p>
          <button
            onClick={() => navigate("/create-trip")}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-blue-200"
          >
            Create a Trip
          </button>
        </div>
      )}

      {!loading && !error && trips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {trips.map((trip, index) => (
            <TripCard
              key={trip.id}
              trip={trip}
              index={index}
              onClick={(id) => navigate(`/view-trip/${id}`)}
              onDelete={handleDelete}
              onEdit={(id) => navigate(`/edit-trip/${id}`)} 

            />
          ))}
        </div>
      )}
    </div>
  );
}