
export interface User {
  id: string;
  email: string | null;
  name: string;
  avatar: string;
  onboardingCompleted: boolean;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  completeOnboarding: (user: User | null) => Promise<User | null>;
  verifyOtp: (email: string, token: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
}
