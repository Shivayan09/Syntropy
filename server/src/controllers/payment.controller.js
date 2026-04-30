import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import { getCatalogItem, normalizePlan } from "../config/plan.js";
import User from "../models/user.model.js";
import { getCycleLimit, syncAiTokens } from "../utils/aiToken.utils.js";

const addMonths = (date, months) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

const getCheckoutItem = ({ itemKey, plan }) => {
  if (typeof itemKey === "string") {
    return getCatalogItem(itemKey);
  }

  if (typeof plan === "string") {
    return getCatalogItem(plan);
  }

  return null;
};

const buildReceipt = (receipt, itemKey) => {
  if (typeof receipt === "string" && receipt.trim()) {
    return receipt.trim().slice(0, 40);
  }

  return `${itemKey}_${Date.now()}`.slice(0, 40);
};

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, itemKey, plan } = req.body;
    const item = getCheckoutItem({ itemKey, plan });

    if (!item) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase item",
      });
    }

    const parsedAmount = Number(amount);
    const finalAmount =
      Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : item.amountPaise;

    if (!Number.isInteger(finalAmount) || finalAmount < 100) {
      return res.status(400).json({
        success: false,
        message: "Amount must be at least 100 paise",
      });
    }

    if (finalAmount !== item.amountPaise) {
      return res.status(400).json({
        success: false,
        message: "Amount does not match the selected purchase item",
      });
    }

    const order = await razorpay.orders.create({
      amount: finalAmount,
      currency,
      receipt: buildReceipt(receipt, item.key),
      notes: {
        itemKey: item.key,
        kind: item.kind,
        plan: item.plan || "",
        userId: String(req.user._id),
      },
    });

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      itemKey: item.key,
    });
  } catch (error) {
    if (error?.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: "Razorpay authentication failed",
      });
    }

    return res.status(500).json({
      success: false,
      message: error?.error?.description || error?.message || "Unable to create order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      itemKey,
      plan,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest("hex");

    const signaturesMatch =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature)
      );

    if (!signaturesMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const item = getCheckoutItem({ itemKey, plan });
    if (!item) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase item",
      });
    }

    const order = await razorpay.orders.fetch(razorpay_order_id);
    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.amount !== item.amountPaise || order.currency !== "INR") {
      return res.status(400).json({
        success: false,
        message: "Order amount mismatch",
      });
    }

    if (order.notes?.itemKey !== item.key) {
      return res.status(400).json({
        success: false,
        message: "Order item mismatch",
      });
    }

    if (order.notes?.userId !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "This order does not belong to the current user",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await syncAiTokens(user);

    if (item.kind === "topup") {
      user.bonusAiTokens = (user.bonusAiTokens || 0) + item.credits;
      await user.save();

      return res.json({
        success: true,
        verified: true,
        message: `${item.credits} extra AI test${item.credits === 1 ? "" : "s"} added`,
      });
    }

    const now = new Date();
    const previousPlan = normalizePlan(user.plan);
    const previousPlanLimit = getCycleLimit(user);
    const normalizedPlan = normalizePlan(item.plan);

    user.plan = normalizedPlan;
    user.planBillingCycle = item.billingCycle;
    user.lastTokenReset = now;
    user.planExpiry = addMonths(now, item.durationMonths);

    if (normalizedPlan !== previousPlan || item.credits >= previousPlanLimit) {
      user.aiTokens = item.credits;
    } else {
      user.aiTokens = Math.min(Math.max(user.aiTokens || 0, item.credits), previousPlanLimit);
    }

    await user.save();

    return res.json({
      success: true,
      verified: true,
      message: `${item.label} activated successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
