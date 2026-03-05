import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      addToast(`Welcome back, ${result.user.name.split(" ")[0]}! 👋`, "success");
      navigate(result.user.role === "admin" ? "/admin" : "/menu");
    } else {
      setErrors({ general: result.error });
    }
  };

  const fillDemo = (role) => {
    if (role === "admin") setForm({ email: "admin@brewhaven.com", password: "admin123" });
    else setForm({ email: "jane@email.com", password: "password123" });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex">
      {/* Left — decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#3C1810] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-5xl animate-float"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                animationDelay: `${(i * 0.3) % 3}s`,
                opacity: 0.3 + (i % 3) * 0.2,
              }}
            >
              {["☕", "🌿", "✨", "🍫", "🥐"][i % 5]}
            </div>
          ))}
        </div>
        <div className="relative text-center px-12">
          <div className="text-8xl mb-6 animate-float">☕</div>
          <h1 className="font-accent text-5xl text-[#D4956A] mb-4">BrewHaven</h1>
          <p className="text-[#C4A882] text-lg leading-relaxed">
            Your cozy corner for exceptional coffee and moments worth savoring.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {["☕ Espresso", "🧋 Cold Brew", "🥐 Pastries"].map((tag) => (
              <span key={tag} className="bg-white/10 text-[#C4A882] px-3 py-1.5 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-pop-in">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl">☕</span>
            <h1 className="font-accent text-3xl text-[#3C1810] mt-2">BrewHaven</h1>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-[#F5E6D3]">
            <h2 className="font-display text-3xl text-[#3C1810] mb-1">Welcome back!</h2>
            <p className="text-[#8B4513]/60 text-sm mb-7">Sign in to your account to continue.</p>

            {/* Demo hint */}
            <div className="bg-[#FFF8F0] border border-[#F5E6D3] rounded-2xl p-3 mb-6 text-xs text-[#8B4513]/70">
              <span className="font-bold">💡 Admin demo:</span> admin@brewhaven.com / admin123
              <br />
              <span className="font-bold">👤 Customer demo:</span> jane@email.com / password123
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {errors.general && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm font-medium animate-slide-up">
                  ⚠️ {errors.general}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon="✉️"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({}); }}
                error={errors.email}
              />

              <Input
                label="Password"
                type={showPass ? "text" : "password"}
                placeholder="Enter your password"
                icon="🔒"
                iconRight={
                  <button type="button" onClick={() => setShowPass(!showPass)} className="cursor-pointer">
                    {showPass ? "🙈" : "👁️"}
                  </button>
                }
                value={form.password}
                onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({}); }}
                error={errors.password}
              />

              <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
                Sign In ☕
              </Button>
            </form>

            <p className="text-center text-sm text-[#8B4513]/60 mt-5">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#D4956A] font-bold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
