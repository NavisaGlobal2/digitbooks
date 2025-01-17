import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-center mb-4">
            About Digibooks
          </h1>
          <p className="text-secondary text-center max-w-2xl mx-auto mb-16">
            Transforming financial management with AI innovation
          </p>

          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-secondary mb-8">
                At Digibooks, we're on a mission to revolutionize how businesses handle their finances. 
                By leveraging cutting-edge AI technology, we're making financial management more 
                accessible, efficient, and insightful for businesses of all sizes.
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
              <p className="text-secondary">
                We envision a future where every business, regardless of size, has access to 
                enterprise-grade financial tools and insights. Through AI innovation, we're 
                making this vision a reality, one business at a time.
              </p>
            </div>

            <div className="bg-surface p-8 rounded-2xl border border-border">
              <h2 className="text-2xl font-semibold mb-6">Why Choose Digibooks?</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">AI-Powered Innovation</h3>
                  <p className="text-secondary">
                    Our advanced AI technology automates complex financial tasks and provides 
                    actionable insights for better decision-making.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Customer-First Approach</h3>
                  <p className="text-secondary">
                    We're committed to providing exceptional support and continuously improving 
                    our platform based on customer feedback.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Security & Compliance</h3>
                  <p className="text-secondary">
                    Your financial data's security is our top priority. We maintain the highest 
                    standards of security and regulatory compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;