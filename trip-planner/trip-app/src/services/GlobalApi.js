import axios from "axios";

// Unsplash API base — uses your Access Key (not Secret Key)
const UNSPLASH_BASE = "https://api.unsplash.com";

/**
 * Clean a search query for best Unsplash results:
 * - Remove special chars: ( ) & ' " +
 * - Collapse extra spaces
 * - Trim to 100 chars max
 */
const cleanQuery = (query) =>
  query
    .replace(/[()&\'"+ ]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 100);

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch a single best-match image URL from Unsplash.
 *
 * @param {string} query        - e.g. "Tower Bridge London"
 * @param {number} index        - card index for staggered loading (default 0)
 * @returns {Promise<string|null>} - full image URL (regular size) or null
 */
export const fetchUnsplashImage = async (query, index = 0) => {
  try {
    // Stagger requests: 150ms apart to avoid hitting rate limits
    if (index > 0) await new Promise((r) => setTimeout(r, index * 150));

    const q = cleanQuery(query);

    const response = await axios.get(`${UNSPLASH_BASE}/search/photos`, {
      headers: {
        Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`,
      },
      params: {
        query:       q,
        per_page:    5,
        orientation: "landscape",
      },
    });

    const results = response.data.results;

    // If no results, retry with just the first 2 words of the query
    if (!results || results.length === 0) {
      const words = q.split(" ").filter(Boolean);
      if (words.length > 2) {
        const fallback = await axios.get(`${UNSPLASH_BASE}/search/photos`, {
          headers: {
            Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`,
          },
          params: {
            query:       words.slice(0, 2).join(" "),
            per_page:    3,
            orientation: "landscape",
          },
        });
        const fbResults = fallback.data.results;
        return fbResults?.length > 0 ? fbResults[0].urls.regular : null;
      }
      return null;
    }

    return results[0].urls.regular;

  } catch (error) {
    console.error("Unsplash API Error:", error.response?.data || error.message);
    return null;
  }
};

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch multiple images from Unsplash.
 *
 * @param {string} query   - search query
 * @param {number} count   - number of results (default 10)
 * @returns {Promise<Array<{id, imageUrl, altText, photographer, photographerUrl}>>}
 */
export const fetchUnsplashImages = async (query, count = 10) => {
  try {
    const response = await axios.get(`${UNSPLASH_BASE}/search/photos`, {
      headers: {
        Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`,
      },
      params: {
        query:       cleanQuery(query),
        per_page:    count,
        orientation: "landscape",
      },
    });

    return response.data.results.map((img) => ({
      id:               img.id,
      imageUrl:         img.urls.regular,
      thumbUrl:         img.urls.thumb,
      altText:          img.alt_description || query,
      photographer:     img.user.name,
      photographerUrl:  img.user.links.html,
    }));

  } catch (error) {
    console.error("Unsplash API Error:", error.response?.data || error.message);
    return [];
  }
};