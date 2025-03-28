
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "AI-Powered Bookkeeping",
      description: "Our intelligent system learns your business patterns to automatically categorize expenses and create accurate financial reports."
    },
    {
      title: "Invoice Management",
      description: "Create, send and track professional invoices. Get paid faster with automatic payment reminders and multiple payment methods."
    },
    {
      title: "Real-Time Financial Insights",
      description: "Access dashboards with key metrics like cash flow, revenue trends, and profit margins to make informed decisions."
    },
    {
      title: "Expense Tracking",
      description: "Capture receipts with your phone, import bank statements, and automatically categorize expenses for tax time."
    },
    {
      title: "Tax-Ready Reports",
      description: "Generate financial reports that are ready for tax filing, saving you hours of work at tax season."
    },
    {
      title: "Bank Reconciliation",
      description: "Automatically match your transactions with bank statements to ensure your books are always accurate."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-4 text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
              Features
            </h1>
            <p className="text-secondary text-lg max-w-2xl mx-auto mb-16">
              Everything you need to manage your business finances
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl border border-border hover:border-accent transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Check className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
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
