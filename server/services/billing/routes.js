import express from "express";
import { createOrder, getAiTokenStatus, verifyPayment } from "./controllers/billing.controller.js";
import { requireUser } from "../../common/requireUser.js";

const billingRoutes = express.Router();

billingRoutes.post("/api/payment/create-order", requireUser, createOrder);
billingRoutes.post("/api/payment/verify-payment", requireUser, verifyPayment);
billingRoutes.get("/api/user/ai-token-status", requireUser, getAiTokenStatus);

export default billingRoutes;
