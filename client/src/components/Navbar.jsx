import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/explore", label: "Explore" },
  { to: "/clubs", label: "Clubs" },
  { to: "/dashboard", label: "Dashboard" },
];

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={close}>
          BORROW<span>BOX</span>
        </Link>
        <button
          type="button"
          className="burger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "✕" : "☰"}
        </button>
        <nav className={open ? "nav-links open" : "nav-links"}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={close}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <div className="nav-auth">
              <span className="nav-user">{user.name}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { close(); onLogout(); }}>
                Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" onClick={close} className="btn btn-primary btn-sm nav-login">
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
