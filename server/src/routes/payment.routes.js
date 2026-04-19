import express from "express";
import { createOrder, verifyPayment } from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", protect, createOrder);
paymentRouter.post("/verify-payment", protect, verifyPayment);

export default paymentRouter;