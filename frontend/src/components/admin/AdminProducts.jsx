import { useState, useEffect } from "react";
import { productsAPI } from "../../utils/api";
import { CATEGORIES } from "../../data/products";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Badge from "../ui/Badge";
import { useToast } from "../ui/Toast";

const EMPTY_PRODUCT = {
  name: "",
  category: "espresso",
  price: "",
  description: "",
  emoji: "☕",
  badge: "",
  available: true,
  featured: false,
};

const PAGE_SIZE = 8;

export default function AdminProducts() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState({
    open: false,
    mode: "add",
    product: null,
  });
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.list({ available: "" });
      setProducts(Array.isArray(data) ? data : data.results || []);
    } catch {
      addToast("Failed to load products.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Reset to page 1 whenever filter/search changes
  useEffect(() => {
    setPage(1);
  }, [search, filterCat]);

  const filtered = products.filter((p) => {
    const matchCat = filterCat === "all" || p.category === filterCat;
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const openAdd = () => {
    setForm(EMPTY_PRODUCT);
    setErrors({});
    setModal({ open: true, mode: "add", product: null });
  };

  const openEdit = (product) => {
    setForm({
      ...product,
      price: product.price.toString(),
      badge: product.badge || "",
    });
    setErrors({});
    setModal({ open: true, mode: "edit", product });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = "Enter a valid price.";
    if (!form.description.trim()) e.description = "Description is required.";
    return e;
  };

  const handleSave = async () => {
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      badge: form.badge || null,
    };
    try {
      if (modal.mode === "add") {
        await productsAPI.create(payload);
        addToast(`${form.emoji} ${form.name} added!`, "success");
      } else {
        await productsAPI.update(modal.product.id, payload);
        addToast(`${form.emoji} ${form.name} updated!`, "success");
      }
      setModal({ open: false, mode: "add", product: null });
      load();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    try {
      await productsAPI.delete(product.id);
      addToast(`${product.emoji} ${product.name} deleted.`, "error");
      setDeleteConfirm(null);
      load();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const toggleAvailable = async (product) => {
    try {
      await productsAPI.toggle(product.id);
      load();
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  if (loading)
    return (
      <div className="text-center py-16">
        <div className="text-5xl animate-float mb-4">☕</div>
        <p className="font-display text-xl text-[#3C1810]">
          Loading products...
        </p>
      </div>
    );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4956A]">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-[#F5E6D3] focus:border-[#D4956A] rounded-2xl py-2.5 pl-9 pr-4 text-sm font-medium placeholder:text-[#C4A882] focus:outline-none"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="bg-white border-2 border-[#F5E6D3] focus:border-[#D4956A] rounded-2xl px-4 py-2.5 text-sm font-medium text-[#3C1810] focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
        <Button onClick={openAdd} icon="➕">
          Add Product
        </Button>
      </div>

      {/* Count */}
      <p className="text-sm text-[#8B4513]/60 mb-4">
        Showing{" "}
        <span className="font-bold text-[#D4956A]">
          {Math.min((safePage - 1) * PAGE_SIZE + 1, filtered.length)}–
          {Math.min(safePage * PAGE_SIZE, filtered.length)}
        </span>{" "}
        of <span className="font-bold text-[#D4956A]">{filtered.length}</span>{" "}
        products
      </p>

      {/* Table */}
      <div className="bg-white rounded-3xl border-2 border-[#F5E6D3] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FFF8F0] text-left text-xs font-bold text-[#8B4513] uppercase tracking-wider">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3 hidden md:table-cell">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3 hidden sm:table-cell">Badge</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-[#F5E6D3] hover:bg-[#FFF8F0] transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#3C1810] text-sm">
                      {product.name}
                    </p>
                    <p className="text-[#8B4513]/50 text-xs hidden lg:block truncate max-w-[200px]">
                      {product.description}
                    </p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="capitalize text-sm text-[#8B4513] bg-[#F5E6D3] px-2 py-1 rounded-full font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-[#D4956A]">
                    ₱{product.price}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    {product.badge ? (
                      <Badge type={product.badge} />
                    ) : (
                      <span className="text-[#8B4513]/30 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleAvailable(product)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        product.available
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                    >
                      {product.available ? "● Available" : "○ Hidden"}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm transition-all"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product)}
                        className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 text-sm transition-all"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-[#8B4513]/50">
            <div className="text-4xl mb-2">🔍</div>
            <p>No products found</p>
          </div>
        ) : (
          /* ── Pagination ── */
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#F5E6D3] bg-[#FFF8F0]">
            <p className="text-xs text-[#8B4513]/60">
              Page <span className="font-bold text-[#3C1810]">{safePage}</span>{" "}
              of <span className="font-bold text-[#3C1810]">{totalPages}</span>
            </p>

            <div className="flex items-center gap-1">
              {/* First */}
              <PagBtn
                onClick={() => setPage(1)}
                disabled={safePage === 1}
                title="First"
              >
                «
              </PagBtn>
              {/* Prev */}
              <PagBtn
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                title="Previous"
              >
                ‹
              </PagBtn>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (n) =>
                    n === 1 || n === totalPages || Math.abs(n - safePage) <= 1
                )
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
                  acc.push(n);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-[#8B4513]/40 text-sm"
                    >
                      …
                    </span>
                  ) : (
                    <PagBtn
                      key={item}
                      onClick={() => setPage(item)}
                      active={item === safePage}
                    >
                      {item}
                    </PagBtn>
                  )
                )}

              {/* Next */}
              <PagBtn
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                title="Next"
              >
                ›
              </PagBtn>
              {/* Last */}
              <PagBtn
                onClick={() => setPage(totalPages)}
                disabled={safePage === totalPages}
                title="Last"
              >
                »
              </PagBtn>
            </div>
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        title={modal.mode === "add" ? "➕ Add New Product" : "✏️ Edit Product"}
        size="lg"
      >
        <div className="space-y-4">
          {/* No emoji picker — products will use image URLs */}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Product Name"
              placeholder="e.g. Caramel Latte"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
            />
            <Input
              label="Price (₱)"
              type="number"
              placeholder="e.g. 175"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              error={errors.price}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-[#3C1810] block mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-white border-2 border-[#F5E6D3] focus:border-[#D4956A] rounded-2xl px-4 py-3 text-sm font-medium text-[#3C1810] focus:outline-none"
              >
                {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-[#3C1810] block mb-1.5">
                Badge (optional)
              </label>
              <select
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full bg-white border-2 border-[#F5E6D3] focus:border-[#D4956A] rounded-2xl px-4 py-3 text-sm font-medium text-[#3C1810] focus:outline-none"
              >
                <option value="">— None —</option>
                <option value="bestseller">⭐ Bestseller</option>
                <option value="new">🆕 New</option>
                <option value="popular">🔥 Popular</option>
                <option value="seasonal">🍂 Seasonal</option>
                <option value="healthy">🌿 Healthy</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-[#3C1810] block mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Short product description..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className={`w-full bg-white border-2 rounded-2xl px-4 py-3 text-sm text-[#3C1810] font-medium placeholder:text-[#C4A882] focus:outline-none resize-none transition-all ${
                errors.description
                  ? "border-red-400"
                  : "border-[#F5E6D3] focus:border-[#D4956A]"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {errors.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setForm({ ...form, available: !form.available })}
              className={`w-12 h-6 rounded-full transition-all relative ${
                form.available ? "bg-green-400" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                  form.available ? "left-6" : "left-0.5"
                }`}
              />
            </button>
            <span className="text-sm font-semibold text-[#3C1810]">
              {form.available ? "Available on menu" : "Hidden from menu"}
            </span>
          </div>

          {/* Confirm buttons — always visible at bottom of scroll */}
          <div className="flex gap-3 pt-2 border-t border-[#F5E6D3] mt-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setModal({ ...modal, open: false })}
            >
              Cancel
            </Button>
            <Button fullWidth onClick={handleSave} loading={saving}>
              {modal.mode === "add" ? "Add Product" : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="🗑️ Delete Product?"
        size="sm"
      >
        {deleteConfirm && (
          <div className="text-center">
            <div className="text-5xl mb-4">{deleteConfirm.emoji}</div>
            <p className="font-semibold text-[#3C1810] mb-1">
              {deleteConfirm.name}
            </p>
            <p className="text-[#8B4513]/60 text-sm mb-6">
              This action cannot be undone. The product will be permanently
              removed.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Pagination button ── */
function PagBtn({ children, onClick, disabled, active, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-semibold transition-all ${
        active
          ? "bg-[#D4956A] text-white shadow-sm"
          : disabled
          ? "text-[#8B4513]/25 cursor-not-allowed"
          : "text-[#8B4513] hover:bg-[#F5E6D3]"
      }`}
    >
      {children}
    </button>
  );
}
