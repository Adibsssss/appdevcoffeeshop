import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const MOCK_USERS = [
  { id: "u001", name: "Admin User", email: "admin@brewhaven.com", password: "admin123", role: "admin" },
  { id: "u002", name: "Jane Doe", email: "jane@email.com", password: "password123", role: "customer" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("brewhaven_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      sessionStorage.setItem("brewhaven_user", JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }
    return { success: false, error: "Invalid email or password." };
  };

  const register = (name, email, password) => {
    const exists = MOCK_USERS.find((u) => u.email === email);
    if (exists) return { success: false, error: "Email already registered." };
    const newUser = {
      id: `u${Date.now()}`,
      name,
      email,
      password,
      role: "customer",
    };
    MOCK_USERS.push(newUser);
    const { password: _, ...safeUser } = newUser;
    setUser(safeUser);
    sessionStorage.setItem("brewhaven_user", JSON.stringify(safeUser));
    return { success: true, user: safeUser };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("brewhaven_user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
