import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── Activity image: resets state when image URL changes ───────────────────────
const ActivityImage = ({ image, title, hovered }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // ── KEY FIX: reset loaded/errored whenever the image URL changes ─────────
  // Without this, when image goes from null → real URL, `loaded` stays false
  // and the skeleton never clears, OR when a new URL arrives after an error,
  // `errored` stays true and the placeholder keeps showing.
  useEffect(() => {
    setLoaded(false);
    setErrored(false);
  }, [image]);

  const showPlaceholder = !image || errored;

  return (
    <div className="relative w-44 flex-shrink-0 overflow-hidden bg-blue-50">
      {/* Skeleton pulse — shown while image URL exists but hasn't loaded yet */}
      {!loaded && !showPlaceholder && (
        <div className="absolute inset-0 animate-pulse bg-blue-100/70" />
      )}

      {/* Placeholder — no image or broken URL */}
      {showPlaceholder ? (
        <div className="w-full h-full min-h-[120px] flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-blue-50 to-blue-100">
          <span className="text-4xl">🗺️</span>
          <span className="text-blue-300 text-xs font-medium">No image</span>
        </div>
      ) : (
        <img
          src={image}
          alt={title}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className="w-full h-full object-cover"
          style={{
            opacity: loaded ? 1 : 0,
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.5s ease, opacity 0.3s ease",
          }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-900/10" />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const CardComponent = ({
  time,
  image,
  title,
  description,
  duration,
  price,
  dayPlan
}) => {
  const [hovered, setHovered] = useState(false);

   const navigate = useNavigate();
 
  const handleViewDay = () => {
    // Pass the full dayPlan via router state — no URL params needed
    navigate("/view-place", { state: { dayPlan } });
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-2xl overflow-hidden border border-blue-100 flex mb-5"
      style={{
        boxShadow: hovered
          ? "0 16px 40px rgba(37,99,235,0.13)"
          : "0 2px 12px rgba(37,99,235,0.06)",
        transform: hovered ? "translateX(6px)" : "translateX(0)",
        transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {/* Left Image */}
      <ActivityImage image={image} title={title} hovered={hovered} />

      {/* Right Content */}
      <div className="p-5 flex flex-col justify-center flex-1 min-w-0">
        {/* Time badge */}
        <span className="inline-flex items-center gap-1.5 text-blue-500 text-xs font-semibold tracking-wider uppercase mb-2">
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {time}
        </span>

        <h3 className="text-gray-900 font-bold text-base mb-1.5 leading-snug">
          {title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2">
          {/* Duration */}
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {duration}
          </div>

          {/* Price */}
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
            {price}
          </div>

          {/* Best season — only shown if provided */}

          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2a10 10 0 0 1 0 20A10 10 0 0 1 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
            Summer Season
          </div>

          <div
            className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer"
            onClick={handleViewDay}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-6 11-6 11 6 11 6-4 6-11 6S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View
          </div>
        </div>
      </div>

      {/* Right arrow */}
    </div>
  );
};

export default CardComponent;
