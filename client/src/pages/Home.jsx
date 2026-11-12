import { Link } from "react-router-dom";
import RisingItems, { FeatureItem } from "../components/RisingItems";
import CategoryCard from "../components/CategoryCard";
import ClubCard from "../components/ClubCard";
import ItemCard from "../components/ItemCard";
import { DEPOSIT_SHARE, MAX_ITEM_VALUE, MIN_ITEM_VALUE, MIN_RENT, formatRupees } from "../data";
import { useStore } from "../store";

const steps = [
  { word: "List", text: "Upload real photos, set the original price, and a daily rent from ₹50." },
  { word: "Request", text: "Pick dates and send a request. Pay the owner in cash or UPI at handover." },
  { word: "Return", text: "Bring it back on time. The deposit comes back if nothing is damaged." },
];

export default function Home() {
  const { items, categories, clubs } = useStore();
  const featured = [...items].sort((a, b) => b.id - a.id).slice(0, 8);

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-stage">
            <div className="hero-copy">
              <h1>
                Borrow <em>gear</em> — or
                <br />
                share what you own, if it just
                <br />
                <span>sits unused.</span>
              </h1>
              <div className="hero-actions">
                <Link to="/explore" className="btn btn-primary">Explore items</Link>
                <Link to="/list" className="btn btn-ghost">List an item</Link>
              </div>
              <div className="stats">
                <span><strong>{categories.length}</strong> categories</span>
                <span><strong>{clubs.length}</strong> clubs</span>
                <span>from <strong>{formatRupees(MIN_RENT)}</strong>/day</span>
              </div>
            </div>
            <RisingItems />
          </div>
        </div>
      </section>

      <div className="pixel-band" aria-hidden="true" />

      <section className="section words-section">
        <div className="container">
          <p className="eyebrow">Three steps. No delivery.</p>
          <div className="word-stack">
            {steps.map((step, index) => (
              <article key={step.word} className="word-row">
                <h2>
                  {step.word}
                  {index === 1 ? <em>*</em> : null}
                </h2>
                <div className="word-card">
                  <span>0{index + 1}</span>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="repeat">
        <div className="container repeat-inner">
          <h2>List. Rent. Return. Repeat.</h2>
          <FeatureItem />
          <p>The objects rising through the page are the things students actually lend: a camera, a guitar, a pack, a speaker, a tent, a bike.</p>
        </div>
      </section>

      <div className="pixel-band" aria-hidden="true" />

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>Browse by category</h2>
              <p>Costly to buy. Needed for a few days.</p>
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
              <h2>Latest listings</h2>
              <p>Newest items posted by students and clubs.</p>
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
              <p>Shared equipment from campus clubs.</p>
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

      <section className="section plans-wrap">
        <div className="container">
          <div className="section-head">
            <div>
              <h2>What it costs</h2>
              <p>Two numbers. No checkout.</p>
            </div>
          </div>
          <div className="plans">
            <article className="plan">
              <span>Daily rent</span>
              <strong>from {formatRupees(MIN_RENT)}</strong>
              <p>Set by the owner, up to a tenth of the item’s price. Paid in cash or UPI when you meet.</p>
            </article>
            <article className="plan plan-hot">
              <span>Refundable deposit</span>
              <strong>{DEPOSIT_SHARE * 100}%</strong>
              <p>Of the item’s price, between {formatRupees(MIN_ITEM_VALUE)} and {formatRupees(MAX_ITEM_VALUE)}. Returned if nothing is damaged.</p>
              <Link to="/explore" className="btn btn-light">Explore items</Link>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
