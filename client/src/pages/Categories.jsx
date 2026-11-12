import CategoryCard from "../components/CategoryCard";
import { MAX_ITEM_VALUE, MIN_ITEM_VALUE, allowedExamples, blockedExamples, formatRupees } from "../data";
import { useStore } from "../store";

export default function Categories() {
  const { categories } = useStore();
  return (
    <section className="container page">
      <div className="page-head">
        <h1>Categories</h1>
        <p className="muted">
          Only things worth renting: priced {formatRupees(MIN_ITEM_VALUE)}–{formatRupees(MAX_ITEM_VALUE)}, needed for a
          few days, and safe to share.
        </p>
      </div>
      <div className="cover-grid">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
      <RulesPanel />
    </section>
  );
}

export function RulesPanel() {
  return (
    <div className="rules">
      <div className="card rules-col">
        <h3>What you can list</h3>
        <ul className="check-list">
          {allowedExamples.map((entry) => <li key={entry}>{entry}</li>)}
        </ul>
      </div>
      <div className="card rules-col">
        <h3>What you can't list</h3>
        <ul className="cross-list">
          {blockedExamples.map((entry) => (
            <li key={entry.what}>
              <strong>{entry.what}</strong>
              <span>{entry.why}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
