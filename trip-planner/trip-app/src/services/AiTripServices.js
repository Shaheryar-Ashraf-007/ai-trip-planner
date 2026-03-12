import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Calls the Node.js backend to generate a travel plan via Gemini.
 *
 * @param {Object}  params
 * @param {{ name: string, short: string, country: string, lat: number, lon: number }} params.destination
 * @param {"cheap"|"moderate"|"luxury"}                params.budget
 * @param {"solo"|"couple"|"family"|"friends"}        params.travelers
 * @param {number}                                     params.days  (1–14)
 * @param {Object}                                     params.userProfile
 *
 * @returns {Promise<{ tripId: string, hotels: Array, itinerary: Array }>}
 */
export async function generateTravelPlan({ destination, budget, travelers, days, userProfile }) {
  try {
    const response = await axios.post(`${API_BASE}/api/trip/generate`, {
      destination,
      budget,
      travelers,
      days,
      userProfile,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to generate travel plan.");
    }

    console.log("✅ Trip generated successfully:", response.data);

    // Return both the tripId and the travel plan data
    return {
      tripId: response.data.tripId,
      ...response.data.data, // hotels[] and itinerary[]
    };
  } catch (error) {
    console.error("❌ Error generating travel plan:", error);
    throw error; // Re-throw so the calling function can handle it
  }
}