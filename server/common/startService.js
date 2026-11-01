import express from "express";
import connectDB from "./db.js";
import { errorHandler } from "./errorHandler.js";

// Starts one service as its own process: connect to MongoDB, add its routes, listen on its PORT.
// Each service's env (PORT, MONGO_URI, its API keys...) comes from its own .env file.
export const startService = async (name, routes) => {
    for (const required of ["PORT", "MONGO_URI", "INTERNAL_API_TOKEN"]) {
        if (!process.env[required]) {
            throw new Error(`${name} service: ${required} is not set in its .env`);
        }
    }

    await connectDB();

    const app = express();
    app.use(express.json({ limit: "1mb" }));
    app.get("/health/ping", (req, res) => res.status(200).send("ok"));
    app.use(routes);
    app.use(errorHandler);

    app.listen(process.env.PORT, () => {
        console.log(`${name} service running on port ${process.env.PORT}`);
    });
};
