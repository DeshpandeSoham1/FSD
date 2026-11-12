import fs from "fs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { connectDb } from "./db.js";
import { ensureSeeded } from "./ensureSeed.js";
import authRouter from "./routes/auth.js";
import catalogRouter, { uploadsDir } from "./routes/catalog.js";
import requestsRouter from "./routes/requests.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin.startsWith("http://127.0.0.1:") || origin.startsWith("http://localhost:") || origin.endsWith(".vercel.app")) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "12mb" }));
app.use(cookieParser());

if (!process.env.VERCEL) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use("/uploads", express.static(uploadsDir));
}

let ready;
function prepare() {
  if (!ready) {
    ready = (async () => {
      await connectDb();
      if (process.env.VERCEL) await ensureSeeded();
    })().catch((error) => {
      ready = undefined;
      throw error;
    });
  }
  return ready;
}

app.use(async (_req, res, next) => {
  try {
    await prepare();
    next();
  } catch (error) {
    console.error("Database setup failed.", error.message);
    res.status(503).json({ message: "The database is unavailable. Try again in a moment." });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/api/requests", requestsRouter);
app.use("/api", catalogRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  if (res.headersSent) return;
  res.status(500).json({ message: "Something went wrong." });
});

export default app;
