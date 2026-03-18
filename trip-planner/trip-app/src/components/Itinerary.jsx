import { useEffect, useState } from "react";
import CardComponent from "./CardComponent";
import { fetchPexelsImage } from "../services/GlobalApi.js";

const Itinerary = ({ itinerary }) => {
  const [activityImages, setActivityImages] = useState({});

  useEffect(() => {
    if (!itinerary?.length) return;

    // ── Cleanup flag: if this effect re-runs (Strict Mode / dep change),
    // the old fetch callbacks will see cancelled=true and skip setState ────────
    let cancelled = false;

    let globalIdx = 0;

    itinerary.forEach((dayPlan) => {
      dayPlan.activities?.forEach((activity) => {
        const key   = globalIdx;
        const query = activity.name || "";

        fetchPexelsImage(query, globalIdx).then((url) => {
          if (!cancelled && url) {
            setActivityImages((prev) => ({ ...prev, [key]: url }));
          }
        });

        globalIdx++;
      });
    });

    return () => { cancelled = true; }; // cancel on cleanup
  }, [itinerary]);

  if (!itinerary?.length) {
    return (
      <div className="bg-white/75 backdrop-blur-md border border-blue-100 rounded-3xl p-12 text-center shadow-sm">
        <div className="text-5xl mb-4 opacity-30">🗓️</div>
        <p className="text-slate-400 font-medium">No itinerary found for this trip.</p>
      </div>
    );
  }

  let globalIdx = 0;

  return (
    <div>
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

      {itinerary.map((dayPlan) => (
        <div key={dayPlan.day} className="mb-10">

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

          {dayPlan.activities?.map((activity) => {
            const imgKey = globalIdx;
            globalIdx++;

            return (
              <CardComponent
                key={imgKey}
                index={imgKey}
                time={activity.bestTimeToVisit}
                image={activityImages[imgKey] ?? activity.imageUrl ?? null}
                title={activity.name}
                description={activity.details}
                duration={activity.travelTime}
                price={activity.ticketPricing}
                dayPlan={dayPlan}   

              />
            );
          })}

        </div>
      ))}
    </div>
  );
};

export default Itinerary;