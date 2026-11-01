import mongoose from "mongoose";

// Builds req.user from the X-User-* headers set by the gateway after it verified the token.
export const requireUser = (req, res, next) => {
  const id = req.headers["x-user-id"];
  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = {
    _id: new mongoose.Types.ObjectId(id),
    email: req.headers["x-user-email"],
    name: decodeURIComponent(req.headers["x-user-name"] || ""),
  };
  return next();
};
