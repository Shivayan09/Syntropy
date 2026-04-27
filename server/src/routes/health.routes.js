import express from "express";

const healthRouter = express.Router();

healthRouter.get("/ping", (req, res) => {
    res.status(200).send("ok");
});

export default healthRouter;