import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Index = () => {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-primary mb-6 sm:mb-8 animate-fade-in">
              Smart Bookkeeping,
              <br />
              <span className="bg-gradient-to-r from-[#9EE755] to-[#CFDD3C] bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-secondary mb-8 sm:mb-10 animate-fade-in [animation-delay:200ms]">
              Save 10+ hours every week with automated bookkeeping. Perfect for small businesses, freelancers, and startups.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in [animation-delay:400ms]">
              <button className="group px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-all duration-300 transform hover:-translate-y-1">
                Try Free for 14 Days
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group px-8 py-4 glass rounded-full hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                Watch Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Hero Image with Animation */}
          <div className="relative mt-16 sm:mt-20 animate-fade-in [animation-delay:600ms]">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 pointer-events-none" />
            <div className="flex justify-center px-4">
              <img
                src="https://antimetal.com/images/hero/preview.png"
                alt="Digibooks Dashboard Preview"
                className="rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-[90%] h-auto hover:shadow-accent/20 transition-shadow duration-300"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32 bg-surface/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 sm:mb-20 bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
              How Digibooks Makes Your Life Easier
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
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
                  className="group p-8 rounded-2xl bg-white/50 backdrop-blur-sm border border-border hover:border-accent transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
                    {feature.title}
                  </h3>
                  <p className="text-secondary text-lg">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
              Common Questions
            </h2>
            <div className="space-y-6">
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
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <button
                    className="w-full px-8 py-6 text-left flex justify-between items-center bg-white/50 backdrop-blur-sm rounded-2xl border border-border hover:border-accent transition-all duration-300 hover:shadow-lg"
                    onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                  >
                    <span className="font-semibold text-lg">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        activeAccordion === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {activeAccordion === index && (
                    <div className="px-8 py-6 mt-2 bg-white/30 backdrop-blur-sm rounded-2xl border border-border">
                      <p className="text-secondary text-lg">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32 bg-primary text-white px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-8 sm:mb-10 animate-fade-in">
              Start saving time today
            </h2>
            <p className="text-white/80 mb-10 sm:mb-12 max-w-2xl mx-auto text-lg sm:text-xl animate-fade-in [animation-delay:200ms]">
              Join thousands of businesses saving 10+ hours every week with automated bookkeeping.
            </p>
            <button className="group px-8 py-4 bg-accent text-primary rounded-full font-semibold hover:bg-accent/90 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in [animation-delay:400ms]">
              Start Your Free Trial
              <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;