import { Link } from "react-router-dom";
import ClubCard from "../components/ClubCard";
import ItemCard from "../components/ItemCard";
import { clubs, featuredIds, items } from "../data";

const steps = [
  { title: "List", text: "Put up a cheap item with a daily price and a small deposit." },
  { title: "Search", text: "Filter by club, price, and availability to find what you need." },
  { title: "Request", text: "Send a request, then pay the owner in cash or UPI at handover." },
  { title: "Return", text: "Bring it back on time. The deposit comes back if nothing is damaged." },
];

export default function Home() {
  const featured = featuredIds.map((id) => items.find((item) => item.id === id)).filter(Boolean);

  return (
    <>
      <section className="hero">
        <div className="hero-shade" aria-hidden="true" />
        <div className="container">
          <p className="eyebrow">Campus borrowing</p>
          <h1>
            Borrow what you need.
            <br />
            <em>Share what you have.</em>
          </h1>
          <p className="sub">
            Student clubs list calculators, cables, lights, and costumes. Pick a date, meet on campus, and pay the owner directly.
          </p>
          <div className="hero-actions">
            <Link to="/explore" className="btn btn-primary">Explore Items</Link>
            <Link to="/clubs" className="btn btn-ghost">Browse Clubs</Link>
          </div>
          <div className="stats">
            <span><strong>{items.length}</strong> items</span>
            <span><strong>{clubs.length}</strong> clubs</span>
            <span><strong>₹0–60</strong>/day</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Clubs</h2>
              <p>Gear is organised by the club that looks after it.</p>
            </div>
            <Link to="/clubs" className="text-link">View all</Link>
          </div>
          <div className="club-grid">
            {clubs.map((club) => (
              <ClubCard key={club.id} club={club} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Featured items</h2>
              <p>Free and low daily rates from student clubs.</p>
            </div>
            <Link to="/explore" className="text-link">Explore</Link>
          </div>
          <div className="item-grid">
            {featured.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>How it works</h2>
              <p>Four steps. No checkout, no delivery.</p>
            </div>
          </div>
          <div className="steps">
            {steps.map((step, index) => (
              <article key={step.title} className="card step">
                <span className="step-num">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section trust-wrap">
        <div className="container">
          <div className="trust">
            <div>
              <strong>Everyday campus gear</strong>
              <p>Calculators, cables, lights, and costumes.</p>
            </div>
            <div>
              <strong>Small refundable deposit</strong>
              <p>Value or ₹300, whichever is lower.</p>
            </div>
            <div>
              <strong>Campus-only</strong>
              <p>Handover in person. Cash or UPI.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
