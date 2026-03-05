import { useState, useMemo, useEffect } from "react";
import { productsAPI } from "../../utils/api";
import Layout from "../../components/layout/Layout";
import ProductCard from "../../components/menu/ProductCard";
import CategoryFilter from "../../components/menu/CategoryFilter";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.list();
        // API returns array directly or {results: [...]}
        setProducts(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = activeCategory === "all" || p.category === activeCategory;
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, activeCategory, search]);

  return (
    <Layout>
      {/* Header */}
      <div className="bg-[#3C1810] text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-display text-4xl text-[#D4956A] mb-2 animate-slide-up">
            🍽️ Our Menu
          </h1>
          <p className="text-[#C4A882] animate-slide-up delay-100">
            Handcrafted with love. Every sip, every bite.
          </p>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 bg-[#FFF8F0]/95 backdrop-blur-md border-b border-[#F5E6D3] py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-shrink-0 sm:w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4956A]">🔍</span>
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border-2 border-[#F5E6D3] focus:border-[#D4956A] rounded-2xl py-2.5 pl-9 pr-4 text-[#3C1810] font-medium placeholder:text-[#C4A882] focus:outline-none transition-all text-sm"
            />
          </div>
          {/* Categories */}
          <div className="flex-1 overflow-hidden">
            <CategoryFilter active={activeCategory} onChange={setActiveCategory} />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-float">☕</div>
            <p className="font-display text-xl text-[#3C1810]">Loading menu...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <p className="font-display text-xl text-[#3C1810] mb-2">Could not load menu</p>
            <p className="text-[#8B4513]/60 text-sm">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">🔍</div>
            <h3 className="font-display text-2xl text-[#3C1810] mb-2">No items found</h3>
            <p className="text-[#8B4513]/60">Try a different search or category.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#8B4513]/60 font-medium mb-5">
              Showing <span className="text-[#D4956A] font-bold">{filtered.length}</span> item{filtered.length !== 1 && "s"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((product, i) => (
                <div
                  key={product.id}
                  className="animate-pop-in"
                  style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s`, opacity: 0 }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
