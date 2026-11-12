import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useStore } from "../store";

const links = [
  { to: "/explore", label: "Explore" },
  { to: "/categories", label: "Categories" },
  { to: "/clubs", label: "Clubs" },
  { to: "/list", label: "List" },
];

export default function Navbar() {
  const { user, authReady, logout: onLogout } = useStore();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={close}>
          borrow<span>.box</span>
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
              onClick={close}
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/dashboard" onClick={close} className={({ isActive }) => (isActive ? "active" : undefined)}>
            Dashboard
          </NavLink>
          {authReady && user ? (
            <div className="nav-auth">
              <span className="nav-user">{user.name}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { close(); onLogout(); }}>
                Logout
              </button>
            </div>
          ) : authReady ? (
            <NavLink to="/login" onClick={close} className="btn btn-primary btn-sm nav-login">
              Login
            </NavLink>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
