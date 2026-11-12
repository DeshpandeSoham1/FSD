import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Link to="/" className="logo">
            borrow<span>.box</span>
          </Link>
          <p>Borrow what you need. Share what you have.</p>
        </div>
        <div className="footer-links">
          <Link to="/explore">Explore</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/clubs">Clubs</Link>
          <Link to="/list">List an Item</Link>
        </div>
        <p className="muted">Campus-only · Pay the owner at handover · Item photos from Wikimedia Commons</p>
      </div>
    </footer>
  );
}
