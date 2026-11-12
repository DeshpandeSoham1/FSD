import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MAX_ITEM_VALUE,
  MAX_PHOTOS,
  MIN_ITEM_VALUE,
  MIN_RENT,
  depositFor,
  formatRupees,
  maxRentFor,
  suggestedRentFor,
  toISODate,
} from "../data";
import { useStore } from "../store";
import { RulesPanel } from "./Categories";

const MAX_UPLOAD_MB = 8;
const MIN_PHOTO_SIDE = 400;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const LOCATIONS = ["Main Block", "Library", "Hostel A", "Hostel B", "Girls Hostel", "Sports Complex", "Auditorium"];
const BLOCKED_WORDS =
  /\b(make ?up|lipsticks?|cosmetics?|kajal|trimmers?|razors?|combs?|earphones?|earbuds?|innerwear|underwear|socks|shoes?|helmets?|calculators?|geometry box|notebooks?|chargers?|cables?|pencils?|batteries|food|medicines?|alcohol|cigarettes?)\b/i;

function readPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (Math.min(img.width, img.height) < MIN_PHOTO_SIDE) {
        reject(new Error(`${file.name} is too small. Use a photo at least ${MIN_PHOTO_SIDE}px on each side.`));
        return;
      }
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} couldn't be read as an image.`));
    };
    img.src = url;
  });
}

const today = toISODate(new Date());

const emptyForm = {
  title: "",
  categoryId: "",
  clubId: "",
  originalPrice: "",
  pricePerDay: "",
  condition: "Good",
  location: "",
  description: "",
  includes: "",
  availableFrom: today,
  availableTo: "",
  confirmed: false,
};

function validate(form, photos) {
  const errors = {};
  const price = Number(form.originalPrice);
  const rent = Number(form.pricePerDay);

  if (!photos.length) errors.photos = "Add at least one clear photo of the actual item.";
  if (form.title.trim().length < 5) errors.title = "Give the item a specific name (brand + model works best).";
  else if (BLOCKED_WORDS.test(form.title))
    errors.title = "This looks like a personal-care, everyday, or consumable item. Those can't be rented here.";
  if (!form.categoryId) errors.categoryId = "Pick a category.";
  if (!form.originalPrice) errors.originalPrice = "Enter what the item cost new.";
  else if (price < MIN_ITEM_VALUE)
    errors.originalPrice = `Items under ${formatRupees(MIN_ITEM_VALUE)} are cheaper to buy than rent.`;
  else if (price > MAX_ITEM_VALUE)
    errors.originalPrice = `Items over ${formatRupees(MAX_ITEM_VALUE)} are too risky to cover with a student deposit.`;
  if (!form.pricePerDay) errors.pricePerDay = "Set a daily rent.";
  else if (rent < MIN_RENT) errors.pricePerDay = `Minimum rent is ${formatRupees(MIN_RENT)}/day.`;
  else if (price >= MIN_ITEM_VALUE && rent > maxRentFor(price))
    errors.pricePerDay = `Rent can be at most ${formatRupees(maxRentFor(price))}/day (10% of the price).`;
  if (!form.location) errors.location = "Choose a pickup point.";
  if (form.description.trim().length < 20) errors.description = "Describe condition and use in at least 20 characters.";
  if (!form.availableTo) errors.availableTo = "Choose the last date it can be borrowed.";
  else if (form.availableTo <= form.availableFrom) errors.availableTo = "End date must be after the start date.";
  if (!form.confirmed) errors.confirmed = "Please confirm the listing rules.";
  return errors;
}

