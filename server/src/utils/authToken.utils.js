import jwt from "jsonwebtoken";

export const AUTH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

export const createAuthToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: AUTH_TOKEN_TTL,
  });
};

export const clearAuthCookie = (res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    expires: new Date(0),
  });
};

export const getBearerToken = (req) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }
  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
};

export const getRequestToken = (req) => getBearerToken(req) || req.cookies.token || null;

export const isMobileAuthRequest = (req) => {
  const platformHeader = req.headers["x-client-platform"];
  const responseMode = req.body?.responseMode;
  return platformHeader === "mobile" || responseMode === "mobile";
};
