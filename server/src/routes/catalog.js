import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import {
  MAX_ITEM_VALUE,
  MAX_PHOTOS,
  MIN_ITEM_VALUE,
  MIN_RENT,
  depositFor,
  formatRupees,
  maxRentFor,
} from "../../../client/src/data.js";
import { requireUser } from "./auth.js";
import { Category } from "../models/Category.js";
import { Club } from "../models/Club.js";
import { Item } from "../models/Item.js";
import { Request } from "../models/Request.js";
import { Review } from "../models/Review.js";

export const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads");

const LOCATIONS = ["Main Block", "Library", "Hostel A", "Hostel B", "Girls Hostel", "Sports Complex", "Auditorium"];
const BLOCKED_WORDS =
  /\b(make ?up|lipsticks?|cosmetics?|kajal|trimmers?|razors?|combs?|earphones?|earbuds?|innerwear|underwear|socks|shoes?|helmets?|calculators?|geometry box|notebooks?|chargers?|cables?|pencils?|batteries|food|medicines?|alcohol|cigarettes?)\b/i;

const router = Router();

function day(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function publicCategory(category) {
  return {
    id: category.slug,
    name: category.name,
    description: category.description,
    cover: category.cover,
  };
}

function publicClub(club) {
  return {
    id: club.code,
    name: club.name,
    category: club.category,
    description: club.description,
  };
}

function publicReview(review, itemId) {
  return {
    id: String(review._id),
    itemId,
    authorId: review.author ? String(review.author._id || review.author) : null,
    author: review.authorName,
    rating: review.rating,
    comment: review.comment,
    date: day(review.date || review.createdAt),
  };
}

function publicItem(item, reviews = []) {
  return {
    id: item.code,
    title: item.title,
    description: item.description,
    categoryId: item.category?.slug ?? null,
    clubId: item.club?.code ?? null,
    images: item.images,
    includes: item.includes,
    originalPrice: item.originalPrice,
    pricePerDay: item.pricePerDay,
    deposit: item.deposit,
    condition: item.condition,
    location: item.location,
    ownerId: item.owner ? String(item.owner._id || item.owner) : null,
    ownerName: item.ownerName,
    ownerRating: item.ownerRating,
    available: item.available,
    availableFrom: day(item.availableFrom),
    availableTo: day(item.availableTo),
    reviews: reviews.map((review) => publicReview(review, item.code)),
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function withReviews(items) {
  const reviews = await Review.find({ item: { $in: items.map((item) => item._id) } }).sort({ date: -1 });
  const grouped = new Map();
  for (const review of reviews) {
    const key = String(review.item);
    grouped.set(key, [...(grouped.get(key) || []), review]);
  }
  return items.map((item) => publicItem(item, grouped.get(String(item._id)) || []));
}

router.get("/categories", async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories.map(publicCategory));
});

router.get("/clubs", async (_req, res) => {
  const clubs = await Club.find().sort({ code: 1 });
  res.json(clubs.map(publicClub));
});

router.get("/clubs/:id", async (req, res) => {
  const club = await Club.findOne({ code: Number(req.params.id) });
  if (!club) return res.status(404).json({ message: "Club not found." });
  const items = await Item.find({ club: club._id }).populate("category").populate("club").sort({ code: 1 });
  res.json({ ...publicClub(club), items: await withReviews(items) });
});

router.get("/items", async (req, res) => {
  const filter = {};
  if (req.query.available === "true") filter.available = true;
  if (req.query.maxRent) filter.pricePerDay = { $lte: Number(req.query.maxRent) };

  const text = String(req.query.q || "").trim();
  if (text) {
    const pattern = new RegExp(escapeRegex(text), "i");
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category });
    if (!category) return res.json([]);
    filter.category = category._id;
  }

  if (req.query.club === "students") filter.club = null;
  else if (req.query.club === "clubs") filter.club = { $ne: null };
  else if (req.query.club) {
    const club = await Club.findOne({ code: Number(req.query.club) });
    if (!club) return res.json([]);
    filter.club = club._id;
  }

  const sort = {
    "price-asc": { pricePerDay: 1 },
    "price-desc": { pricePerDay: -1 },
    rating: { ownerRating: -1 },
  }[req.query.sort] || { code: 1 };

  const items = await Item.find(filter).populate("category").populate("club").sort(sort);
  res.json(await withReviews(items));
});

function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function wholeRupees(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount !== Math.round(amount)) return null;
  return amount;
}

function photoFile(value) {
  const match = /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\s]+)$/i.exec(String(value || ""));
  if (!match) return null;
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > 2 * 1024 * 1024) return null;
  const png = buffer[0] === 0x89 && buffer[1] === 0x50;
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const webp = buffer.slice(0, 4).toString() === "RIFF" && buffer.slice(8, 12).toString() === "WEBP";
  const ext = jpeg ? "jpg" : png ? "png" : webp ? "webp" : "";
  return ext ? { ext, buffer } : null;
}