export default function ListItem() {
  const { user, authReady, categories, clubs, addItem, showToast } = useStore();
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [publishing, setPublishing] = useState(false);

  if (!authReady) {
    return (
      <section className="container page empty-page">
        <h1>List an item</h1>
        <p className="muted">Checking your account…</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="container page empty-page">
        <h1>Log in to list an item</h1>
        <p className="muted">Listings are tied to your college account so borrowers know who they're meeting.</p>
        <Link to="/login" state={{ from: "/list" }} className="btn btn-primary">Log in</Link>
      </section>
    );
  }

  const errors = validate(form, photos);
  const show = (key) => submitted && errors[key];
  const price = Number(form.originalPrice);
  const priceValid = price >= MIN_ITEM_VALUE && price <= MAX_ITEM_VALUE;

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function addPhotos(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setPhotoError("");
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      setPhotoError(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    const problems = [];
    const accepted = files.slice(0, room).filter((file) => {
      if (!PHOTO_TYPES.includes(file.type)) problems.push(`${file.name} isn't a JPG, PNG, or WEBP image.`);
      else if (file.size > MAX_UPLOAD_MB * 1024 * 1024) problems.push(`${file.name} is over ${MAX_UPLOAD_MB} MB.`);
      else return true;
      return false;
    });
    if (files.length > room) problems.push(`Only ${MAX_PHOTOS} photos allowed, extra files were skipped.`);

    setProcessing(true);
    const results = await Promise.allSettled(accepted.map(readPhoto));
    setProcessing(false);
    results.forEach((result) => result.status === "rejected" && problems.push(result.reason.message));
    const ready = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
    setPhotos((current) => [...current, ...ready].slice(0, MAX_PHOTOS));
    setPhotoError(problems.join(" "));
  }

  function removePhoto(index) {
    setPhotos((current) => current.filter((_, i) => i !== index));
  }

  function makeCover(index) {
    setPhotos((current) => [current[index], ...current.filter((_, i) => i !== index)]);
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length || publishing) {
      if (Object.keys(errors).length) showToast("Fix the highlighted fields before publishing.", "error");
      return;
    }
    setPublishing(true);
    try {
      const saved = await addItem({
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId,
        clubId: form.clubId ? Number(form.clubId) : null,
        images: photos,
        includes: form.includes.split(",").map((entry) => entry.trim()).filter(Boolean),
        originalPrice: price,
        pricePerDay: Number(form.pricePerDay),
        condition: form.condition,
        location: form.location,
        availableFrom: form.availableFrom,
        availableTo: form.availableTo,
      });
      showToast("Listing published.");
      navigate(`/items/${saved.id}`);
    } catch (error) {
      showToast(error.message, "error");
      setPublishing(false);
    }
  }

  return (
    <section className="container page">
      <div className="page-head">
        <h1>List an item</h1>
        <p className="muted">
          Real photos, honest price. Items must cost {formatRupees(MIN_ITEM_VALUE)}–{formatRupees(MAX_ITEM_VALUE)} new and
          rent from {formatRupees(MIN_RENT)}/day.
        </p>
      </div>

      <form className="list-form" onSubmit={submit} noValidate>
        <div className="card form-card">
          <h2 className="form-title">Photos</h2>
          <p className="muted small">
            Up to {MAX_PHOTOS} photos of the actual item, not stock images. Shoot in daylight and include any marks or
            wear. The first photo is the cover.
          </p>
          <div
            className={dragging ? "dropzone dragging" : "dropzone"}
            onClick={() => fileInput.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addPhotos(event.dataTransfer.files);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && fileInput.current?.click()}
          >
            <strong>{processing ? "Processing photos…" : "Click or drop photos here"}</strong>
            <span className="muted small">JPG, PNG, or WEBP · up to {MAX_UPLOAD_MB} MB each · at least {MIN_PHOTO_SIDE}px</span>
            <input
              ref={fileInput}
              type="file"
              accept={PHOTO_TYPES.join(",")}
              multiple
              hidden
              onChange={(event) => {
                addPhotos(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
          {photos.length > 0 && (
            <div className="photo-grid">
              {photos.map((src, index) => (
                <div key={src.slice(-32) + index} className="photo-tile">
                  <img src={src} alt={`Upload ${index + 1}`} />
                  {index === 0 ? (
                    <span className="badge badge-ok photo-tag">Cover</span>
                  ) : (
                    <button type="button" className="photo-tag chip" onClick={() => makeCover(index)}>Make cover</button>
                  )}
                  <button type="button" className="photo-remove" aria-label="Remove photo" onClick={() => removePhoto(index)}>✕</button>
                </div>
              ))}
            </div>
          )}
          {photoError && <p className="form-error">{photoError}</p>}
          {show("photos") && <p className="form-error">{errors.photos}</p>}
        </div>

        <div className="card form-card">
          <h2 className="form-title">Details</h2>
          <div className="form-grid">
            <label className="field span-2">
              <span>Item name</span>
              <input value={form.title} maxLength={60} placeholder="e.g. Yamaha F310 acoustic guitar" onChange={(event) => update("title", event.target.value)} />
              {show("title") && <small className="form-error">{errors.title}</small>}
            </label>
            <label className="field">
              <span>Category</span>
              <select value={form.categoryId} onChange={(event) => update("categoryId", event.target.value)}>
                <option value="">Select a category</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              {show("categoryId") && <small className="form-error">{errors.categoryId}</small>}
            </label>
            <label className="field">
              <span>Listing as</span>
              <select value={form.clubId} onChange={(event) => update("clubId", event.target.value)}>
                <option value="">Myself ({user.name})</option>
                {clubs.map((club) => <option key={club.id} value={club.id}>{club.name} club (coordinator)</option>)}
              </select>
            </label>
            <label className="field span-2">
              <span>Description</span>
              <textarea
                rows={3}
                maxLength={300}
                value={form.description}
                placeholder="Condition, what it's good for, anything the borrower should know."
                onChange={(event) => update("description", event.target.value)}
              />
              {show("description") && <small className="form-error">{errors.description}</small>}
            </label>
            <label className="field span-2">
              <span>What's included (comma separated)</span>
              <input value={form.includes} placeholder="Gig bag, capo, picks" onChange={(event) => update("includes", event.target.value)} />
            </label>
            <label className="field">
              <span>Condition</span>
              <select value={form.condition} onChange={(event) => update("condition", event.target.value)}>
                <option>New</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
            </label>
            <label className="field">
              <span>Pickup point</span>
              <select value={form.location} onChange={(event) => update("location", event.target.value)}>
                <option value="">Select a campus location</option>
                {LOCATIONS.map((place) => <option key={place}>{place}</option>)}
              </select>
              {show("location") && <small className="form-error">{errors.location}</small>}
            </label>
          </div>
        </div>

        <div className="card form-card">
          <h2 className="form-title">Pricing & availability</h2>
          <div className="form-grid">
            <label className="field">
              <span>Original price (₹)</span>
              <input
                type="number"
                inputMode="numeric"
                min={MIN_ITEM_VALUE}
                max={MAX_ITEM_VALUE}
                value={form.originalPrice}
                placeholder={`${MIN_ITEM_VALUE}–${MAX_ITEM_VALUE}`}
                onChange={(event) => update("originalPrice", event.target.value)}
              />
              {show("originalPrice") || (form.originalPrice && errors.originalPrice) ? (
                <small className="form-error">{errors.originalPrice}</small>
              ) : null}
            </label>
            <label className="field">
              <span>Rent per day (₹)</span>
              <input
                type="number"
                inputMode="numeric"
                min={MIN_RENT}
                max={priceValid ? maxRentFor(price) : undefined}
                value={form.pricePerDay}
                placeholder={priceValid ? `${MIN_RENT}–${maxRentFor(price)}` : `From ${MIN_RENT}`}
                onChange={(event) => update("pricePerDay", event.target.value)}
              />
              {show("pricePerDay") || (form.pricePerDay && errors.pricePerDay) ? (
                <small className="form-error">{errors.pricePerDay}</small>
              ) : null}
            </label>
            {priceValid && (
              <div className="price-hint span-2">
                <span>
                  Suggested <strong>{formatRupees(suggestedRentFor(price))}/day</strong> · Borrower deposit{" "}
                  <strong>{formatRupees(depositFor(price))}</strong>
                </span>
                <button type="button" className="chip" onClick={() => update("pricePerDay", String(suggestedRentFor(price)))}>
                  Use suggested
                </button>
              </div>
            )}
            <label className="field">
              <span>Available from</span>
              <input type="date" min={today} value={form.availableFrom} onChange={(event) => update("availableFrom", event.target.value)} />
            </label>
            <label className="field">
              <span>Available until</span>
              <input type="date" min={form.availableFrom} value={form.availableTo} onChange={(event) => update("availableTo", event.target.value)} />
              {show("availableTo") && <small className="form-error">{errors.availableTo}</small>}
            </label>
          </div>
          <label className="toggle confirm">
            <input type="checkbox" checked={form.confirmed} onChange={(event) => update("confirmed", event.target.checked)} />
            <span>I own this item, it works as described, and it isn't a personal-care or consumable item.</span>
          </label>
          {show("confirmed") && <p className="form-error">{errors.confirmed}</p>}
          <button type="submit" className="btn btn-primary block" disabled={processing || publishing}>
            {publishing ? "Publishing…" : "Publish listing"}
          </button>
        </div>
      </form>

      <RulesPanel />
    </section>
  );
}
