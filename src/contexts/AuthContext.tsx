
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface User {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  onboardingCompleted?: boolean;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    // Mock login functionality
    const loggedInUser = {
      id: "1",
      name: "John Doe",
      email,
      avatar: "",
      onboardingCompleted: false // Default to false for new logins
    };
    
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const signup = async (email: string, password: string, name: string) => {
    // Mock signup functionality
    const newUser = {
      id: "1",
      name,
      email,
      avatar: "",
      onboardingCompleted: false
    };
    
    setUser(newUser);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  const completeOnboarding = () => {
    if (user) {
      const updatedUser = { 
        ...user, 
        onboardingCompleted: true 
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, signup, completeOnboarding }}
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
