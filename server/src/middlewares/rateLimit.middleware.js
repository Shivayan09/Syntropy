const stores = new Map();

const getClientKey = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];

    if (typeof forwardedFor === "string" && forwardedFor.trim()) {
        return forwardedFor.split(",")[0].trim();
    }

    return req.ip || req.socket?.remoteAddress || "unknown";
};

export const createRateLimiter = ({ windowMs, maxRequests, message }) => {
    if (!Number.isFinite(windowMs) || windowMs <= 0) {
        throw new Error("windowMs must be a positive number");
    }

    if (!Number.isFinite(maxRequests) || maxRequests <= 0) {
        throw new Error("maxRequests must be a positive number");
    }

    const responseMessage = message || "Too many requests. Please try again later.";

    return (req, res, next) => {
        const routeKey = `${req.method}:${req.baseUrl}${req.path}`;
        const clientKey = `${routeKey}:${getClientKey(req)}`;
        const now = Date.now();
        const current = stores.get(clientKey);

        if (!current || now > current.resetAt) {
            stores.set(clientKey, {
                count: 1,
                resetAt: now + windowMs,
            });
            return next();
        }

        if (current.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: responseMessage,
            });
        }

        current.count += 1;
        stores.set(clientKey, current);
        return next();
    };
};
