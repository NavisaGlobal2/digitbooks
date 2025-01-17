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
              Revolutionize Your Business
              <br />
              <span className="bg-gradient-to-r from-[#9EE755] to-[#CFDD3C] bg-clip-text text-transparent">
                Finances with AI-Powered Simplicity
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-secondary mb-8">
              Digibooks leverages cutting-edge AI to automate bookkeeping, optimize compliance, and provide actionable insights tailored for SMEs, freelancers, and NGOs.
            </p>
            <div className="flex justify-center gap-4">
              <button className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">
                Start Free with AI-Powered Tools
              </button>
              <button className="px-6 py-3 glass rounded-full hover:bg-white/20 transition-colors flex items-center gap-2">
                See How It Works <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative mt-16">
            <div className="flex justify-center">
              <img
                src="https://antimetal.com/images/hero/preview.png"
                alt="Hero"
                className="rounded-3xl shadow-2xl max-w-[90%] w-auto h-auto"
              />
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold text-center mb-16">What Can Digibooks AI Do for You?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Automated Bookkeeping",
                  description: "Let AI categorize and reconcile your transactions, saving hours of manual work",
                  icon: "⚡",
                },
                {
                  title: "Smart Compliance Tracking",
                  description: "Stay on top of tax filings and regulatory deadlines with AI-powered reminders",
                  icon: "🔒",
                },
                {
                  title: "Actionable Insights",
                  description: "AI analyzes your financial data to detect anomalies and forecast cash flow",
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
            <h2 className="text-3xl font-bold text-center mb-16">Common Questions About Our AI Solution</h2>
            <div className="space-y-4">
              {[
                {
                  question: "How does the AI automate bookkeeping?",
                  answer: "Our AI automatically categorizes transactions, reconciles accounts, and learns from your corrections to improve accuracy over time.",
                },
                {
                  question: "Is my financial data secure?",
                  answer: "We use bank-level encryption and advanced AI security protocols to protect your sensitive information.",
                },
                {
                  question: "What kind of insights does the AI provide?",
                  answer: "Our AI analyzes spending patterns, predicts cash flow, and provides actionable recommendations for business growth.",
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
            <h2 className="text-3xl sm:text-5xl font-bold mb-8">Ready to transform your business finances?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using Digibooks AI to streamline their financial operations.
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