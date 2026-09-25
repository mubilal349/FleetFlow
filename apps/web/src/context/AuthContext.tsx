"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { api } from "@/lib/api";

type UserRole = "admin" | "manager" | "driver" | "customer";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface BackendUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeUser = (backendUser: BackendUser): User => {
  const id = backendUser.id ?? backendUser._id;

  if (!id) {
    throw new Error("Authenticated user ID is missing.");
  }

  return {
    id: String(id),
    name: backendUser.name,
    email: backendUser.email,
    role: backendUser.role,
  };
};

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

        const backendUser = response.data.data.user;

        const normalizedUser = normalizeUser(backendUser);

        console.log("RESTORED AUTH USER:", normalizedUser);

        setUser(normalizedUser);
      } catch (error) {
        console.error("FAILED TO RESTORE SESSION:", error);

        localStorage.removeItem("fleetflow_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async ({ email, password }: LoginData): Promise<void> => {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });

    const { token, user: backendUser } = response.data.data;

    const normalizedUser = normalizeUser(backendUser);

    console.log("LOGIN AUTH USER:", normalizedUser);

    localStorage.setItem("fleetflow_token", token);

    setUser(normalizedUser);
  };

  const register = async ({
    name,
    email,
    password,
  }: RegisterData): Promise<void> => {
    const response = await api.post("/api/auth/register", {
      name,
      email,
      password,
    });

    const { token, user: backendUser } = response.data.data;

    const normalizedUser = normalizeUser(backendUser);

    console.log("REGISTER AUTH USER:", normalizedUser);

    localStorage.setItem("fleetflow_token", token);

    setUser(normalizedUser);
  };

  const logout = (): void => {
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
