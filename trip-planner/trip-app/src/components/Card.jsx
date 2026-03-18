import { useState, useEffect } from "react";

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill={s <= Math.round(rating) ? "#2563EB" : "none"}
        stroke="#2563EB"
        strokeWidth="1.5"
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ))}
    <span className="text-blue-600 text-sm font-semibold ml-1">{rating}</span>
  </div>
);

// ── Hotel image with skeleton + error fallback ────────────────────────────────
const HotelImage = ({ image, name, hovered }) => {
  const [loaded,  setLoaded]  = useState(false);
  const [errored, setErrored] = useState(false);

  // ── KEY FIX: reset loaded/errored whenever the image URL changes ─────────
  // When image goes null → real URL (after Pexels fetch resolves),
  // loaded stays false and the img stays at opacity:0 without this reset.
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [image]);

  const showPlaceholder = !image || errored;

  return (
    <div className="relative overflow-hidden h-48 bg-blue-50">

      {/* Skeleton pulse — shown while image URL exists but hasn't loaded yet */}
      {!loaded && !showPlaceholder && (
        <div className="absolute inset-0 animate-pulse bg-blue-100/70" />
      )}

      {/* Placeholder — null image or broken URL */}
      {showPlaceholder ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-blue-100">
          <span className="text-5xl">🏨</span>
          <span className="text-blue-300 text-xs font-medium">No image available</span>
        </div>
      ) : (
        <img
          src={image}
          alt={name}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className="w-full h-full object-cover"
          style={{
            opacity:    loaded ? 1 : 0,
            transform:  hovered ? "scale(1.07)" : "scale(1)",
            transition: "transform 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.3s ease",
          }}
        />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent" />
      <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-medium px-2.5 py-1 rounded-full">
        🏨 Hotel
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const HotelCard = ({ image, name, description, price, rating, bestseason }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-2xl overflow-hidden border border-blue-100 cursor-pointer w-72"
      style={{
        boxShadow:  hovered ? "0 20px 50px rgba(37,99,235,0.15)" : "0 4px 20px rgba(37,99,235,0.06)",
        transform:  hovered ? "translateY(-6px)" : "translateY(0)",
        transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {/* Image */}
      <HotelImage image={image} name={name} hovered={hovered} />

      {/* Price badge */}
      <div className="relative -mt-8 flex justify-end pr-3 z-10">
        <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
          PKR {price?.toLocaleString()}/night
        </div>
      </div>

      {/* Body */}
      <div className="p-5 pt-3">
        <h3 className="text-gray-900 font-bold text-lg mb-1 truncate">{name}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2">{description}</p>
        <StarRating rating={rating} />

        {/* Best season badge */}
        {bestseason && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full border border-green-100">
            🌤️ Best season: {bestseason}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <a
            href={`https://www.google.com/maps/search/${encodeURIComponent(name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm transition-all duration-200 hover:bg-blue-700 shadow-md shadow-blue-100 text-center no-underline"
          >
            Path to Hotel
          </a>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;