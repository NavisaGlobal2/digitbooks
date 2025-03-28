
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Help = () => {
  const faqs = [
    {
      question: "How do I get started with DigitBooks?",
      answer: "Sign up for a free account, connect your bank account or upload your transactions, and our AI will automatically categorize your expenses and provide insights."
    },
    {
      question: "Is my financial data secure?",
      answer: "Yes, we use bank-level encryption to protect your data. We never store your bank credentials and use secure API connections for all data transfers."
    },
    {
      question: "Can I export my financial reports?",
      answer: "Yes, you can export all reports in PDF, CSV, or Excel formats for sharing with your accountant or team members."
    },
    {
      question: "How accurate is the AI categorization?",
      answer: "Our AI achieves 99% accuracy after learning from your transaction patterns. You can always manually adjust any miscategorized transactions."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-4 text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
              Help Center
            </h1>
            <p className="text-secondary text-lg max-w-2xl mx-auto mb-16">
              Find answers to commonly asked questions
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              Can't find what you're looking for? Contact our support team at{" "}
              <a href="mailto:support@digitbooks.app" className="text-primary hover:underline">
                support@digitbooks.app
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Help;
