import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import API from "../api";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMe(null);
      return;
    }
    API.get("me/")
      .then((res) => setMe(res.data))
      .catch(() => setMe(null));
  }, [location.pathname]);

  const navLinks = useMemo(() => {
    const base = [
      { to: "/", label: "Home" },
      { to: "/products", label: "Products" },
    ];

    if (!me) {
      return [
        ...base,
        { to: "/login", label: "Customer Login" },
        { to: "/vendor-login", label: "Vendor Login" },
        { to: "/register", label: "Sign Up" },
      ];
    }

    if (me.is_staff || me.is_superuser) {
      return [...base, { to: "/admin-dashboard", label: "Admin Dashboard" }];
    }
    if (me.role === "vendor") {
      return [...base, { to: "/vendor", label: "Vendor Dashboard" }];
    }
    // customers
    return [
      ...base,
      { to: "/cart", label: "Cart" },
      { to: "/customer", label: "My Dashboard" },
    ];
  }, [me]);

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#0a4692] shadow-md z-50">
      {/* Top Bar for small links */}
      <div className="text-[13px] py-1 px-10 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-end space-x-6 text-white uppercase font-medium">
          <span className="hover:underline cursor-pointer">
            Save More on App
          </span>
          <span className="hover:underline cursor-pointer">Help & Support</span>
          {!me && (
            <>
              <Link to="/login" className="hover:underline">
                Customer Login
              </Link>
              <Link to="/vendor-login" className="hover:underline">
                Vendor Login
              </Link>
              <Link to="/register" className="hover:underline">
                Sign Up
              </Link>
            </>
          )}
          {me?.role === "customer" && (
            <Link to="/customer" className="hover:underline">
              My Dashboard
            </Link>
          )}
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
          {me?.role === "customer" && (
            <Link
              to="/cart"
              className="relative text-white hover:opacity-80 flex items-center transition"
            >
              <span className="text-3xl">🛒</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#f85606] border-t border-[#d04a05] flex flex-col space-y-4 px-6 py-4 shadow-lg text-white">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`relative font-medium transition-colors hover:opacity-80 ${
                location.pathname === to ? "underline font-bold" : ""
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
