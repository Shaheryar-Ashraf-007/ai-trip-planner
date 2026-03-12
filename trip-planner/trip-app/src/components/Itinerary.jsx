import CardComponent from "./CardComponent";

/**
 * Itinerary
 *
 * Maps plan.itinerary[] → CardComponent props:
 *
 *  activity.bestTimeToVisit  →  time       (clock badge, e.g. "9:00 AM")
 *  activity.imageUrl         →  image      (left side photo)
 *  activity.name             →  title      (bold heading)
 *  activity.details          →  description (2-line clamp)
 *  activity.travelTime       →  duration   (⏱ pill, e.g. "2 hours")
 *  activity.ticketPricing    →  price      (💵 pill, e.g. "PKR 500" or "Free")
 */

const Itinerary = ({ itinerary }) => {
  if (!itinerary?.length) {
    return (
      <div className="bg-white/75 backdrop-blur-md border border-blue-100 rounded-3xl p-12 text-center shadow-sm">
        <div className="text-5xl mb-4 opacity-30">🗓️</div>
        <p className="text-slate-400 font-medium">No itinerary found for this trip.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-lg">
          🗓️
        </div>
        <div>
          <p className="font-bold text-slate-800 text-base">Day-by-Day Itinerary</p>
          <p className="text-slate-400 text-xs">
            {itinerary.length} day{itinerary.length !== 1 ? "s" : ""} · All prices in PKR
          </p>
        </div>
      </div>

      {/* Days */}
      {itinerary.map((dayPlan) => (
        <div key={dayPlan.day} className="mb-10">

          {/* Day header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 bg-blue-600 text-white rounded-2xl px-4 py-2 shadow-md shadow-blue-200">
              <span className="text-base">📅</span>
              <span className="font-bold text-sm">Day {dayPlan.day}</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
            <span className="text-xs text-slate-400 font-medium">
              {dayPlan.activities?.length}{" "}
              {dayPlan.activities?.length === 1 ? "activity" : "activities"}
            </span>
          </div>

          {/* Activity cards */}
          {dayPlan.activities?.map((activity, idx) => (
            <CardComponent
              key={idx}
              index={(dayPlan.day - 1) * 4 + idx}
              time={activity.bestTimeToVisit}
              image={activity.imageUrl}
              title={activity.name}
              description={activity.details}
              duration={activity.travelTime}
              price={activity.ticketPricing}
            />
          ))}

        </div>
      ))}
    </div>
  );
};

export default Itinerary;