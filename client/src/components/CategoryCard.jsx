import { Link } from "react-router-dom";
import { useStore } from "../store";
import ItemImage from "./ItemImage";

export default function CategoryCard({ category }) {
  const { items } = useStore();
  const count = items.filter((item) => item.categoryId === category.id).length;

  return (
    <Link to={`/explore?category=${category.id}`} className="card cover-card">
      <div className="cover-thumb">
        <ItemImage src={category.cover} alt={category.name} />
      </div>
      <div className="cover-body">
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        <span className="count">{count} {count === 1 ? "item" : "items"}</span>
      </div>
    </Link>
  );
}
