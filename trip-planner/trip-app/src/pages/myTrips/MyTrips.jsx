import { useState } from "react";

const trips = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
    location: "North Carolina, USA",
    days: 2,
    budget: "Moderate Budget",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80",
    location: "New York, NY, USA",
    days: 2,
    budget: "Cheap Budget",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
    location: "North Carolina, USA",
    days: 2,
    budget: "Cheap Budget",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=600&q=80",
    location: "Athens, Greece",
    days: 3,
    budget: "Moderate Budget",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=80",
    location: "Kyoto, Japan",
    days: 5,
    budget: "Luxury Budget",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?w=600&q=80",
    location: "Las Vegas, NV, USA",
    days: 4,
    budget: "Cheap Budget",
  },
];

const TripCard = ({ image, location, days, budget }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="cursor-pointer rounded-2xl overflow-hidden"
      style={{
        boxShadow: hovered
          ? "0 16px 40px rgba(37,99,235,0.15)"
          : "0 2px 12px rgba(0,0,0,0.08)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        transition: "all 0.35s cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={image}
          alt={location}
          className="w-full h-full object-cover"
          style={{
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.5s cubic-bezier(0.23,1,0.32,1)",
          }}
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Info */}
      <div className="bg-white px-4 py-3 border border-t-0 border-gray-100 rounded-b-2xl">
        <h3 className="text-gray-900 font-bold text-base">{location}</h3>
        <p className="text-gray-500 text-sm mt-0.5">
          {days} Days trip with {budget}
        </p>
      </div>
    </div>
  );
};

export default function MyTrips() {
  return (
    <div className="min-h-screen bg-white px-8 py-10 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">My Trips</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md shadow-blue-100">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Trip
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            image={trip.image}
            location={trip.location}
            days={trip.days}
            budget={trip.budget}
          />
        ))}
      </div>
    </div>
  );
}