function listingError(body) {
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const price = wholeRupees(body.originalPrice);
  const rent = wholeRupees(body.pricePerDay);
  const photos = Array.isArray(body.images) ? body.images : [];
  const availableFrom = String(body.availableFrom || "");
  const availableTo = String(body.availableTo || "");
  const today = todayISO();

  if (photos.length < 1 || photos.length > MAX_PHOTOS) return `Add 1 to ${MAX_PHOTOS} photos of the actual item.`;
  if (photos.some((photo) => !photoFile(photo))) return "Each photo must be a JPG, PNG, or WEBP under 2 MB.";
  if (title.length < 5 || title.length > 60) return "Give the item a specific name (brand + model works best).";
  if (BLOCKED_WORDS.test(title)) return "Personal-care, everyday, and consumable items can't be rented here.";
  if (!body.categoryId) return "Pick a category.";
  if (price == null) return "Enter the original price in whole rupees.";
  if (price < MIN_ITEM_VALUE) return `Items under ${formatRupees(MIN_ITEM_VALUE)} are cheaper to buy than rent.`;
  if (price > MAX_ITEM_VALUE) return `Items over ${formatRupees(MAX_ITEM_VALUE)} are too risky to cover with a student deposit.`;
  if (rent == null) return "Enter the daily rent in whole rupees.";
  if (rent < MIN_RENT) return `Minimum rent is ${formatRupees(MIN_RENT)}/day.`;
  if (rent > maxRentFor(price)) return `Rent can be at most ${formatRupees(maxRentFor(price))}/day (10% of the price).`;
  if (!["New", "Good", "Fair"].includes(body.condition)) return "Pick a condition.";
  if (!LOCATIONS.includes(body.location)) return "Choose a campus pickup point.";
  if (description.length < 20 || description.length > 300) return "Describe condition and use in at least 20 characters.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(availableFrom) || availableFrom < today) return "The available-from date can't be in the past.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(availableTo) || availableTo <= availableFrom) return "End date must be after the start date.";
  return "";
}

router.post("/items", requireUser, async (req, res) => {
  const message = listingError(req.body);
  if (message) return res.status(400).json({ message });

  const category = await Category.findOne({ slug: req.body.categoryId });
  if (!category) return res.status(400).json({ message: "Pick a category." });

  let club = null;
  if (req.body.clubId) {
    club = await Club.findOne({ code: Number(req.body.clubId) });
    if (!club) return res.status(400).json({ message: "That club isn't on BorrowBox." });
  }

  const photos = req.body.images.map(photoFile);
  const price = wholeRupees(req.body.originalPrice);
  const availableFrom = String(req.body.availableFrom);
  const latest = await Item.findOne().sort({ code: -1 }).select("code");
  const code = (latest?.code || 0) + 1;
  fs.mkdirSync(uploadsDir, { recursive: true });
  const files = photos.map((photo, index) => {
    const name = `${code}-${index + 1}.${photo.ext}`;
    fs.writeFileSync(path.join(uploadsDir, name), photo.buffer);
    return `/uploads/${name}`;
  });

  try {
    const item = await Item.create({
      code,
      title: String(req.body.title).trim(),
      description: String(req.body.description).trim(),
      category: category._id,
      club: club?._id ?? null,
      images: files,
      includes: (Array.isArray(req.body.includes) ? req.body.includes : [])
        .map((entry) => String(entry).trim())
        .filter(Boolean)
        .slice(0, 8),
      originalPrice: price,
      pricePerDay: wholeRupees(req.body.pricePerDay),
      deposit: depositFor(price),
      condition: req.body.condition,
      location: req.body.location,
      owner: req.user._id,
      ownerName: req.user.name,
      ownerRating: null,
      available: availableFrom <= todayISO(),
      availableFrom,
      availableTo: String(req.body.availableTo),
    });
    await item.populate(["category", "club"]);
    const [shaped] = await withReviews([item]);
    res.status(201).json(shaped);
  } catch (error) {
    files.forEach((file) => fs.rmSync(path.join(uploadsDir, path.basename(file)), { force: true }));
    if (error?.code === 11000) return res.status(409).json({ message: "Could not save the listing. Try again." });
    throw error;
  }
});

router.post("/items/:id/reviews", requireUser, async (req, res) => {
  const item = await Item.findOne({ code: Number(req.params.id) });
  if (!item) return res.status(404).json({ message: "Item not found." });
  if (item.owner && String(item.owner) === String(req.user._id)) {
    return res.status(400).json({ message: "You can't review your own listing." });
  }

  const finished = await Request.countDocuments({ item: item._id, borrower: req.user._id, status: "COMPLETED" });
  if (!finished) return res.status(403).json({ message: "You can review an item after you return it." });
  if (await Review.exists({ item: item._id, author: req.user._id })) {
    return res.status(409).json({ message: "You've already reviewed this item." });
  }

  const rating = Number(req.body.rating);
  const comment = String(req.body.comment || "").trim();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: "Choose a rating from 1 to 5." });
  if (comment.length < 10 || comment.length > 300) return res.status(400).json({ message: "Write at least 10 characters about the rental." });

  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  try {
    await Review.create({
      item: item._id,
      author: req.user._id,
      authorName: req.user.name,
      rating,
      comment,
      date: new Date(`${local.toISOString().slice(0, 10)}T00:00:00.000Z`),
    });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: "You've already reviewed this item." });
    throw error;
  }

  const reviews = await Review.find({ item: item._id });
  item.ownerRating = Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) / 10;
  await item.save();
  await item.populate(["category", "club"]);
  const [shaped] = await withReviews([item]);
  res.status(201).json(shaped);
});

router.get("/items/:id", async (req, res) => {
  const item = await Item.findOne({ code: Number(req.params.id) }).populate("category").populate("club");
  if (!item) return res.status(404).json({ message: "Item not found." });
  const [shaped] = await withReviews([item]);
  res.json(shaped);
});

export default router;
