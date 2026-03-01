import { useState } from "react";

const CardComponent = ({ time, image, title, description, duration, price }) => {
  const [hovered, setHovered] = useState(false);

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
      <div className="relative w-44 flex-shrink-0 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          style={{
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.5s ease",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-900/10" />
      </div>

      {/* Right Content */}
      <div className="p-5 flex flex-col justify-center flex-1 min-w-0">
        {/* Time badge */}
        <span className="inline-flex items-center gap-1.5 text-blue-500 text-xs font-semibold tracking-wider uppercase mb-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {time}
        </span>

        <h3 className="text-gray-900 font-bold text-base mb-1.5 leading-snug">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{description}</p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {duration}
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            {price}
          </div>
        </div>
      </div>

      {/* Right arrow indicator */}
      <div className="flex items-center pr-4 text-blue-200">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
};

export default CardComponent;