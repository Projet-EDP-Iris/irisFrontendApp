import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useLocation } from "wouter";
import { apiFetch } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { clearSignupDraft } from "@/lib/signupDraft";
import { notifySignupSuccess } from "@/lib/desktopNotifications";

interface User {
  id: number;
  email: string;
  name?: string | null;
  profile_icon?: string | null;
  role: string;
  has_subscription: boolean;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isIrisActive: boolean;
  setIsIrisActive: (active: boolean) => void;
  emailCount: number;
  setEmailCount: (n: number) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: { email: string; password: string; name: string; profile_icon: string }) => Promise<void>;
  updateProfile: (payload: { name?: string; email?: string; profile_icon?: string }) => Promise<void>;
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
  const [emailCount, setEmailCount] = useState(0);

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
      .catch((error: Error & { status?: number }) => {
        if (error.status === 401 || error.status === 403) {
          localStorage.removeItem("iris_token");
          setToken(null);
          setUser(null);
          return;
        }

        setToken(stored);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<{ access_token: string }>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
    });
    localStorage.setItem("iris_token", data.access_token);
    setToken(data.access_token);
    const me = await apiFetch<User>("/users/me");
    setUser(me);
    navigate("/home");
  };

  const signup = async (payload: { email: string; password: string; name: string; profile_icon: string }) => {
    await apiFetch<User>("/users/", {
      method: "POST",
      body: JSON.stringify({
        email: payload.email.trim(),
        password: payload.password,
        name: payload.name.trim(),
        profile_icon: payload.profile_icon,
      }),
    });
    await login(payload.email, payload.password);
    clearSignupDraft();
    await notifySignupSuccess({ userName: payload.name });
  };

  const updateProfile = async (payload: { name?: string; email?: string; profile_icon?: string }) => {
    if (!user) return;
    const updated = await apiFetch<User>(`/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    setUser(updated);
  };

  const logout = () => {
    localStorage.removeItem("iris_token");
    localStorage.removeItem("iris_active");
    localStorage.removeItem("gmail_enabled");
    queryClient.clear();
    setToken(null);
    setUser(null);
    setIsIrisActiveState(false);
    navigate("/goodbye");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isIrisActive, setIsIrisActive, emailCount, setEmailCount, login, signup, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
