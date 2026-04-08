import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import connectDB from "./config/mongodb.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import testRouter from "./routes/test.routes.js";
import attemptRouter from "./routes/attempt.routes.js";

dotenv.config();

const app = express();
await connectDB();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/test', testRouter);
app.use("/api/attempt", attemptRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});