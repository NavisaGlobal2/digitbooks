
import { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>({
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatar: ""
  });

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    // Mock login functionality
    setUser({
      id: "1",
      name: "John Doe",
      email,
      avatar: ""
    });
  };

  const logout = () => {
    setUser(null);
  };

  const signup = async (email: string, password: string, name: string) => {
    // Mock signup functionality
    setUser({
      id: "1",
      name,
      email,
      avatar: ""
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, signup }}
    >
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
