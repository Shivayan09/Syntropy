import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { getRequestToken } from "../utils/authToken.js";

export const protect = async (req, res, next) => {
    try {
        const token = getRequestToken(req);
        if (!token) {
            return res.status(401).json({
                message: "No token"
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }
        req.user = user;
        next();
    } catch {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
};
