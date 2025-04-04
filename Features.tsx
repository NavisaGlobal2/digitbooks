import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "Automated Bookkeeping",
      description: "Let AI categorize and reconcile your transactions, saving hours of manual work",
      benefits: [
        "Automatic transaction categorization",
        "Real-time bank reconciliation",
        "Smart receipt scanning",
        "Expense tracking",
      ],
    },
    {
      title: "Smart Compliance",
      description: "Stay compliant with AI-powered tax filing and regulatory updates",
      benefits: [
        "Automated tax calculations",
        "Regulatory deadline reminders",
        "Audit-ready reports",
        "Compliance checks",
      ],
    },
    {
      title: "Financial Insights",
      description: "Get actionable insights from your financial data with AI analysis",
      benefits: [
        "Cash flow forecasting",
        "Expense analysis",
        "Growth opportunities",
        "Budget optimization",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-white">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-4 text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
              Powerful Features
            </h1>
            <p className="text-secondary text-lg max-w-2xl mx-auto mb-16">
              Discover how our AI-powered features can transform your financial management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 rounded-2xl border border-border hover:border-accent transition-all duration-300 hover:shadow-lg bg-white/50 backdrop-blur-sm animate-fade-in hover:-translate-y-1"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-secondary mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-secondary">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Features;