import mongoose from "mongoose";

// One document per Razorpay order that was paid and applied to a wallet.
// The unique order id stops the same payment from being applied twice.
const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, required: true },
    itemKey: { type: String, required: true },
    kind: { type: String, enum: ["plan", "topup"], required: true },
    amountPaise: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    credits: { type: Number, required: true },
},
    { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
