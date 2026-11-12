import { Link } from "react-router-dom";
import { formatPrice, formatRupees, getCategory, getClub, ownerLabel } from "../data";
import { clubLogo } from "../clubLogos";
import ItemImage from "./ItemImage";

export default function ItemCard({ item }) {
  const category = getCategory(item.categoryId);
  const club = item.clubId ? getClub(item.clubId) : null;
  const logo = clubLogo(club?.name);

  return (
    <Link to={`/items/${item.id}`} className="card item-card">
      <div className="item-thumb">
        <ItemImage src={item.images[0]} alt={item.title} />
        <span className={item.available ? "badge badge-ok thumb-badge" : "badge badge-muted thumb-badge"}>
          {item.available ? "Available" : "Booked"}
        </span>
      </div>
      <div className="item-body">
        <span className="club-line">{category?.name}</span>
        <h3>{item.title}</h3>
        <p>
          {logo ? <img src={logo} alt="" className="club-inline" /> : null}
          {ownerLabel(item)} · {item.location}
        </p>
        <div className="item-meta">
          <strong>{formatPrice(item.pricePerDay)}</strong>
          <span className="muted small">Worth {formatRupees(item.originalPrice)}</span>
        </div>
      </div>
    </Link>
  );
}
