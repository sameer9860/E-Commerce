import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700&display=swap');

  .navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #0a0a0a;
    border-bottom: 1px solid #222;
    font-family: 'DM Mono', monospace;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
  }

  .navbar-brand {
    font-family: 'Syne', sans-serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #f5f0e8;
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  .navbar-brand span {
    color: #e8c547;
  }

  .navbar-links {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .navbar-links a {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.85rem;
    border-radius: 6px;
    color: #888;
    text-decoration: none;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: color 0.15s, background 0.15s;
    position: relative;
  }

  .navbar-links a:hover {
    color: #f5f0e8;
    background: #1a1a1a;
  }

  .navbar-links a.active {
    color: #e8c547;
    background: rgba(232, 197, 71, 0.08);
  }

  .cart-badge {
    background: #e8c547;
    color: #0a0a0a;
    font-size: 0.6rem;
    font-weight: 700;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-login {
    padding: 0.4rem 1rem;
    border-radius: 6px;
    border: 1px solid #333;
    background: transparent;
    color: #f5f0e8;
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    text-decoration: none;
    transition: border-color 0.15s, background 0.15s;
  }

  .btn-login:hover {
    border-color: #e8c547;
    color: #e8c547;
  }

  .hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
  }

  .hamburger span {
    display: block;
    width: 22px;
    height: 1.5px;
    background: #888;
    transition: 0.2s;
  }

  @media (max-width: 640px) {
    .navbar-links { display: none; }
    .hamburger { display: flex; }
    .navbar-links.open {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 60px;
      left: 0; right: 0;
      background: #0a0a0a;
      border-bottom: 1px solid #222;
      padding: 0.75rem 1rem;
      gap: 0.25rem;
    }
  }
`;

const NAV_LINKS = [
  { to: "/", label: "Home", icon: "⌂" },
  { to: "/products", label: "Products", icon: "◈" },
  { to: "/cart", label: "Cart", icon: "◻", badge: 2 },
  { to: "/checkout", label: "Checkout", icon: "→" },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{navStyles}</style>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          shop<span>.</span>
        </Link>

        <ul className={`navbar-links${open ? " open" : ""}`}>
          {NAV_LINKS.map(({ to, label, icon, badge }) => (
            <li key={to}>
              <Link
                to={to}
                className={location.pathname === to ? "active" : ""}
                onClick={() => setOpen(false)}
              >
                <span>{icon}</span>
                {label}
                {badge ? <span className="cart-badge">{badge}</span> : null}
              </Link>
            </li>
          ))}
        </ul>

        <div className="navbar-right">
          <Link to="/login" className="btn-login">
            Login
          </Link>
          <button className="hamburger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>
    </>
  );
}