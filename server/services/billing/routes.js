import express from "express";
import { createOrder, getAiTokenStatus, verifyPayment } from "./controllers/billing.controller.js";
import { normalizePlan } from "./config/plan.js";
import { buildAiTokenStatus, consumeAiCredit, getWallet, refundAiCredit, syncAiTokens } from "./wallet.js";
import { requireUser } from "./requireUser.js";
import { requireInternal } from "./requireInternal.js";

const billingRoutes = express.Router();

billingRoutes.post("/api/payment/create-order", requireUser, createOrder);
billingRoutes.post("/api/payment/verify-payment", requireUser, verifyPayment);
billingRoutes.get("/api/user/ai-token-status", requireUser, getAiTokenStatus);

// Called by other services through client.js.

// Takes one AI credit. creditSource is null when the user has none left.
billingRoutes.post("/internal/billing/consume-credit", requireInternal, async (req, res) => {
    const { userId, email } = req.body;
    const wallet = await getWallet(userId);
    await syncAiTokens(wallet, email);
    const creditSource = await consumeAiCredit(wallet, email);
    res.json({ creditSource, aiTokenStatus: buildAiTokenStatus(wallet, email) });
});

// Gives back a credit taken by consume-credit, e.g. when AI generation failed.
billingRoutes.post("/internal/billing/refund-credit", requireInternal, async (req, res) => {
    const { userId, email, creditSource } = req.body;
    const wallet = await getWallet(userId);
    await refundAiCredit(wallet, creditSource);
    res.json({ aiTokenStatus: buildAiTokenStatus(wallet, email) });
});

billingRoutes.post("/internal/billing/plan", requireInternal, async (req, res) => {
    const wallet = await getWallet(req.body.userId);
    res.json({
        plan: normalizePlan(wallet.plan),
        planBillingCycle: wallet.planBillingCycle,
        planExpiry: wallet.planExpiry,
    });
});

export default billingRoutes;
