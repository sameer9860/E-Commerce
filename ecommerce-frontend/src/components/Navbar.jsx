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
    <nav className="fixed top-0 left-0 w-full bg-[#f85606] shadow-md z-50">
      {/* Top Bar for small links */}
      <div className="text-[10px] py-1 px-10 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-end space-x-6 text-white uppercase font-medium">
          <span className="hover:underline cursor-pointer">
            Save More on App
          </span>
          <Link to="/vendor" className="hover:underline">
            Vendor Dashboard
          </Link>
          <span className="hover:underline cursor-pointer">Help & Support</span>
          <Link to="/login" className="hover:underline">
            Login
          </Link>
          <Link to="/signup" className="hover:underline">
            Sign Up
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center pb-4 pt-1 px-6 md:px-10 gap-6">
        {/* Brand */}
        <div className="flex justify-between items-center w-full md:w-auto">
          <Link
            to="/"
            className="text-4xl font-black text-white tracking-tighter italic"
          >
            SHOPORA
          </Link>
          {/* Mobile Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden focus:outline-none p-2 rounded hover:bg-[#d04a05] transition"
          >
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white mb-1"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex-grow w-full max-w-2xl flex relative">
          <input
            type="text"
            placeholder="Search in Shopora"
            className="w-full bg-white px-4 py-2.5 rounded-md outline-none text-gray-800 placeholder-gray-400 text-sm"
          />
          <button className="absolute right-0 top-0 bottom-0 bg-[#ffe1d2] text-[#f85606] px-5 rounded-r-md hover:bg-[#ffd1bc] transition flex items-center justify-center">
            <span className="text-xl">🔍</span>
          </button>
        </div>

        {/* Action Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/cart"
            className="relative text-white hover:opacity-80 flex items-center transition"
          >
            <span className="text-3xl">🛒</span>
            <span className="absolute -top-1 -right-3 bg-white text-[#f85606] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-[#f85606]">
              2
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#f85606] border-t border-[#d04a05] flex flex-col space-y-4 px-6 py-4 shadow-lg text-white">
          {NAV_LINKS.map(({ to, label, badge }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`relative font-medium transition-colors hover:opacity-80 ${
                location.pathname === to ? "underline font-bold" : ""
              }`}
            >
              {label}
              {badge && (
                <span className="ml-2 bg-white text-[#f85606] text-xs font-bold px-2 py-0.5 rounded-full">
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
