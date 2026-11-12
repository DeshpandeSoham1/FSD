import { Link, useParams } from "react-router-dom";
import ClubCard from "../components/ClubCard";
import ItemCard from "../components/ItemCard";
import { clubLogo } from "../clubLogos";
import { useStore } from "../store";

export default function Clubs() {
  const { clubs } = useStore();
  return (
    <section className="container page">
      <div className="page-head">
        <h1>Club gear</h1>
        <p className="muted">Shared equipment that clubs lend to members and other students on campus.</p>
      </div>
      <div className="cover-grid">
        {clubs.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>
    </section>
  );
}

export function ClubDetail() {
  const { id } = useParams();
  const { items, clubs } = useStore();
  const club = clubs.find((entry) => entry.id === Number(id));

  if (!club) {
    return (
      <section className="container page empty-page">
        <h1>Club not found</h1>
        <Link to="/clubs" className="btn btn-primary">All clubs</Link>
      </section>
    );
  }

  const clubItems = items.filter((item) => item.clubId === club.id);

  return (
    <section className="container page">
      <nav className="crumbs">
        <Link to="/clubs">Clubs</Link>
        <span>/</span>
        <span>{club.name}</span>
      </nav>
      <div className="page-head club-head">
        {clubLogo(club.name) ? <img src={clubLogo(club.name)} alt="" className="club-mark" /> : null}
        <div>
          <p className="eyebrow">{club.category}</p>
          <h1>{club.name}</h1>
          <p className="muted">{club.description}</p>
        </div>
      </div>
      {clubItems.length ? (
        <div className="item-grid">
          {clubItems.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="empty card">
          <h3>No gear listed yet</h3>
          <p className="muted">Club coordinators can list shared equipment from the List an Item page.</p>
        </div>
      )}
    </section>
  );
}
