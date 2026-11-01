// How services talk to each other: plain HTTP calls to /internal/... routes,
// protected by a shared secret (INTERNAL_API_TOKEN) instead of a user login.

// Where a service lives. On Render every service runs in this same process,
// so by default each one is reached at this server's own address.
export const serviceUrl = (envName) => process.env[envName] || `http://localhost:${process.env.PORT || 5000}`;

export const callService = async (url, body = {}) => {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Internal-Token": process.env.INTERNAL_API_TOKEN },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || `Internal call to ${url} failed with status ${response.status}`);
    }
    return data;
};

// Put on every /internal route. Rejects anything that doesn't carry the shared secret.
export const requireInternal = (req, res, next) => {
    const token = process.env.INTERNAL_API_TOKEN;
    if (!token || req.headers["x-internal-token"] !== token) {
        return res.status(403).json({ message: "Forbidden" });
    }
    return next();
};
