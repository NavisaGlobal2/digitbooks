import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for trying out Digibooks",
      features: [
        "Basic AI bookkeeping",
        "Up to 100 transactions/month",
        "Email support",
        "Basic reporting",
      ],
    },
    {
      name: "Professional",
      price: "$29",
      description: "Ideal for growing businesses",
      features: [
        "Advanced AI bookkeeping",
        "Unlimited transactions",
        "Priority support",
        "Advanced reporting",
        "Tax filing assistance",
        "Custom integrations",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Full AI automation suite",
        "Dedicated account manager",
        "24/7 premium support",
        "Custom AI models",
        "API access",
        "Advanced security",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-4 text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h1>
            <p className="text-secondary text-lg max-w-2xl mx-auto mb-16">
              Choose the plan that best fits your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className="group p-8 rounded-2xl border border-border hover:border-accent transition-all duration-300 hover:shadow-lg bg-white/50 backdrop-blur-sm animate-fade-in hover:-translate-y-1"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-secondary">/month</span>}
                </div>
                <p className="text-secondary mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent" />
                      <span className="text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full group-hover:bg-accent group-hover:text-primary transition-colors"
                  variant="outline"
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;