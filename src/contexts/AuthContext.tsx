
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

// Helper function to generate a valid UUID
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, 
        v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Retrieved user from localStorage:", parsedUser);
        // Make sure parsedUser has the onboardingCompleted property explicitly set
        if (parsedUser.onboardingCompleted === undefined) {
          parsedUser.onboardingCompleted = false;
        }
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const isAuthenticated = !!user;

  const login = async (email: string, password: string) => {
    // Mock login functionality with a proper UUID format
    const userUUID = generateUUID();
    console.log("Generated UUID for login:", userUUID);
    
    const loggedInUser = {
      id: userUUID,
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
    // Mock signup functionality with a proper UUID format
    const userUUID = generateUUID();
    console.log("Generated UUID for signup:", userUUID);
    
    const newUser = {
      id: userUUID,
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
      console.log("Completing onboarding, updated user:", updatedUser);
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
