
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-4 text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
              About DigitBooks
            </h1>
            <p className="text-secondary text-lg max-w-2xl mx-auto mb-16">
              Our mission and story
            </p>
          </div>

          <div className="prose prose-lg mx-auto">
            <p>
              DigitBooks was founded with a simple mission: to make bookkeeping accessible and 
              effortless for small businesses and freelancers.
            </p>
            <p>
              Our team of financial experts and software engineers have worked together to create
              an intelligent bookkeeping solution that saves you time and reduces errors.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
