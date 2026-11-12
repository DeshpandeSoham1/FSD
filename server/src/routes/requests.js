import { Router } from "express";
import { MAX_RENTAL_DAYS, NEW_USER_VALUE_LIMIT, formatRupees } from "../../../client/src/data.js";
import { requireUser } from "./auth.js";
import { Item } from "../models/Item.js";
import { Request } from "../models/Request.js";

const router = Router();
const BLOCKING = ["ACCEPTED", "ACTIVE", "DISPUTED"];
const DAY = 24 * 60 * 60 * 1000;

function day(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function parseDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function rentalDays(start, end) {
  return Math.round((end - start) / DAY) + 1;
}

function publicRequest(request, kind) {
  return {
    id: String(request._id),
    itemId: request.item.code,
    borrowerName: request.borrower.name,
    ownerName: request.item.ownerName,
    startDate: day(request.startDate),
    endDate: day(request.endDate),
    status: request.status,
    kind,
  };
}

async function overlap(itemId, start, end, exceptId) {
  return Request.exists({
    item: itemId,
    _id: exceptId ? { $ne: exceptId } : { $exists: true },
    status: { $in: BLOCKING },
    startDate: { $lte: end },
    endDate: { $gte: start },
  });
}

router.get("/incoming", requireUser, async (req, res) => {
  const items = await Item.find({ owner: req.user._id }).select("_id");
  const requests = await Request.find({ item: { $in: items.map((item) => item._id) } })
    .populate("item", "code ownerName")
    .populate("borrower", "name")
    .sort({ createdAt: -1 });
  res.json(requests.map((request) => publicRequest(request, "incoming")));
});

router.get("/mine", requireUser, async (req, res) => {
  const requests = await Request.find({ borrower: req.user._id })
    .populate("item", "code ownerName")
    .populate("borrower", "name")
    .sort({ createdAt: -1 });
  res.json(requests.map((request) => publicRequest(request, "borrowing")));
});

router.post("/", requireUser, async (req, res) => {
  const item = await Item.findOne({ code: Number(req.body.itemId) });
  if (!item) return res.status(404).json({ message: "Item not found." });
  if (!item.owner) return res.status(400).json({ message: "This listing isn't linked to a student account yet." });
  if (String(item.owner) === String(req.user._id)) return res.status(400).json({ message: "You can't borrow your own listing." });

  const start = parseDay(req.body.startDate);
  const end = parseDay(req.body.endDate);
  const today = todayISO();
  const availableFrom = day(item.availableFrom);
  const availableTo = day(item.availableTo);
  if (!start || day(start) < today || day(start) < availableFrom) {
    return res.status(400).json({ message: "Start date can't be in the past or before the item is available." });
  }
  if (!end || day(end) < day(start)) return res.status(400).json({ message: "End date must be on or after the start date." });
  if (day(end) > availableTo) return res.status(400).json({ message: `The owner needs it back by ${availableTo}.` });
  if (rentalDays(start, end) > MAX_RENTAL_DAYS) {
    return res.status(400).json({ message: `Rentals are limited to ${MAX_RENTAL_DAYS} days.` });
  }

  const finished = await Request.countDocuments({ borrower: req.user._id, status: "COMPLETED" });
  if (finished < 2 && item.originalPrice > NEW_USER_VALUE_LIMIT) {
    return res.status(400).json({
      message: `New accounts can borrow items worth up to ${formatRupees(NEW_USER_VALUE_LIMIT)} until two rentals are completed.`,
    });
  }
  if (await overlap(item._id, start, end)) return res.status(409).json({ message: "Those dates are already booked." });

  const request = await Request.create({
    item: item._id,
    borrower: req.user._id,
    startDate: start,
    endDate: end,
    status: "PENDING",
  });
  await request.populate([
    { path: "item", select: "code ownerName" },
    { path: "borrower", select: "name" },
  ]);
  res.status(201).json(publicRequest(request, "borrowing"));
});

router.patch("/:id", requireUser, async (req, res) => {
  const request = await Request.findById(req.params.id).populate("item", "code owner ownerName").populate("borrower", "name");
  if (!request) return res.status(404).json({ message: "Request not found." });

  const next = String(req.body.status || "");
  const isOwner = String(request.item.owner) === String(req.user._id);
  const isBorrower = String(request.borrower._id) === String(req.user._id);
  const ownerMoves = { PENDING: ["ACCEPTED", "REJECTED"], ACCEPTED: ["ACTIVE"], ACTIVE: ["COMPLETED", "DISPUTED"] };
  const allowed = (isOwner && ownerMoves[request.status]?.includes(next)) || (isBorrower && request.status === "PENDING" && next === "CANCELLED");
  if (!allowed) {
    return res.status(403).json({ message: "You can't make that change to this request." });
  }
  if (next === "ACCEPTED" && (await overlap(request.item._id, request.startDate, request.endDate, request._id))) {
    return res.status(409).json({ message: "Those dates are already booked." });
  }

  request.status = next;
  await request.save();
  res.json(publicRequest(request, isOwner ? "incoming" : "borrowing"));
});

export default router;
