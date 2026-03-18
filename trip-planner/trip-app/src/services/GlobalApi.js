import axios from "axios";

// Pexels API base
const PEXELS_BASE = "https://api.pexels.com/v1/search";

// ── Key guard: warn immediately if missing ────────────────────────────────────
const PEXELS_KEY = import.meta.env.VITE_PEXELS_API_KEY;
if (!PEXELS_KEY) {
  console.error("❌ VITE_PEXELS_API_KEY is not set in your .env file!");
}

/**
 * Clean a search query for best results.
 * Only removes truly problematic chars — keeps spaces intact.
 */
const cleanQuery = (query) =>
  query
    .replace(/[()&'"+=]/g, " ") // removed the space from char class so spaces are preserved
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 100);

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch a single best-match image URL from Pexels.
 *
 * @param {string} query   - e.g. "Tower Bridge London"
 * @param {number} index   - stagger index (default 0)
 * @returns {Promise<string|null>}
 */
export const fetchPexelsImage = async (query, index = 0) => {
  if (!PEXELS_KEY) return null;

  try {
    // Stagger requests: 150ms apart to avoid rate limits
    if (index > 0) await new Promise((r) => setTimeout(r, index * 150));

    const q = cleanQuery(query);
    console.log(`🔍 Pexels query [${index}]: "${q}"`);

    const response = await axios.get(PEXELS_BASE, {
      headers: {
        // Pexels expects just the raw key — no "Bearer" prefix
        Authorization: PEXELS_KEY,
      },
      params: {
        query:    q,
        per_page: 5,
      },
    });

    const results = response.data?.photos;
    console.log(`📸 Pexels results [${index}]:`, results?.length ?? 0, "photos");

    if (!results || results.length === 0) {
      // Retry with first 2 words of query
      const words = q.split(" ").filter(Boolean);
      if (words.length > 2) {
        const shortQuery = words.slice(0, 2).join(" ");
        console.log(`🔄 Pexels retry [${index}]: "${shortQuery}"`);

        const fallback = await axios.get(PEXELS_BASE, {
          headers: { Authorization: PEXELS_KEY },
          params:  { query: shortQuery, per_page: 3 },
        });

        const fbResults = fallback.data?.photos;
        return fbResults?.length > 0 ? fbResults[0].src.large : null;
      }
      return null;
    }

    return results[0].src.large;

  } catch (error) {
    // Log the real HTTP status so you can spot 401 (bad key) vs 429 (rate limit)
    console.error(
      `❌ Pexels API Error [${index}] query="${query}":`,
      error.response?.status,
      error.response?.data || error.message
    );
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch multiple images from Pexels.
 *
 * @param {string} query   - search query
 * @param {number} count   - number of results (default 10)
 * @returns {Promise<Array<{id, imageUrl, thumbUrl, altText, photographer, photographerUrl}>>}
 */
export const fetchPexelsImages = async (query, count = 10) => {
  if (!PEXELS_KEY) return [];

  try {
    const response = await axios.get(PEXELS_BASE, {
      headers: { Authorization: PEXELS_KEY },
      params:  { query: cleanQuery(query), per_page: count },
    });

    return (response.data?.photos || []).map((img) => ({
      id:              img.id,
      imageUrl:        img.src.large,
      thumbUrl:        img.src.medium,
      altText:         img.alt || query,
      photographer:    img.photographer,
      photographerUrl: img.photographer_url,
    }));

  } catch (error) {
    console.error(
      "❌ Pexels API Error:",
      error.response?.status,
      error.response?.data || error.message
    );
    return [];
  }
};