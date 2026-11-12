import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { COLLEGE_DOMAIN, usnError } from "../../../client/src/data.js";
import { User } from "../models/User.js";

const router = Router();
const COOKIE = "token";
const WEEK = 7 * 24 * 60 * 60 * 1000;

function publicUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, usn: user.usn };
}

function sign(user) {
  return jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function setCookie(res, token) {
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: WEEK,
    path: "/",
  });
}

function readUser(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export async function requireUser(req, res, next) {
  const payload = readUser(req);
  if (!payload?.sub) return res.status(401).json({ message: "Log in to continue." });
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ message: "Log in to continue." });
  req.user = user;
  next();
}

function validate({ name, email, usn, password }, { register }) {
  if (register && (!name || name.trim().length < 2)) return "Enter your full name.";
  if (!email || !email.toLowerCase().endsWith(COLLEGE_DOMAIN)) {
    return `Use your college email ending in ${COLLEGE_DOMAIN}.`;
  }
  if (register && usnError(usn)) return usnError(usn);
  if (!password || password.length < 6) return "Password must be at least 6 characters.";
  return "";
}

router.post("/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const usn = String(req.body.usn || "").trim().toUpperCase();
  const { password } = req.body;
  const message = validate({ name, email, usn, password }, { register: true });
  if (message) return res.status(400).json({ message });

  if (await User.findOne({ email })) return res.status(409).json({ message: "An account with this email already exists." });
  if (await User.findOne({ usn })) return res.status(409).json({ message: "An account with this USN already exists." });

  const user = await User.create({
    name,
    email,
    usn,
    passwordHash: await bcrypt.hash(password, 10),
  });
  setCookie(res, sign(user));
  res.status(201).json(publicUser(user));
});

router.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const { password } = req.body;
  const message = validate({ email, password }, { register: false });
  if (message) return res.status(400).json({ message });

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }
  setCookie(res, sign(user));
  res.json(publicUser(user));
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/me", requireUser, (req, res) => {
  res.json(publicUser(req.user));
});

export default router;
