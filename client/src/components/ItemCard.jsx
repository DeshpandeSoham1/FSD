import { Link } from "react-router-dom";
import { formatPrice, getClub } from "../data";

export default function ItemCard({ item }) {
  const club = getClub(item.clubId);

  return (
    <Link to={`/items/${item.id}`} className="card item-card">
      <span className="emoji" aria-hidden="true">{item.emoji}</span>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <span className="club-line">{club?.name}</span>
      <div className="item-meta">
        <strong>{formatPrice(item.pricePerDay)}</strong>
        <span className={item.available ? "badge badge-ok" : "badge badge-muted"}>
          {item.available ? "Available" : "Unavailable"}
        </span>
      </div>
    </Link>
  );
}
