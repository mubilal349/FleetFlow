"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { api } from "@/lib/api";
import { User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("fleetflow_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/api/auth/me");

        setUser(response.data.data.user);
      } catch {
        localStorage.removeItem("fleetflow_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data.data;

    localStorage.setItem("fleetflow_token", token);
    setUser(user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post("/api/auth/register", {
      name,
      email,
      password,
    });

    const { token, user } = response.data.data;

    localStorage.setItem("fleetflow_token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("fleetflow_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
