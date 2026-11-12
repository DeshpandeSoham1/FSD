import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import { MIN_RENT, formatRupees } from "../data";
import { useStore } from "../store";

const sorters = {
  recent: () => 0,
  "price-asc": (a, b) => a.pricePerDay - b.pricePerDay,
  "price-desc": (a, b) => b.pricePerDay - a.pricePerDay,
  rating: (a, b) => (b.ownerRating ?? 0) - (a.ownerRating ?? 0),
};

export default function Explore() {
  const { items, categories, clubs } = useStore();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all";
  const owner = params.get("owner") || "all";
  const highestRent = items.length ? Math.max(...items.map((item) => item.pricePerDay)) : MIN_RENT;
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(highestRent);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sort, setSort] = useState("recent");

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    return items
      .filter((item) => category === "all" || item.categoryId === category)
      .filter((item) => {
        if (owner === "all") return true;
        if (owner === "students") return !item.clubId;
        if (owner === "clubs") return Boolean(item.clubId);
        return item.clubId === Number(owner);
      })
      .filter((item) => item.pricePerDay <= maxPrice)
      .filter((item) => !availableOnly || item.available)
      .filter((item) => !text || `${item.title} ${item.description}`.toLowerCase().includes(text))
      .sort(sorters[sort]);
  }, [items, category, owner, maxPrice, availableOnly, query, sort]);

  function reset() {
    setQuery("");
    setMaxPrice(highestRent);
    setAvailableOnly(false);
    setSort("recent");
    setParams({}, { replace: true });
  }

  return (
    <section className="container page">
      <div className="page-head">
        <h1>Explore items</h1>
        <p className="muted">{results.length} of {items.length} items</p>
      </div>

      <div className="chips" role="tablist" aria-label="Categories">
        <button type="button" className={category === "all" ? "chip active" : "chip"} onClick={() => setParam("category", "all")}>
          All
        </button>
        {categories.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={category === entry.id ? "chip active" : "chip"}
            onClick={() => setParam("category", entry.id)}
          >
            {entry.name}
          </button>
        ))}
      </div>

      <div className="filters card">
        <label className="field grow">
          <span>Search</span>
          <input type="search" placeholder="Tent, guitar, projector…" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label className="field">
          <span>Listed by</span>
          <select value={owner} onChange={(event) => setParam("owner", event.target.value)}>
            <option value="all">Everyone</option>
            <option value="students">Students</option>
            <option value="clubs">All clubs</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>{club.name}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Sort</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="recent">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Owner rating</option>
          </select>
        </label>
        <label className="field range">
          <span>Max rent: {formatRupees(maxPrice)}/day</span>
          <input
            type="range"
            min={MIN_RENT}
            max={highestRent}
            step={10}
            value={maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
          />
        </label>
        <label className="toggle">
          <input type="checkbox" checked={availableOnly} onChange={(event) => setAvailableOnly(event.target.checked)} />
          <span>Available only</span>
        </label>
      </div>

      {results.length ? (
        <div className="item-grid">
          {results.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="empty card">
          <h3>No items found</h3>
          <p className="muted">Try another category or raise the price limit.</p>
          <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>Clear filters</button>
        </div>
      )}
    </section>
  );
}
