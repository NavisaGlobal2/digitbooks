import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Index = () => {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-primary mb-6">
              Smart Bookkeeping,
              <br />
              <span className="bg-gradient-to-r from-[#9EE755] to-[#CFDD3C] bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-secondary mb-8">
              Save 10+ hours every week with automated bookkeeping. Perfect for small businesses, freelancers, and startups.
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">
                Try Free for 14 Days
              </button>
              <button className="px-6 py-3 glass rounded-full hover:bg-white/20 transition-colors flex items-center gap-2">
                Watch Demo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative mt-16">
            <div className="flex justify-center">
              <img
                src="https://antimetal.com/images/hero/preview.png"
                alt="Digibooks Dashboard Preview"
                className="rounded-3xl shadow-2xl max-w-[90%] w-auto h-auto"
              />
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-16">How Digibooks Makes Your Life Easier</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Auto-Categorize Expenses",
                  description: "Our AI learns your spending patterns and categorizes transactions with 99% accuracy",
                  icon: "⚡",
                },
                {
                  title: "Never Miss a Deadline",
                  description: "Smart alerts for tax deadlines and compliance requirements, tailored to your business",
                  icon: "🔒",
                },
                {
                  title: "Real-time Insights",
                  description: "Know exactly how your business is performing with instant financial reports and forecasts",
                  icon: "💡",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-background border border-border hover:border-accent transition-colors"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-16">Common Questions</h2>
            <div className="space-y-4">
              {[
                {
                  question: "How accurate is the AI categorization?",
                  answer: "Our AI achieves 99% accuracy after learning from just one month of your transactions. You can always adjust any miscategorized items with one click.",
                },
                {
                  question: "Is my data secure?",
                  answer: "We use bank-level encryption and never store your credentials. Your data is protected by the same security measures used by leading financial institutions.",
                },
                {
                  question: "Can I export my data?",
                  answer: "Yes! Export your data anytime in multiple formats including Excel, CSV, and PDF. Perfect for sharing with your accountant or team.",
                },
              ].map((faq, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-background/50"
                    onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  >
                    <span className="font-medium">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        activeAccordion === index ? "transform rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeAccordion === index && (
                    <div className="px-6 py-4 bg-background/50">
                      <p className="text-secondary">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-white px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-8">Start saving time today</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses saving 10+ hours every week with automated bookkeeping.
            </p>
            <button className="px-8 py-4 bg-accent text-primary rounded-full font-semibold hover:bg-accent/90 transition-colors">
              Start Your Free Trial
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;