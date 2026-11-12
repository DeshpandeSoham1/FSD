import "dotenv/config";
import fs from "fs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { connectDb } from "./db.js";
import authRouter from "./routes/auth.js";
import catalogRouter, { uploadsDir } from "./routes/catalog.js";
import requestsRouter from "./routes/requests.js";

const app = express();
app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "12mb" }));
app.use(cookieParser());
fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/api/requests", requestsRouter);
app.use("/api", catalogRouter);

const port = Number(process.env.PORT) || 4000;

try {
  await connectDb();
  app.listen(port, () => {
    console.log(`BorrowBox API listening on http://127.0.0.1:${port}`);
  });
} catch (error) {
  console.error("Could not connect to MongoDB.", error.message);
  process.exit(1);
}
