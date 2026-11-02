// Sends an HTTP request to another service's /internal route, with the shared
// secret so that service accepts it. Throws if the other service fails or is down.
export const callService = async (baseUrlEnv, path, body = {}) => {
    const baseUrl = process.env[baseUrlEnv];
    if (!baseUrl) {
        throw new Error(`${baseUrlEnv} is not set. Add it to this service's .env.`);
    }

    const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-Token": process.env.INTERNAL_API_TOKEN },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || `Internal call to ${baseUrl}${path} failed with status ${response.status}`);
    }
    return data;
};
