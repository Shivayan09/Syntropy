import jwt from "jsonwebtoken";

export const AUTH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000;

// The gateway reads id, email and name straight from the token, so keep them in sync with the user.
export const createAuthToken = (user) => jwt.sign(
  { id: user._id.toString(), email: user.email, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: "7d" },
);

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

export const isMobileAuthRequest = (req) => {
  const platformHeader = req.headers["x-client-platform"];
  const responseMode = req.body?.responseMode;
  return platformHeader === "mobile" || responseMode === "mobile";
};
