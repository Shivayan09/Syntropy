// Starts the assessment service as its own process: connect to MongoDB, add its routes, listen on its PORT.
// Everything it needs is inside this folder. Other services are reached only over HTTP.
import express from "express";
import mongoose from "mongoose";
import routes from "./routes.js";

for (const required of ["PORT", "MONGO_URI", "INTERNAL_API_TOKEN", "USER_URL", "GENERATION_URL"]) {
    if (!process.env[required]) {
        throw new Error(`assessment service: ${required} is not set in its .env`);
    }
}

await mongoose.connect(process.env.MONGO_URI);
console.log("Database connected!");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.get("/health/ping", (req, res) => res.status(200).send("ok"));
app.use(routes);

// Errors passed to next(err), e.g. a rejected file upload or a bad JSON body.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
    return res.status(400).json({ success: false, message: err.message || "Request could not be processed." });
});

app.listen(process.env.PORT, () => {
    console.log(`assessment service running on port ${process.env.PORT}`);
});
