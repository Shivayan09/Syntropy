import jwt from "jsonwebtoken";

// Verifies the JWT once, here in the gateway. If it is valid, the user from the
// token is passed on as X-User-* headers, which services read with requireUser.
export const authenticate = (req, res, next) => {
  // Never trust user headers sent by the client.
  delete req.headers["x-user-id"];
  delete req.headers["x-user-email"];
  delete req.headers["x-user-name"];

  const path = req.path.toLowerCase();
  const isPublic = !path.startsWith("/api/") || (path.startsWith("/api/auth/") && path !== "/api/auth/getme");
  if (isPublic) {
    return next();
  }

  const authorization = req.headers.authorization || "";
  const bearerToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : null;
  const token = bearerToken || req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Tokens issued before the split only contain the id, so the user has to log in again.
  if (!payload.id || !payload.email) {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }

  req.headers["x-user-id"] = payload.id;
  req.headers["x-user-email"] = payload.email;
  req.headers["x-user-name"] = encodeURIComponent(payload.name || "");
  return next();
};
