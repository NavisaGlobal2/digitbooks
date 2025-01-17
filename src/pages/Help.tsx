import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Help = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-center mb-4">
            How Can We Help?
          </h1>
          <p className="text-secondary text-center max-w-2xl mx-auto mb-16">
            Get the support you need to make the most of Digibooks
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 rounded-2xl border border-border hover:border-accent transition-colors">
              <Mail className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Email Support</h3>
              <p className="text-secondary mb-4">
                Send us an email and we'll get back to you within 24 hours
              </p>
              <Button variant="outline" className="w-full">
                Email Us
              </Button>
            </div>

            <div className="p-6 rounded-2xl border border-border hover:border-accent transition-colors">
              <MessageCircle className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
              <p className="text-secondary mb-4">
                Chat with our support team in real-time during business hours
              </p>
              <Button variant="outline" className="w-full">
                Start Chat
              </Button>
            </div>

            <div className="p-6 rounded-2xl border border-border hover:border-accent transition-colors">
              <Phone className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
              <p className="text-secondary mb-4">
                Call us directly for immediate assistance with your questions
              </p>
              <Button variant="outline" className="w-full">
                Call Now
              </Button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  question: "How do I get started with Digibooks?",
                  answer: "Sign up for a free account, connect your business accounts, and our AI will start organizing your finances automatically.",
                },
                {
                  question: "Is my financial data secure?",
                  answer: "Yes, we use bank-level encryption and security measures to protect your sensitive information.",
                },
                {
                  question: "Can I export my financial reports?",
                  answer: "Yes, you can export your reports in various formats including PDF, Excel, and CSV.",
                },
              ].map((faq, index) => (
                <div key={index} className="p-6 rounded-lg bg-surface border border-border">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-secondary">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Help;