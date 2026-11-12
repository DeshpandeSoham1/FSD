import bcrypt from "bcryptjs";
import { COLLEGE_DOMAIN, categories, clubs, depositFor, items, reviews } from "../../client/src/data.js";
import { Category } from "./models/Category.js";
import { Club } from "./models/Club.js";
import { Item } from "./models/Item.js";
import { Request } from "./models/Request.js";
import { Review } from "./models/Review.js";
import { User } from "./models/User.js";

function ownerEmail(name) {
  const slug = name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");
  return `${slug}${COLLEGE_DOMAIN}`;
}

const RETIRED_ITEM_CODES = [33, 34];

async function syncExistingCatalog() {
  await Promise.all(
    categories.map((category) =>
      Category.updateOne(
        { slug: category.id },
        { name: category.name, description: category.description, cover: category.cover },
      ),
    ),
  );
  const retired = await Item.find({ code: { $in: RETIRED_ITEM_CODES } }).select("_id");
  if (!retired.length) return;
  const ids = retired.map((item) => item._id);
  await Review.deleteMany({ item: { $in: ids } });
  await Request.deleteMany({ item: { $in: ids } });
  await Item.deleteMany({ _id: { $in: ids } });
}

export async function ensureSeeded() {
  await syncExistingCatalog();
  const itemCount = await Item.countDocuments();
  if (itemCount) return;
  if (await Category.countDocuments()) {
    await Review.deleteMany({});
    await Category.deleteMany({});
    await Club.deleteMany({});
  }

  const savedCategories = await Category.insertMany(
    categories.map((category) => ({
      slug: category.id,
      name: category.name,
      description: category.description,
      cover: category.cover,
    })),
  );
  const categoryBySlug = new Map(savedCategories.map((category) => [category.slug, category._id]));

  const savedClubs = await Club.insertMany(
    clubs.map((club) => ({
      code: club.id,
      name: club.name,
      category: club.category,
      description: club.description,
    })),
  );
  const clubByCode = new Map(savedClubs.map((club) => [club.code, club._id]));

  const passwordHash = await bcrypt.hash("secret1", 10);
  const ownerNames = [...new Set(items.map((item) => item.ownerName))];
  const ownerByName = new Map();
  for (const [index, name] of ownerNames.entries()) {
    const email = ownerEmail(name);
    let user = await User.findOne({ email });
    if (!user) {
      const usn = `1MS24OW${String(index + 1).padStart(2, "0")}`;
      user = await User.create({
        name,
        email,
        usn: (await User.exists({ usn })) ? `1MS24OX${String(index + 1).padStart(2, "0")}` : usn,
        passwordHash,
      });
    }
    ownerByName.set(name, user._id);
  }

  const savedItems = await Item.insertMany(
    items.map((item) => ({
      code: item.id,
      title: item.title,
      description: item.description,
      category: categoryBySlug.get(item.categoryId),
      club: item.clubId ? clubByCode.get(item.clubId) : null,
      images: item.images,
      includes: item.includes,
      originalPrice: item.originalPrice,
      pricePerDay: item.pricePerDay,
      deposit: depositFor(item.originalPrice),
      condition: item.condition,
      location: item.location,
      owner: ownerByName.get(item.ownerName),
      ownerName: item.ownerName,
      ownerRating: item.ownerRating,
      available: item.available,
      availableFrom: item.availableFrom,
      availableTo: item.availableTo,
    })),
  );
  const itemByCode = new Map(savedItems.map((item) => [item.code, item._id]));

  await Review.insertMany(
    reviews
      .filter((review) => itemByCode.has(review.itemId))
      .map((review) => ({
        item: itemByCode.get(review.itemId),
        author: ownerByName.get(review.author) ?? null,
        authorName: review.author,
        rating: review.rating,
        comment: review.comment,
        date: review.date,
      })),
  );
}
