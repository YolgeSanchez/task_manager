import express, { type Application } from "express";

const app: Application = express();

// middlewares

// routes
app.get("/health", (_, res) => {
  res.send(">>> Running healthy");
});

export default app;
