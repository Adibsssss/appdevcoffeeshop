import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#3C1810] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">☕</span>
              <span className="text-2xl font-accent text-[#D4956A]">
                BrewHaven
              </span>
            </div>
            <p className="text-[#C4A882] text-sm leading-relaxed">
              Your cozy corner for exceptional coffee, handcrafted drinks, and
              moments worth savoring.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg mb-4 text-[#D4956A]">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-[#C4A882]">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  🏠 Home
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-white transition-colors">
                  🍽️ Menu
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-white transition-colors"
                >
                  🔑 Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-white transition-colors"
                >
                  ✨ Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display text-lg mb-4 text-[#D4956A]">
              Store Hours
            </h4>
            <ul className="space-y-1 text-sm text-[#C4A882]">
              <li className="flex justify-between">
                <span>Mon–Fri</span>
                <span>7:00 AM – 9:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span>8:00 AM – 10:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span>9:00 AM – 8:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center text-xs text-[#C4A882]">
          © {new Date().getFullYear()} BrewHaven. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
