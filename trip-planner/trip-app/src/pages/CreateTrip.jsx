import { useState } from "react";

const budgetOptions = [
  { label: "Cheap", desc: "Around 25k to 50k PKR", icon: "💰" },
  { label: "Moderate", desc: "Around 50k to 75k PKR", icon: "💳" },
  { label: "Luxury", desc: "Around 75k to 100k PKR", icon: "💎" },
];

const travelOptions = [
  { label: "Just Me", desc: "A solo traveler in exploration", icon: "🧳" },
  { label: "A Couple", desc: "Romantic getaway for two", icon: "💑" },
  { label: "Family", desc: "Fun-loving adventure members", icon: "👨‍👩‍👧‍👦" },
  { label: "Friends", desc: "A bunch of thrill seekers", icon: "🎉" },
];

const destinations = [
  { name: "Paris, France", flag: "🇫🇷" },
  { name: "Tokyo, Japan", flag: "🇯🇵" },
  { name: "Bali, Indonesia", flag: "🇮🇩" },
  { name: "New York, USA", flag: "🇺🇸" },
  { name: "Dubai, UAE", flag: "🇦🇪" },
  { name: "London, UK", flag: "🇬🇧" },
  { name: "Istanbul, Turkey", flag: "🇹🇷" },
  { name: "Lahore, Pakistan", flag: "🇵🇰" },
  { name: "Karachi, Pakistan", flag: "🇵🇰" },
  { name: "Bangkok, Thailand", flag: "🇹🇭" },
  { name: "Rome, Italy", flag: "🇮🇹" },
  { name: "Barcelona, Spain", flag: "🇪🇸" },
];

const SelectionCard = ({ icon, label, desc, selected, onClick }) => (
  <div
    onClick={onClick}
    className={`flex flex-col items-start gap-1 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
      ${selected
        ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
        : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40"
      }`}
  >
    <div className="flex items-center justify-between w-full">
      <span className="text-2xl">{icon}</span>
      {selected && (
        <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">✓</span>
      )}
    </div>
    <span className="text-sm font-semibold text-indigo-950">{label}</span>
    <span className="text-xs text-slate-400 leading-snug">{desc}</span>
  </div>
);

const CreateTrip = () => {
  const [destQuery, setDestQuery] = useState("");
  const [destOpen, setDestOpen] = useState(false);
  const [selectedDest, setSelectedDest] = useState(null);

  const [daysOpen, setDaysOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedTravel, setSelectedTravel] = useState(null);

  const filteredDests = destinations.filter((d) =>
    d.name.toLowerCase().includes(destQuery.toLowerCase())
  );

  const dayOptions = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 px-4 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-indigo-500">AI Trip Planner</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-indigo-950 tracking-tight leading-tight mb-3">
            Create Your <br />
            <span className="bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 bg-clip-text text-transparent italic font-extrabold">
              Perfect Trip
            </span>
          </h2>
          <p className="text-slate-500 text-base leading-relaxed max-w-md">
            Provide a few details and our AI will craft a fully personalized itinerary tailored to your preferences.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-indigo-50 p-8 flex flex-col gap-8">

          {/* ── Destination Dropdown ── */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-indigo-950 tracking-wide">
              📍 What is your destination?
            </label>
            <div className="relative">
              {/* Input */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-base pointer-events-none">🔍</span>
                <input
                  type="text"
                  value={selectedDest ? selectedDest.name : destQuery}
                  onChange={(e) => { setDestQuery(e.target.value); setSelectedDest(null); setDestOpen(true); }}
                  onFocus={() => setDestOpen(true)}
                  onBlur={() => setTimeout(() => setDestOpen(false), 150)}
                  placeholder="Search a destination…"
                  className="w-full pl-9 pr-10 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm placeholder-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 focus:bg-white transition-all duration-200"
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs transition-transform duration-200 ${destOpen ? "rotate-180" : ""}`}>▾</span>
              </div>

              {/* Dropdown */}
              {destOpen && (
                <div className="absolute z-30 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100 overflow-hidden">
                  <div className="max-h-56 overflow-y-auto">
                    {filteredDests.length > 0 ? filteredDests.map((d) => (
                      <button
                        key={d.name}
                        onMouseDown={() => { setSelectedDest(d); setDestQuery(""); setDestOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors duration-150
                          ${selectedDest?.name === d.name ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
                      >
                        <span className="text-lg">{d.flag}</span>
                        <span>{d.name}</span>
                        {selectedDest?.name === d.name && <span className="ml-auto text-indigo-500 text-xs">✓</span>}
                      </button>
                    )) : (
                      <div className="px-4 py-4 text-sm text-slate-400 text-center">No destinations found</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected pill */}
            {selectedDest && (
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                  {selectedDest.flag} {selectedDest.name}
                  <button onMouseDown={() => setSelectedDest(null)} className="ml-1 text-indigo-400 hover:text-indigo-600 font-bold">×</button>
                </span>
              </div>
            )}
          </div>

          {/* ── Days Dropdown ── */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-indigo-950 tracking-wide">
              🗓️ How many days are you planning for?
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDaysOpen(!daysOpen)}
                onBlur={() => setTimeout(() => setDaysOpen(false), 150)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all duration-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300
                  ${daysOpen ? "border-indigo-400 bg-white ring-2 ring-indigo-300" : "border-slate-200 hover:border-indigo-300"}`}
              >
                <span className={selectedDays ? "text-slate-700 font-medium" : "text-slate-300"}>
                  {selectedDays ? `${selectedDays} ${selectedDays === 1 ? "Day" : "Days"}` : "Select number of days…"}
                </span>
                <span className={`text-slate-400 text-xs transition-transform duration-200 ${daysOpen ? "rotate-180" : ""}`}>▾</span>
              </button>

              {daysOpen && (
                <div className="absolute z-30 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100 overflow-hidden">
                  <div className="p-3 grid grid-cols-5 gap-2 max-h-52 overflow-y-auto">
                    {dayOptions.map((day) => (
                      <button
                        key={day}
                        onMouseDown={() => { setSelectedDays(day); setDaysOpen(false); }}
                        className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
                          ${selectedDays === day
                            ? "bg-indigo-500 text-white shadow-md shadow-indigo-200"
                            : "bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200"
                          }`}
                      >
                        {day}
                        <span className="text-[10px] font-normal mt-0.5 opacity-70">{day === 1 ? "day" : "days"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Selected display */}
            {selectedDays && (
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                  🗓️ {selectedDays} {selectedDays === 1 ? "Day" : "Days"}
                  <button onMouseDown={() => setSelectedDays(null)} className="ml-1 text-indigo-400 hover:text-indigo-600 font-bold">×</button>
                </span>
              </div>
            )}
          </div>

          {/* Budget */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-indigo-950 tracking-wide">
              💸 What is your budget?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {budgetOptions.map((opt) => (
                <SelectionCard key={opt.label} {...opt} selected={selectedBudget === opt.label} onClick={() => setSelectedBudget(opt.label)} />
              ))}
            </div>
          </div>

          {/* Travel Companion */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-indigo-950 tracking-wide">
              🧭 Who are you travelling with?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {travelOptions.map((opt) => (
                <SelectionCard key={opt.label} {...opt} selected={selectedTravel === opt.label} onClick={() => setSelectedTravel(opt.label)} />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Generate Button */}
          <button className="w-full cursor-pointer py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold text-base tracking-wide shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
            ✨ Generate My Itinerary
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Your personalized trip plan will be ready in seconds.
        </p>
      </div>
    </div>
  );
};

export default CreateTrip;