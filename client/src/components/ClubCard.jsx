import { Link } from "react-router-dom";

export default function ClubCard({ club }) {
  return (
    <Link to={`/clubs/${club.id}`} className="card club-card">
      <span className="emoji" aria-hidden="true">{club.emoji}</span>
      <h3>{club.name}</h3>
      <p>{club.category}</p>
      <span className="count">{club.itemCount} items</span>
    </Link>
  );
}
