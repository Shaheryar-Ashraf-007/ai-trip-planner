import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function generateTravelPlan({ destination, budget, travelers, days, userProfile }) {
  try {
    // ── Always send JWT token with every request ──────────────────────────
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("You must be logged in to generate a trip.");
    }

    // ── Ensure userProfile always has required fields ─────────────────────
    const safeProfile = {
      name:    userProfile?.name    || userProfile?.given_name || "Traveler",
      email:   userProfile?.email   || "",
      picture: userProfile?.picture || null,
      id:      userProfile?.id      || userProfile?.sub || null,
    };

    if (!safeProfile.name || !safeProfile.email) {
      throw new Error("User profile is incomplete. Please log in again.");
    }

    console.log("📤 Sending to backend:", {
      destination,
      budget,
      travelers,
      days,
      userProfile: safeProfile,
    });

    const response = await axios.post(
      `${API_BASE}/api/trip/generate`,
      {
        destination,
        budget,
        travelers,
        days,
        userProfile: safeProfile,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to generate travel plan.");
    }

    console.log("✅ Trip generated successfully:", response.data);

    return {
      tripId: response.data.tripId,
      ...response.data.data,
    };

  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.message                  ||
      "Something went wrong. Please try again.";

    console.error("❌ Error generating travel plan:", message);

    throw new Error(message);
  }
}