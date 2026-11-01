import mongoose from "mongoose";

// AI credits and plan for one user. These fields used to live on the user document.
const walletSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    aiTokens: { type: Number, default: 0 },
    bonusAiTokens: { type: Number, default: 0 },
    freeAiTestsUsed: { type: Number, default: 0 },
    lastTokenReset: { type: Date, default: Date.now },
    plan: { type: String, enum: ["free", "starter", "pro", "power", "elite"], default: "free" },
    planBillingCycle: { type: String, enum: ["monthly", "annual", null], default: null },
    planExpiry: { type: Date },
},
    { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
