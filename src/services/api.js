// n8n Webhook URL
const WEBHOOK_URL = 'https://myo888.app.n8n.cloud/webhook/c00163c3-bebc-488b-9add-37eda3a20c6a';

/**
 * Sends a search query to the n8n webhook.
 * @param {string} query - The user's search query.
 * @returns {Promise<any>} - The JSON response from n8n.
 * @throws {Error} - If the request fails or returns invalid JSON.
 */
export const searchMovies = async (query) => {
    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const responseText = await response.text();
    try {
        return JSON.parse(responseText);
    } catch {
        throw new Error('Invalid JSON returned from workflow');
    }
};
