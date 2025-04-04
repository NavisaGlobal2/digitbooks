
export interface User {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  onboardingCompleted?: boolean;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, password: string, name: string) => Promise<void>;
  completeOnboarding: () => void;
  verifyOtp: (email: string, token: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}
