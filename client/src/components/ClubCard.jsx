import { Link } from "react-router-dom";
import { useStore } from "../store";
import ItemImage from "./ItemImage";

export default function ClubCard({ club }) {
  const { items } = useStore();
  const clubItems = items.filter((item) => item.clubId === club.id);

  return (
    <Link to={`/clubs/${club.id}`} className="card cover-card">
      <div className="cover-thumb">
        <ItemImage src={clubItems[0]?.images[0]} alt={club.name} />
      </div>
      <div className="cover-body">
        <h3>{club.name}</h3>
        <p>{club.category}</p>
        <span className="count">{clubItems.length} {clubItems.length === 1 ? "item" : "items"}</span>
      </div>
    </Link>
  );
}
