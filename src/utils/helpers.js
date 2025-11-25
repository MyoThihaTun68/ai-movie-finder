/**
 * Recursively finds an array of movie recommendations in a nested object.
 * @param {any} obj - The object to search.
 * @returns {Array|null} - The found array of movies or null.
 */
export const findRecommendations = (obj) => {
    if (!obj || typeof obj !== 'object') return null;
    if (Array.isArray(obj) && obj.length > 0 && obj[0].title) return obj;
    if (Array.isArray(obj)) return obj.map(findRecommendations).find(Boolean);
    return Object.values(obj).map(findRecommendations).find(Boolean);
};
