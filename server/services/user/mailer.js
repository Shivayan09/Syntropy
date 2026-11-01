import nodemailer from "nodemailer";

// One SMTP setup for every email the app sends (welcome, OTP, password reset, contact support).
export const createEmailTransporter = () => {
    const user = process.env.EMAIL;
    const pass = process.env.EMAIL_PASS;
    if (!user || !pass) {
        throw new Error("Email service is not configured. Missing EMAIL or EMAIL_PASS.");
    }

    const port = Number(process.env.SMTP_PORT || 465);
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port,
        secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });
};
