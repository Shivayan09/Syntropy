import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import User from "../models/user.model.js";
import PLAN_CONFIG from "../config/plan.js";
import { getDailyLimit } from "../utils/aiToken.utils.js";

export const createOrder = async (req, res) => {
    try {
        const { plan } = req.body;
        const config = PLAN_CONFIG[plan?.toLowerCase()];
        if (!config) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan"
            });
        }
        const options = {
            amount: config.price * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
            return res.status(400).json({
                success: false,
                message: "Missing fields"
            });
        }
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid signature"
            });
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const newPlan = plan.toLowerCase();
        const oldLimit = getDailyLimit(user);
        user.plan = newPlan;
        const newLimit = getDailyLimit(user);
        if (newLimit > oldLimit) {
            user.aiTokens = newLimit;
        } else {
            user.aiTokens = Math.min(user.aiTokens, newLimit);
        }
        user.lastTokenReset = new Date();
        user.planExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await user.save();
        return res.json({
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};