import { useNavigate } from "react-router";
import Card from "../../components/Card";
import CardComponent from "../../components/CardComponent";

const hotelData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
    name: "Farance Hotel",
    description: "Luxury stay with swimming pool and sweeping city view.",
    price: 2000,
    rating: 4.5,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    name: "Royal Palace",
    description: "5-star experience with complimentary breakfast included.",
    price: 18000,
    rating: 4.2,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80",
    name: "Ocean View Resort",
    description: "Beachside luxury with breathtaking sunset panoramas.",
    price: 25000,
    rating: 4.8,
  },
];

const itinerary = [
  {
    id: 1,
    day: 1,
    time: "10:00 AM – 12:00 PM",
    image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=600&q=80",
    title: "High Roller Observation Wheel",
    description: "A giant observation wheel offering stunning 360-degree views of the glittering cityscape below.",
    duration: "2 hours",
    price: "$30 – $40 per person",
  },
  {
    id: 2,
    day: 1,
    time: "01:00 PM – 03:00 PM",
    image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&q=80",
    title: "City Museum Visit",
    description: "Explore rare historical artifacts and contemporary art exhibitions curated by world-class curators.",
    duration: "2 hours",
    price: "$20 per person",
  },
  {
    id: 3,
    day: 2,
    time: "09:00 AM – 11:00 AM",
    image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=600&q=80",
    title: "Eiffel Tower Sunrise Visit",
    description: "Begin your morning at the iconic iron lattice tower with a guided tour at golden hour.",
    duration: "2 hours",
    price: "$50 per person",
  },
  {
    id: 4,
    day: 2,
    time: "03:00 PM – 05:00 PM",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80",
    title: "Seine River Cruise",
    description: "A relaxing cruise along the Seine River passing all major Parisian landmarks.",
    duration: "2 hours",
    price: "$35 per person",
  },
];

const days = [...new Set(itinerary.map((i) => i.day))];

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="w-1 h-8 bg-blue-600 rounded-full" />
    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    <div className="flex-1 h-px bg-blue-100" />
  </div>
);

export default function ViewTrips() {

  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <div className="relative h-[480px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1431274172761-fca41d930114?w=1600&q=85"
          alt="Paris"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-blue-900/40 to-slate-50" />
        <button onClick = {() => navigate("/my-trips")} className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium px-3 py-1.5 rounded-full">
          My Trips
        </button>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center w-full px-6">
          <p className="text-blue-300 text-xs tracking-[0.3em] uppercase font-semibold mb-3">
            Your Curated Journey
          </p>
          <h1 className="text-white font-extrabold text-5xl leading-tight mb-6 drop-shadow-lg">
            Eiffel Tower,{" "}
            <span className="text-blue-600 italic font-light">Paris</span>
          </h1>

          {/* Trip meta tags */}
          <div className="flex justify-center gap-3 flex-wrap">
            {[
              { icon: "🗓️", label: "2 Days" },
              { icon: "💼", label: "Moderate Budget" },
              { icon: "👥", label: "5 Travelers" },
            ].map((tag) => (
              <span
                key={tag.label}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-black text-sm font-medium px-4 py-2 rounded-full"
              >
                {tag.icon} {tag.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* Hotel Recommendations */}
        <SectionHeader title="Hotel Recommendations" />
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {hotelData.map((hotel) => (
            <Card
              key={hotel.id}
              image={hotel.image}
              name={hotel.name}
              description={hotel.description}
              price={hotel.price}
              rating={hotel.rating}
            />
          ))}
        </div>

        {/* Places to Visit */}
        <SectionHeader title="Places to Visit" />
        {days.map((day) => (
          <div key={day} className="mb-10">

            {/* Day label */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-200">
                {day}
              </div>
              <span className="text-lg font-bold text-gray-800">Day {day}</span>
              <div className="flex-1 h-px bg-blue-100" />
            </div>

            {itinerary
              .filter((item) => item.day === day)
              .map((item) => (
                <CardComponent
                  key={item.id}
                  time={item.time}
                  image={item.image}
                  title={item.title}
                  description={item.description}
                  duration={item.duration}
                  price={item.price}
                />
              ))}
          </div>
        ))}

        {/* Footer */}
        <div className="text-center pt-8 border-t border-blue-100">
          <p className="text-gray-400 text-xs tracking-widest uppercase">
            Voyage · Curated Travel Experiences · 2026
          </p>
        </div>
      </div>
    </div>
  );
}