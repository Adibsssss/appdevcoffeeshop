import { createContext, useContext, useState, useEffect } from "react";
import { authAPI, setTokens, clearTokens, getTokens } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore user from sessionStorage if tokens exist
  useEffect(() => {
    const stored = sessionStorage.getItem("brewhaven_user");
    const { access } = getTokens();
    if (stored && access) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      setTokens(data.tokens.access, data.tokens.refresh);
      setUser(data.user);
      sessionStorage.setItem("brewhaven_user", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password, password2) => {
    try {
      const data = await authAPI.register(name, email, password, password2);
      setTokens(data.tokens.access, data.tokens.refresh);
      setUser(data.user);
      sessionStorage.setItem("brewhaven_user", JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      const { refresh } = getTokens();
      if (refresh) await authAPI.logout(refresh);
    } catch (_) {
      // ignore logout errors
    } finally {
      setUser(null);
      clearTokens();
    }
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
