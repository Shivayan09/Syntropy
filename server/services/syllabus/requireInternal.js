// Put on every /internal route. Only other services, which know the shared
// secret (INTERNAL_API_TOKEN), can call these routes.
export const requireInternal = (req, res, next) => {
    const token = process.env.INTERNAL_API_TOKEN;
    if (!token || req.headers["x-internal-token"] !== token) {
        return res.status(403).json({ message: "Forbidden" });
    }
    return next();
};
