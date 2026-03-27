import { createContext, useState } from "react";
import { login as apiLogin } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading] = useState(false);

  const login = async (credentials) => {
    const response = await apiLogin(credentials);
    if (!response?.user || !response?.token) {
      throw new Error("Invalid login response");
    }

    setUser(response.user);
    setToken(response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    localStorage.setItem("token", response.token);

    return response.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, setToken, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
