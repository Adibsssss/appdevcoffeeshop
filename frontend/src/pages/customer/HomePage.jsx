import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../components/ui/Toast";
import { PRODUCTS } from "../../data/products";
import Layout from "../../components/layout/Layout";
import ProductCard from "../../components/menu/ProductCard";
import Button from "../../components/ui/Button";

const HERO_STATS = [
  { value: "50+", label: "Menu Items" },
  { value: "500+", label: "Happy Customers" },
  { value: "4.9★", label: "Rating" },
  { value: "15min", label: "Avg. Wait" },
];

const FEATURED_ITEMS = PRODUCTS.filter((p) => p.featured).slice(0, 4);

export default function HomePage() {
  const { user } = useAuth();
  const { setIsOpen } = useCart();

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#3C1810] text-white">
        {/* Background floaters */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["☕", "🌿", "🍫", "✨", "🥐", "🍵"].map((e, i) => (
            <div
              key={i}
              className="absolute text-6xl animate-float select-none"
              style={{
                left: `${[8, 20, 70, 85, 50, 30][i]}%`,
                top: `${[10, 65, 15, 55, 80, 35][i]}%`,
                animationDelay: `${i * 0.5}s`,
                opacity: 0.08,
              }}
            >
              {e}
            </div>
          ))}
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-12">
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-slide-up">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Now Open · Order Online
            </div>
            <h1 className="font-accent text-5xl md:text-7xl text-[#D4956A] mb-4 leading-tight animate-slide-up delay-100">
              BrewHaven
            </h1>
            <p className="font-display text-2xl md:text-3xl text-white mb-4 animate-slide-up delay-200">
              Your Cozy Coffee Corner
            </p>
            <p className="text-[#C4A882] text-lg mb-8 max-w-md animate-slide-up delay-300 leading-relaxed">
              From bold espressos to dreamy frappes — handcrafted drinks made
              with love, delivered to you fresh.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start animate-slide-up delay-400">
              <Link to="/menu">
                <Button size="xl" variant="primary">
                  Browse Menu
                </Button>
              </Link>
              {!user && (
                <Link to="/register">
                  <Button size="xl" variant="secondary">
                    Join Free
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Hero visual */}
          <div className="flex-shrink-0 animate-pop-in delay-200">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 rounded-full bg-[#D4956A]/20 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-[#D4956A]/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-9xl md:text-[10rem] animate-float">
                  ☕
                </span>
              </div>
              {/* Orbiting badges */}
              {[
                { e: "🥐", pos: "top-0 right-4", delay: "0s" },
                { e: "🍵", pos: "bottom-4 left-0", delay: "1s" },
                { e: "🍫", pos: "top-12 left-0", delay: "2s" },
              ].map(({ e, pos, delay }) => (
                <div
                  key={e}
                  className={`absolute ${pos} w-14 h-14 bg-white/90 rounded-2xl flex items-center justify-center text-2xl shadow-lg animate-float`}
                  style={{ animationDelay: delay }}
                >
                  {e}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative bg-[#D4956A]/20 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {HERO_STATS.map((s, i) => (
              <div
                key={s.label}
                className={`text-center animate-slide-up delay-${
                  (i + 1) * 100
                }`}
              >
                <div className="font-display text-3xl text-[#D4956A]">
                  {s.value}
                </div>
                <div className="text-[#C4A882] text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl text-[#3C1810]">
              Fan Favorites
            </h2>
            <p className="text-[#8B4513]/60 mt-1">
              Our most-loved picks by the community
            </p>
          </div>
          <Link to="/menu">
            <Button variant="secondary" size="sm">
              View All →
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_ITEMS.map((product, i) => (
            <div
              key={product.id}
              className={`animate-slide-up delay-${(i + 1) * 100}`}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#3C1810] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl text-center text-[#D4956A] mb-2">
            How It Works
          </h2>
          <p className="text-center text-[#C4A882] mb-12">
            Order your favorites in 3 easy steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                emoji: "🍽️",
                title: "Browse Menu",
                desc: "Explore our full menu of coffees, drinks, pastries, and snacks.",
              },
              {
                step: "02",
                emoji: "🛒",
                title: "Add to Cart",
                desc: "Select your items, customize quantities, and review your order.",
              },
              {
                step: "03",
                emoji: "✅",
                title: "Checkout & Enjoy",
                desc: "Place your order and pick it up fresh at the counter!",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`text-center animate-slide-up delay-${
                  (i + 1) * 200
                }`}
              >
                <div className="w-20 h-20 bg-[#D4956A]/20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">
                  {item.emoji}
                </div>
                <div className="font-display text-[#D4956A] text-sm mb-1">
                  Step {item.step}
                </div>
                <h3 className="font-display text-xl text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-[#C4A882] text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="bg-gradient-to-br from-[#D4956A] to-[#8B4513] py-16">
          <div className="max-w-2xl mx-auto text-center px-6">
            <h2 className="font-display text-4xl text-white mb-3">
              Ready to Order?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Create your free account and start enjoying BrewHaven's
              handcrafted drinks today!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register">
                <Button size="xl" variant="dark">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/menu">
                <Button size="xl" variant="secondary">
                  Browse Menu First
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
