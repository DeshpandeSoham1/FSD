import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import ItemImage from "../components/ItemImage";
import PolicyModal from "../components/PolicyModal";
import {
  MAX_RENTAL_DAYS,
  depositFor,
  formatPrice,
  formatRupees,
  getCategory,
  getClub,
  reviews,
  toISODate,
} from "../data";
import imageCredits from "../imageCredits.json";
import { clubLogo } from "../clubLogos";
import { useStore } from "../store";

const DAY = 24 * 60 * 60 * 1000;

function rentalDays(start, end) {
  return Math.round((new Date(end) - new Date(start)) / DAY) + 1;
}

export default function ItemDetail() {
  const { id } = useParams();
  const { items, getItem, user, requests, addRequest, addReview, showToast, catalogReady } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const item = getItem(id);
  const [photo, setPhoto] = useState(0);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [showPolicy, setShowPolicy] = useState(false);
  const [sending, setSending] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [today] = useState(() => toISODate(new Date()));

  if (!catalogReady) {
    return (
      <section className="container page empty-page">
        <h1>Loading item…</h1>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="container page empty-page">
        <h1>Item not found</h1>
        <p className="muted">It may have been removed by the owner.</p>
        <Link to="/explore" className="btn btn-primary">Back to explore</Link>
      </section>
    );
  }

  const category = getCategory(item.categoryId);
  const club = getClub(item.clubId);
  const deposit = depositFor(item.originalPrice);
  const minStart = item.availableFrom > today ? item.availableFrom : today;
  const credit = imageCredits[item.images[photo]];
  const itemReviews = item.reviews ?? reviews.filter((review) => review.itemId === item.id);
  const alreadyReviewed = itemReviews.some((review) => review.authorId && user && review.authorId === user.id);
  const canReview = Boolean(
    user &&
      !alreadyReviewed &&
      requests.some((request) => request.kind === "borrowing" && request.itemId === item.id && request.status === "COMPLETED"),
  );
  const related = items.filter((other) => other.categoryId === item.categoryId && other.id !== item.id).slice(0, 4);
  const isOwner = Boolean(user && item.ownerId && user.id === item.ownerId);

  let error = "";
  if (start && start < minStart) error = "Start date can't be in the past or before the item is available.";
  else if (end && start && end < start) error = "End date must be on or after the start date.";
  else if (end && end > item.availableTo) error = `The owner needs it back by ${item.availableTo}.`;
  else if (start && end && rentalDays(start, end) > MAX_RENTAL_DAYS) error = `Rentals are limited to ${MAX_RENTAL_DAYS} days.`;

  const days = start && end && !error ? rentalDays(start, end) : 0;
  const rent = days * item.pricePerDay;

  async function requestBorrow() {
    if (!user) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setSending(true);
    try {
      await addRequest({ itemId: item.id, startDate: start, endDate: end });
      showToast(`Request sent to ${item.ownerName}. Track it in your dashboard.`);
      setStart("");
      setEnd("");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="container page">
      <nav className="crumbs">
        <Link to="/explore">Explore</Link>
        <span>/</span>
        <Link to={`/explore?category=${item.categoryId}`}>{category?.name}</Link>
      </nav>

      <div className="detail">
        <div className="gallery">
          <div className="gallery-main card">
            <ItemImage src={item.images[photo]} alt={item.title} />
          </div>
          {item.images.length > 1 && (
            <div className="gallery-thumbs">
              {item.images.map((src, index) => (
                <button
                  key={src.slice(-40) + index}
                  type="button"
                  className={index === photo ? "thumb active" : "thumb"}
                  onClick={() => setPhoto(index)}
                  aria-label={`Photo ${index + 1}`}
                >
                  <ItemImage src={src} alt="" />
                </button>
              ))}
            </div>
          )}
          {credit && (
            <p className="credit">
              Photo: <a href={credit.url} target="_blank" rel="noreferrer">{credit.author || "Wikimedia Commons"}</a>, {credit.license}
            </p>
          )}
        </div>

        <div className="detail-info">
          <div className="badges">
            <span className="badge badge-muted">{category?.name}</span>
            {club && (
              <Link to={`/clubs/${club.id}`} className="badge badge-ok club-badge">
                {clubLogo(club.name) ? <img src={clubLogo(club.name)} alt="" /> : null}
                {club.name} club
              </Link>
            )}
            <span className={item.available ? "badge badge-ok" : "badge badge-amber"}>
              {item.available ? "Available now" : `Booked until ${item.availableFrom}`}
            </span>
          </div>
          <h1>{item.title}</h1>
          <p className="muted">{item.description}</p>

          <div className="price-row">
            <strong>{formatPrice(item.pricePerDay)}</strong>
            <span className="muted">Deposit {formatRupees(deposit)} · Worth {formatRupees(item.originalPrice)}</span>
          </div>

          <dl className="facts">
            <div><dt>Condition</dt><dd>{item.condition}</dd></div>
            <div><dt>Pickup</dt><dd>{item.location}</dd></div>
            <div><dt>Owner</dt><dd>{item.ownerName} · {item.ownerRating ? `★ ${item.ownerRating.toFixed(1)}` : "New lender"}</dd></div>
            <div><dt>Lending window</dt><dd>{item.availableFrom} → {item.availableTo}</dd></div>
          </dl>

          {item.includes?.length > 0 && (
            <div className="includes">
              <h3>What's included</h3>
              <ul>
                {item.includes.map((entry) => <li key={entry}>{entry}</li>)}
              </ul>
            </div>
          )}

          <div className="book card">
            <div className="date-row">
              <label className="field">
                <span>From</span>
                <input type="date" min={minStart} max={item.availableTo} value={start} onChange={(event) => setStart(event.target.value)} />
              </label>
              <label className="field">
                <span>To</span>
                <input type="date" min={start || minStart} max={item.availableTo} value={end} onChange={(event) => setEnd(event.target.value)} />
              </label>
            </div>
            {error && <p className="form-error">{error}</p>}
            {days > 0 && (
              <div className="total">
                <div><span>{formatPrice(item.pricePerDay)} × {days} {days === 1 ? "day" : "days"}</span><strong>{formatRupees(rent)}</strong></div>
                <div><span>Refundable deposit</span><strong>{formatRupees(deposit)}</strong></div>
                <div className="total-sum"><span>Pay at handover</span><strong>{formatRupees(rent + deposit)}</strong></div>
              </div>
            )}
            <button type="button" className="btn btn-primary block" disabled={!days || isOwner || sending} onClick={requestBorrow}>
              {isOwner ? "This is your listing" : sending ? "Sending…" : "Request to Borrow"}
            </button>
            <p className="muted small">No online payment. Pay the owner directly (cash/UPI) at handover.</p>
            <button type="button" className="link-btn" onClick={() => setShowPolicy(true)}>View damage & deposit policy</button>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="sub-title">Reviews</h2>
        {canReview && (
          <form
            className="card review-form"
            onSubmit={async (event) => {
              event.preventDefault();
              if (reviewing) return;
              setReviewing(true);
              try {
                await addReview(item.id, { rating, comment });
                setComment("");
                showToast("Review posted.");
              } catch (error) {
                showToast(error.message, "error");
              } finally {
                setReviewing(false);
              }
            }}
          >
            <div className="chips" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={rating === value ? "chip active" : "chip"}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                >
                  {value}★
                </button>
              ))}
            </div>
            <label className="field">
              <span>How did the rental go?</span>
              <textarea rows={3} maxLength={300} value={comment} placeholder="Condition, handover, anything the next borrower should know." onChange={(event) => setComment(event.target.value)} />
            </label>
            <button type="submit" className="btn btn-primary btn-sm" disabled={reviewing || comment.trim().length < 10}>
              {reviewing ? "Posting…" : "Post review"}
            </button>
          </form>
        )}
        {itemReviews.length > 0 ? (
          <div className="reviews">
            {itemReviews.map((review) => (
              <article key={review.id} className="card review">
                <strong>{review.author}</strong>
                <span className="muted small">★ {review.rating} · {review.date}</span>
                <p>{review.comment}</p>
              </article>
            ))}
          </div>
        ) : (
          !canReview && (
            <div className="empty card">
              <h3>No reviews yet</h3>
              <p className="muted">A review can be left after the item is returned.</p>
            </div>
          )
        )}
      </div>

      {related.length > 0 && (
        <div className="section">
          <h2 className="sub-title">More in {category?.name}</h2>
          <div className="item-grid">
            {related.map((other) => <ItemCard key={other.id} item={other} />)}
          </div>
        </div>
      )}

      {showPolicy && <PolicyModal onClose={() => setShowPolicy(false)} />}
    </section>
  );
}
