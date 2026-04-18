import { GoogleGenAI, Type } from "@google/genai";
import db from "../config/db.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyBACkzlFiC09r50OLetMHMHro0ZwXehiZY",
});

// ─── Label Maps ───────────────────────────────────────────────────────────────
const BUDGET_LABELS = {
  cheap:    "budget / cheap",
  moderate: "moderate / mid-range",
  luxury:   "luxury / high-end",
};

const TRAVELERS_LABELS = {
  solo:    "a solo traveler",
  couple:  "a couple",
  family:  "a family with kids",
  friends: "a group of friends",
};

// ─── Gemini Response Schema ───────────────────────────────────────────────────
const travelPlanSchema = {
  type: Type.OBJECT,
  properties: {
    hotels: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name:        { type: Type.STRING },
          address:     { type: Type.STRING },
          price:       { type: Type.STRING },
          imageUrl:    { type: Type.STRING },
          coordinates: {
            type: Type.OBJECT,
            properties: {
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
            },
            required: ["lat", "lng"],
          },
          rating:      { type: Type.NUMBER },
          description: { type: Type.STRING },
        },
        required: ["name", "address", "price", "imageUrl", "coordinates", "rating", "description"],
      },
    },
    itinerary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name:            { type: Type.STRING },
                details:         { type: Type.STRING },
                imageUrl:        { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER },
                  },
                  required: ["lat", "lng"],
                },
                ticketPricing:   { type: Type.STRING },
                travelTime:      { type: Type.STRING },
                bestTimeToVisit: { type: Type.STRING },
              },
              required: [
                "name", "details", "imageUrl", "coordinates",
                "ticketPricing", "travelTime", "bestTimeToVisit",
              ],
            },
          },
        },
        required: ["day", "activities"],
      },
    },
  },
  required: ["hotels", "itinerary"],
};

// ─── Controller ───────────────────────────────────────────────────────────────
/**
 * POST /api/trip/generate
 *
 * Request body:
 * {
 *   destination: { name, short, country, lat, lon },
 *   budget:      "cheap" | "moderate" | "luxury",
 *   travelers:   "solo" | "couple" | "family" | "friends",
 *   days:        number (1–14),
 *   userProfile: { name, email, picture, id? (manual), sub? (google) }
 * }
 */
export const generateTrip = async (req, res) => {
  try {
    const { destination, budget, travelers, days, userProfile } = req.body;

    // ── Input validation ──────────────────────────────────────────────────
    if (!destination?.short)
      return res.status(400).json({ success: false, message: "Destination is required." });

    if (!budget || !BUDGET_LABELS[budget])
      return res.status(400).json({ success: false, message: "Invalid budget." });

    if (!travelers || !TRAVELERS_LABELS[travelers])
      return res.status(400).json({ success: false, message: "Invalid travelers type." });

    // ── Works for BOTH Google (sub) and manual (id) users ────────────────
    const userId = userProfile?.sub || userProfile?.id;
    if (!userId || !userProfile?.email)
      return res.status(400).json({ success: false, message: "User profile is required." });

    const tripDays = parseInt(days);
    if (!tripDays || tripDays < 1 || tripDays > 14)
      return res.status(400).json({ success: false, message: "Days must be 1–14." });

    // ── Save or update user ───────────────────────────────────────────────
    let userRef;

    if (userProfile?.sub) {
      // ── Google user — find by googleId ──────────────────────────────────
      const userQuery = await db.collection("users")
        .where("googleId", "==", userProfile.sub).get();

      if (!userQuery.empty) {
        userRef = userQuery.docs[0].ref;
        await userRef.update({
          name:      userProfile.name,
          email:     userProfile.email,
          picture:   userProfile.picture || null,
          lastLogin: new Date(),
        });
      } else {
        userRef = await db.collection("users").add({
          googleId:  userProfile.sub,
          name:      userProfile.name,
          email:     userProfile.email,
          picture:   userProfile.picture || null,
          provider:  "google",
          createdAt: new Date(),
          lastLogin: new Date(),
        });
      }

    } else {
      // ── Manual user — find by Firestore doc ID ──────────────────────────
      const userDocRef = db.collection("users").doc(userProfile.id);
      const userDoc    = await userDocRef.get();

      if (userDoc.exists) {
        userRef = userDocRef;
        await userRef.update({ lastLogin: new Date() });
      } else {
        // Fallback: find by email
        const userQuery = await db.collection("users")
          .where("email", "==", userProfile.email).get();

        if (!userQuery.empty) {
          userRef = userQuery.docs[0].ref;
          await userRef.update({ lastLogin: new Date() });
        } else {
          // Shouldn't happen but handle gracefully
          userRef = await db.collection("users").add({
            name:      userProfile.name,
            email:     userProfile.email,
            picture:   userProfile.picture || null,
            provider:  "manual",
            createdAt: new Date(),
            lastLogin: new Date(),
          });
        }
      }
    }

    // ── Build Gemini prompt ───────────────────────────────────────────────
    const location       = destination.short;
    const budgetLabel    = BUDGET_LABELS[budget];
    const travelersLabel = TRAVELERS_LABELS[travelers];

    const prompt = `
Generate a detailed ${tripDays}-day travel plan for ${location} for ${travelersLabel} with a ${budgetLabel} budget.

Requirements:
1. Hotels: Provide 3–7 hotel options that match the ${budgetLabel} budget.
   Each hotel must include:
   - name, address, price per night, imageUrl (a real Unsplash photo URL),
   - coordinates (lat & lng near ${location}), rating (1–5 stars), and a short description.

2. Itinerary: A full ${tripDays}-day plan. For each day provide 3–4 activities suited to ${travelersLabel}.
   Each activity must include:
   - name: Specific landmark or venue name.
   - details: Why it's great for ${travelersLabel} on a ${budgetLabel} budget.
   - imageUrl: A real, publicly accessible photo URL (Unsplash preferred).
   - coordinates: Exact lat/lng near ${location}.
   - ticketPricing: Specific cost (e.g. "Free", "PKR 500 per person").
   - travelTime: How long to spend there (e.g. "2 hours").
   - bestTimeToVisit: Best time of day (e.g. "Sunset", "9:00 AM").

IMPORTANT RULES:
- ALL prices — both hotel prices AND activity ticket pricing — MUST be in Pakistani Rupee (PKR).
- Return ONLY valid JSON matching the schema. No markdown, no extra text.
`;

    // ── Call Gemini AI ────────────────────────────────────────────────────
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema:   travelPlanSchema,
      },
    });

    const rawText = geminiResponse.text || "{}";
    const plan    = JSON.parse(rawText);

    // ── Save trip to Firestore ────────────────────────────────────────────
    const tripRef = await db.collection("trips").add({
      userId:      userRef.id,
      destination,
      budget,
      travelers,
      days:        tripDays,
      userProfile: {
        name:    userProfile.name,
        email:   userProfile.email,
        picture: userProfile.picture || null,
      },
      plan,
      createdAt: new Date(),
    });

    console.log("✅ Trip saved with ID:", tripRef.id);

    return res.status(200).json({
      success: true,
      data:    plan,
      tripId:  tripRef.id,
    });

  } catch (error) {
    console.error("❌ generateTrip controller error:", error);

    if (error instanceof SyntaxError)
      return res.status(502).json({ success: false, message: "AI returned invalid JSON." });

    if (error?.status === 429)
      return res.status(429).json({ success: false, message: "AI quota exceeded. Please try again later." });

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate travel plan.",
    });
  }
};