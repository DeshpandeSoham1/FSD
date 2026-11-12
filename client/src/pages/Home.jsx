import { Link } from "react-router-dom";
import CategoryCard from "../components/CategoryCard";
import ClubCard from "../components/ClubCard";
import ItemCard from "../components/ItemCard";
import { DEPOSIT_SHARE, MAX_ITEM_VALUE, MIN_ITEM_VALUE, MIN_RENT, featuredIds, formatRupees } from "../data";
import { useStore } from "../store";

const steps = [
  { title: "List", text: "Upload real photos, set the original price and a daily rent from ₹50." },
  { title: "Search", text: "Browse by category or club, filter by price and availability." },
  { title: "Request", text: "Pick dates and send a request. Pay the owner in cash or UPI at handover." },
  { title: "Return", text: "Bring it back on time. The deposit comes back if nothing is damaged." },
];

export default function Home() {
  const { items, categories, clubs, getItem } = useStore();
  const featured = featuredIds.map(getItem).filter(Boolean);

  return (
    <>
      <section className="hero">
        <div className="hero-shade" aria-hidden="true" />
        <div className="container">
          <h1>
            Borrow what you need.
            <br />
            <em>Share what you have.</em>
          </h1>
          <p className="sub">
            Rent cameras, instruments, trek gear, and fest equipment from students and clubs on your campus. Meet on
            campus, pay the owner directly.
          </p>
          <div className="hero-actions">
            <Link to="/explore" className="btn btn-primary">Explore Items</Link>
            <Link to="/list" className="btn btn-ghost">List an Item</Link>
          </div>
          <div className="stats">
            <span><strong>{items.length}</strong> items</span>
            <span><strong>{categories.length}</strong> categories</span>
            <span><strong>{clubs.length}</strong> clubs</span>
            <span>from <strong>{formatRupees(MIN_RENT)}</strong>/day</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Browse by category</h2>
              <p>Things worth renting: costly to buy, needed only for a few days.</p>
            </div>
            <Link to="/categories" className="text-link">All categories</Link>
          </div>
          <div className="cover-grid">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Featured items</h2>
              <p>Popular picks from students and clubs this week.</p>
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
              <h2>Club gear</h2>
              <p>Clubs lend shared equipment to members and other students.</p>
            </div>
            <Link to="/clubs" className="text-link">View all</Link>
          </div>
          <div className="cover-grid">
            {clubs.slice(0, 4).map((club) => (
              <ClubCard key={club.id} club={club} />
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
              <strong>Worth renting</strong>
              <p>Items priced {formatRupees(MIN_ITEM_VALUE)}–{formatRupees(MAX_ITEM_VALUE)}. No personal-care items.</p>
            </div>
            <div>
              <strong>Refundable deposit</strong>
              <p>{DEPOSIT_SHARE * 100}% of the item's price, returned on safe return.</p>
            </div>
            <div>
              <strong>Campus-only</strong>
              <p>College email sign-up. Handover in person, cash or UPI.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
