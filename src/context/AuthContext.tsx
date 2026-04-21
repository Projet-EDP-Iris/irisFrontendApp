import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useLocation } from "wouter";
import { apiFetch } from "@/lib/api";

interface User {
  id: number;
  email: string;
  role: string;
  has_subscription: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isIrisActive: boolean;
  setIsIrisActive: (active: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isIrisActive, setIsIrisActiveState] = useState<boolean>(
    localStorage.getItem("iris_active") === "true"
  );
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("iris_token")
  );
  const [isLoading, setIsLoading] = useState(true);

  const setIsIrisActive = (active: boolean) => {
    setIsIrisActiveState(active);
    localStorage.setItem("iris_active", active.toString());
  };

  // On mount, validate existing token
  useEffect(() => {
    const stored = localStorage.getItem("iris_token");
    if (!stored) {
      setIsLoading(false);
      return;
    }
    apiFetch<User>("/users/me")
      .then((u) => {
        setUser(u);
        setToken(stored);
      })
      .catch(() => {
        localStorage.removeItem("iris_token");
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ access_token: string }>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("iris_token", data.access_token);
    setToken(data.access_token);
    const me = await apiFetch<User>("/users/me");
    setUser(me);
    navigate("/home");
  };

  const logout = () => {
    localStorage.removeItem("iris_token");
    localStorage.removeItem("iris_active");
    setToken(null);
    setUser(null);
    setIsIrisActiveState(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isIrisActive, setIsIrisActive, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
