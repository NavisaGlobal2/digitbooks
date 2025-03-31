
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  onboardingCompleted?: boolean;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  verifyOtp?: (email: string, token: string) => Promise<any>;
  completeOnboarding: () => void;
  signInWithGoogle: () => Promise<void>;
}
