
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Help = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-4 text-center animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
              How Can We Help?
            </h1>
            <p className="text-secondary text-lg max-w-2xl mx-auto mb-16">
              Get the support you need to make the most of DigitBooks. Our team is here to help you succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="group p-8 rounded-2xl border border-border hover:border-accent transition-all duration-300 hover:shadow-lg bg-white/50 backdrop-blur-sm animate-fade-in hover:-translate-y-1">
              <Mail className="w-8 h-8 mb-4 text-[#9b87f5] group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Email Support</h3>
              <p className="text-secondary mb-6">
                Send us an email and we'll get back to you within 24 hours with a detailed response.
              </p>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-[#9b87f5] group-hover:text-white transition-colors"
              >
                Email Us
              </Button>
            </div>

            <div className="group p-8 rounded-2xl border border-border hover:border-accent transition-all duration-300 hover:shadow-lg bg-white/50 backdrop-blur-sm animate-fade-in [animation-delay:200ms] hover:-translate-y-1">
              <MessageCircle className="w-8 h-8 mb-4 text-[#7E69AB] group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
              <p className="text-secondary mb-6">
                Chat with our support team in real-time during business hours for immediate assistance.
              </p>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-[#7E69AB] group-hover:text-white transition-colors"
              >
                Start Chat
              </Button>
            </div>

            <div className="group p-8 rounded-2xl border border-border hover:border-accent transition-all duration-300 hover:shadow-lg bg-white/50 backdrop-blur-sm animate-fade-in [animation-delay:400ms] hover:-translate-y-1">
              <Phone className="w-8 h-8 mb-4 text-[#6E59A5] group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
              <p className="text-secondary mb-6">
                Call us directly for immediate assistance with your questions and concerns.
              </p>
              <Button 
                variant="outline" 
                className="w-full group-hover:bg-[#6E59A5] group-hover:text-white transition-colors"
              >
                Call Now
              </Button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto animate-fade-in [animation-delay:600ms]">
            <h2 className="text-3xl font-semibold mb-8 text-center bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  question: "How do I get started with DigitBooks?",
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
                <div 
                  key={index} 
                  className="p-6 rounded-lg bg-white/50 backdrop-blur-sm border border-border hover:border-accent transition-all duration-300 hover:shadow-md"
                >
                  <h3 className="font-semibold mb-2 text-lg">{faq.question}</h3>
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
