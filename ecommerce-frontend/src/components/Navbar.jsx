import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/cart", label: "Cart", badge: 2 },
  { to: "/checkout", label: "Checkout" },
  { to: "/login", label: "Login" },
  { to: "/vendor", label: "Vendor Dashboard" },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      {/* Top Bar for small links (Optional, like Daraz) */}
      <div className="bg-[#f5f5f5] text-xs py-1 px-10 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-end space-x-6 text-gray-600">
          <Link to="/vendor" className="hover:text-[#f85606]">
            Vendor Dashboard
          </Link>
          <Link to="/login" className="hover:text-[#f85606]">
            Login
          </Link>
          <Link to="/signup" className="hover:text-[#f85606]">
            Sign Up
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center py-4 px-6 md:px-10 gap-4">
        {/* Brand */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link
            to="/"
            className="text-3xl font-extrabold text-[#f85606] tracking-tighter"
          >
            SHOP<span className="text-gray-900">ORA</span>
          </Link>
          {/* Mobile Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden focus:outline-none p-2 rounded hover:bg-gray-100 transition"
          >
            <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-6 h-0.5 bg-gray-600"></div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-grow w-full max-w-2xl flex">
          <input
            type="text"
            placeholder="Search in Shopora"
            className="w-full bg-[#eff0f5] px-4 py-2 rounded-l-md outline-none focus:ring-1 focus:ring-[#f85606]"
          />
          <button className="bg-[#f85606] text-white px-6 py-2 rounded-r-md hover:bg-[#d04a05] transition font-bold">
            SEARCH
          </button>
        </div>

        {/* Action Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/cart"
            className="relative text-gray-700 hover:text-[#f85606] flex items-center gap-1 transition"
          >
            <span className="text-2xl">🛒</span>
            <span className="font-medium">Cart</span>
            <span className="absolute -top-2 -right-4 bg-[#f85606] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              2
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 flex flex-col space-y-4 px-6 py-4 shadow-lg">
          {NAV_LINKS.map(({ to, label, badge }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`relative font-medium transition-colors hover:text-[#f85606] ${
                location.pathname === to ? "text-[#f85606]" : "text-gray-700"
              }`}
            >
              {label}
              {badge && (
                <span className="ml-2 bg-[#f85606] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
