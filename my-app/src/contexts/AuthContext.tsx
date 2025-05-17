"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import api from "@/utils/api";

type UserInfo = {
  username: string;
  first_name: string;
  last_name: string;
};

type Token = {
  access_token: string;
  token_type: string;
};

type RegisterData = {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
};

type AuthContextType = {
  user: UserInfo | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<boolean>;  // Added
  logout: () => void;
  error: string | null;                                // Added
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get<UserInfo>("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, []);

  const login = async (username: string, password: string) => {
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const res = await api.post<Token>("/auth/token", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = res.data.access_token;
      localStorage.setItem("token", token);

      const userRes = await api.get<UserInfo>("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(userRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed.");
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setError(null);
    try {
      await api.post("/auth/", data);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
