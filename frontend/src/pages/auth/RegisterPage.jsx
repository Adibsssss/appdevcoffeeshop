import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined, general: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    else if (form.name.trim().length < 2) e.name = "Name too short.";
    if (!form.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "At least 6 characters required.";
    if (!form.confirm) e.confirm = "Please confirm your password.";
    else if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = register(form.name.trim(), form.email, form.password);
    setLoading(false);
    if (result.success) {
      addToast(`Account created! Welcome, ${result.user.name.split(" ")[0]}! 🎉`, "success");
      navigate("/menu");
    } else {
      setErrors({ general: result.error });
    }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^a-zA-Z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400", "bg-emerald-500"][strength];

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex">
      {/* Left decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#D4956A] to-[#8B4513] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-6xl animate-float"
              style={{
                left: `${(i * 43) % 90}%`,
                top: `${(i * 61) % 90}%`,
                animationDelay: `${(i * 0.4) % 3}s`,
                opacity: 0.15,
              }}
            >
              {["☕", "🌟", "🍪", "🥐", "✨"][i % 5]}
            </div>
          ))}
        </div>
        <div className="relative text-center px-12">
          <div className="text-8xl mb-6 animate-float" style={{ animationDelay: "0.5s" }}>🌟</div>
          <h2 className="font-display text-4xl text-white mb-4">Join the Family!</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Create your account and unlock exclusive deals, order history, and a personalized experience.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { icon: "🎁", label: "Exclusive Deals" },
              { icon: "📦", label: "Order History" },
              { icon: "⚡", label: "Fast Checkout" },
              { icon: "💌", label: "Special Offers" },
            ].map((perk) => (
              <div key={perk.label} className="bg-white/10 rounded-2xl p-3 text-white/80 text-sm font-medium flex items-center gap-2">
                <span>{perk.icon}</span>{perk.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-pop-in">
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">☕</span>
            <h1 className="font-accent text-3xl text-[#3C1810] mt-2">BrewHaven</h1>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-[#F5E6D3]">
            <h2 className="font-display text-3xl text-[#3C1810] mb-1">Create Account</h2>
            <p className="text-[#8B4513]/60 text-sm mb-7">Join BrewHaven for the full experience.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errors.general && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm font-medium animate-slide-up">
                  ⚠️ {errors.general}
                </div>
              )}

              <Input
                label="Full Name"
                type="text"
                placeholder="Your full name"
                icon="👤"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                error={errors.name}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon="✉️"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                error={errors.email}
              />

              <div>
                <Input
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="At least 6 characters"
                  icon="🔒"
                  iconRight={
                    <button type="button" onClick={() => setShowPass(!showPass)} className="cursor-pointer">
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  }
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  error={errors.password}
                />
                {form.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColor : "bg-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-[#8B4513]/60">{strengthLabel}</span>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type={showPass ? "text" : "password"}
                placeholder="Repeat your password"
                icon="🔐"
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
                error={errors.confirm}
              />

              <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
                Create Account ✨
              </Button>
            </form>

            <p className="text-center text-sm text-[#8B4513]/60 mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-[#D4956A] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
