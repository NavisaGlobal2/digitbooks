import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff, CheckCircle2, Shield, Zap, BarChart2, Brain, Lock } from "lucide-react";

type AuthMode = 'login' | 'signup';

const Auth = () => {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login'); // Default to login mode
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  const features = [
    {
      title: "Smart Automation",
      description: "Our AI handles your bookkeeping while you focus on growing your business.",
      icon: <Brain className="w-12 h-12 mb-6 animate-pulse" />,
      benefits: [
        { text: "Automated categorization", icon: <CheckCircle2 className="w-4 h-4" /> },
        { text: "Smart receipt scanning", icon: <Zap className="w-4 h-4" /> },
        { text: "Real-time insights", icon: <BarChart2 className="w-4 h-4" /> },
        { text: "Bank-level security", icon: <Shield className="w-4 h-4" /> }
      ]
    },
    {
      title: "Powerful Analytics",
      description: "Make data-driven decisions with our advanced analytics and reporting.",
      icon: <BarChart2 className="w-12 h-12 mb-6 animate-bounce" />,
      benefits: [
        { text: "Custom dashboards", icon: <CheckCircle2 className="w-4 h-4" /> },
        { text: "Trend analysis", icon: <BarChart2 className="w-4 h-4" /> },
        { text: "Predictive insights", icon: <Brain className="w-4 h-4" /> },
        { text: "Export reports", icon: <Zap className="w-4 h-4" /> }
      ]
    },
    {
      title: "Bank-Grade Security",
      description: "Your financial data is protected with enterprise-level security.",
      icon: <Lock className="w-12 h-12 mb-6 animate-pulse" />,
      benefits: [
        { text: "256-bit encryption", icon: <Shield className="w-4 h-4" /> },
        { text: "Two-factor auth", icon: <Lock className="w-4 h-4" /> },
        { text: "Regular backups", icon: <CheckCircle2 className="w-4 h-4" /> },
        { text: "Audit logging", icon: <BarChart2 className="w-4 h-4" /> }
      ]
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        await signup(email, password);
      } else {
        await login(email, password);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Left side - Auth form */}
      <div className="flex flex-col p-8 bg-gradient-to-b from-white to-gray-50">
        <div className="flex items-center gap-2 mb-16">
          <Logo className="h-8 w-8" />
          <span className="text-2xl font-semibold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            DigiBooks
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-muted-foreground">
                {mode === 'signup' ? 'Get started with DigiBooks' : 'Sign in to continue to your account'}
              </p>
            </div>

            <div className="mb-8">
              <Button 
                variant="outline" 
                className="w-full h-12 relative hover:bg-gray-50 transition-all duration-300"
                disabled={isLoading}
              >
                <img 
                  src="https://www.google.com/favicon.ico" 
                  alt="Google" 
                  className="w-5 h-5 absolute left-4"
                />
                Continue with Google
              </Button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gradient-to-b from-white to-gray-50 px-2 text-muted-foreground">
                  or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your work or personal email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 transition-all duration-300 focus:ring-2 focus:ring-green-500/20"
                />
              </div>

              <div className="relative space-y-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === 'signup' ? "Create password" : "Enter password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 transition-all duration-300 focus:ring-2 focus:ring-green-500/20"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {mode === 'signup' && (
                <div className="relative space-y-2">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12 transition-all duration-300 focus:ring-2 focus:ring-green-500/20"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : 'Sign in')}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-green-500 hover:text-green-600 font-medium transition-colors"
                    disabled={isLoading}
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-green-500 hover:text-green-600 font-medium transition-colors"
                    disabled={isLoading}
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Marketing content */}
      <div className="bg-gradient-to-br from-green-500 via-green-400 to-green-600 p-8 flex items-center justify-center overflow-hidden relative">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-64 h-64 rounded-full bg-white/10 -top-32 -right-32 animate-pulse" />
          <div className="absolute w-96 h-96 rounded-full bg-white/5 -bottom-48 -left-48 animate-pulse [animation-delay:1s]" />
        </div>

        <div className="relative max-w-md">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                index === currentFeatureIndex
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-95 absolute"
              }`}
              style={{
                transform: index === currentFeatureIndex ? "none" : "translateY(100%)",
                position: index === currentFeatureIndex ? "relative" : "absolute"
              }}
            >
              <div className="text-center mb-8">
                {feature.icon}
                <h2 className="text-3xl font-bold mb-4 text-white animate-fade-in">
                  {feature.title}
                </h2>
                <p className="text-lg text-white/90 mb-8 animate-fade-in [animation-delay:200ms]">
                  {feature.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {feature.benefits.map((benefit, benefitIndex) => (
                  <div 
                    key={benefitIndex} 
                    className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm animate-fade-in hover:bg-white/20 transition-colors duration-300"
                    style={{ animationDelay: `${(benefitIndex + 3) * 200}ms` }}
                  >
                    {benefit.icon}
                    <span className="text-white/90">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Feature navigation dots */}
          <div className="flex justify-center gap-3 mt-12">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentFeatureIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentFeatureIndex
                    ? "bg-white scale-125"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;