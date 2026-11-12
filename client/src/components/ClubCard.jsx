import { Link } from "react-router-dom";
import { clubLogo } from "../clubLogos";
import { useStore } from "../store";

export default function ClubCard({ club }) {
  const { items } = useStore();
  const clubItems = items.filter((item) => item.clubId === club.id);
  const logo = clubLogo(club.name);

  return (
    <Link to={`/clubs/${club.id}`} className="card cover-card">
      <div className="cover-thumb club-logo-frame">
        {logo ? <img src={logo} alt="" /> : null}
      </div>
      <div className="cover-body">
        <h3 className="club-title">
          {logo ? <img src={logo} alt="" className="club-inline" /> : null}
          {club.name}
        </h3>
        <p>{club.category}</p>
        <span className="count">{clubItems.length} {clubItems.length === 1 ? "item" : "items"}</span>
      </div>
    </Link>
  );
}
