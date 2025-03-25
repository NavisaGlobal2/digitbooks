
import React, { useState, useEffect } from "react";
import { CheckCircle2, Shield, Zap, BarChart2, Brain, Lock } from "lucide-react";

interface Benefit {
  text: string;
  icon: React.ReactNode;
}

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: Benefit[];
}

const FeatureDisplay: React.FC = () => {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);

  const features: Feature[] = [
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

  return (
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
  );
};

export default FeatureDisplay;
