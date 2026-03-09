import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-[#F5E6D3] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl group-hover:animate-wiggle inline-block transition-transform">
            ☕
          </span>
          <span className="text-xl font-accent text-[#3C1810] group-hover:text-[#D4956A] transition-colors">
            BrewHaven
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/menu"
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
              isActive("/menu")
                ? "bg-[#F5E6D3] text-[#8B4513]"
                : "text-[#3C1810] hover:bg-[#FFF8F0]"
            }`}
          >
            Menu
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                location.pathname.startsWith("/admin")
                  ? "bg-[#F5E6D3] text-[#8B4513]"
                  : "text-[#3C1810] hover:bg-[#FFF8F0]"
              }`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Cart button — all logged-in users */}
          {user && (
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 rounded-2xl bg-[#F5E6D3] hover:bg-[#D4956A] hover:text-white text-[#8B4513] transition-all group"
            >
              <span className="text-lg">🛒</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4956A] group-hover:bg-white group-hover:text-[#D4956A] text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce-in transition-colors">
                  {totalItems}
                </span>
              )}
            </button>
          )}

          {/* User */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 bg-[#F5E6D3] px-3 py-2 rounded-2xl">
                <span className="text-lg">{user.role === "admin"}</span>
                <span className="text-sm font-semibold text-[#3C1810]">
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-2xl bg-red-50 hover:bg-red-100 text-red-500 text-sm font-semibold transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-2xl bg-[#D4956A] hover:bg-[#C07A50] text-white font-bold text-sm transition-all shadow-sm"
            >
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-[#8B4513] hover:bg-[#F5E6D3]"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#F5E6D3] px-4 py-3 flex flex-col gap-1 animate-slide-up">
          <Link
            to="/menu"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-3 rounded-xl font-semibold text-[#3C1810] hover:bg-[#F5E6D3]"
          >
            Menu
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="px-4 py-3 rounded-xl font-semibold text-[#3C1810] hover:bg-[#F5E6D3]"
            >
              Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
