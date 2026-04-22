import mongoose from "mongoose";

const registrationOtpSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        otpHash: { type: String },
        attempts: { type: Number, default: 0 },
        verifiedAt: { type: Date },
        expiresAt: { type: Date, required: true, index: { expires: 0 } },
    },
    { timestamps: true }
);

const RegistrationOtp = mongoose.model("RegistrationOtp", registrationOtpSchema);
export default RegistrationOtp;
