
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Careers = () => {
  const availableJobs = [
    {
      title: "Frontend Developer",
      department: "Engineering",
      location: "Akure, Nigeria",
      type: "Full-time",
      description: "Proficient in ReactJS, JavaScript/TypeScript, Tailwind CSS. Develop responsive, interactive dashboards and implement user-friendly UI/UX designs.",
      experience: "3-5 years"
    },
    {
      title: "Backend Developer",
      department: "Engineering",
      location: "Akure, Nigeria",
      type: "Full-time",
      description: "Experienced in Node.js, Express.js, REST API Development. Secure integration with banking and payment gateways and ensure robust data encryption.",
      experience: "4-6 years (Fintech)"
    },
    {
      title: "Full Stack Developer",
      department: "Engineering",
      location: "Akure, Nigeria",
      type: "Full-time",
      description: "Competent in both ReactJS and Node.js. Integration of front-end elements with server-side logic and cross-layer troubleshooting.",
      experience: "3+ years"
    },
    {
      title: "AI Specialist",
      department: "AI Research",
      location: "Akure, Nigeria",
      type: "Full-time",
      description: "Expertise in machine learning and GPT API integration. Develop AI models for financial forecasting and anomaly detection.",
      experience: "2+ years"
    },
    {
      title: "QA Tester",
      department: "Quality Assurance",
      location: "Akure, Nigeria",
      type: "Full-time",
      description: "Conduct user testing and quality assurance. Write and execute test cases, identify and document bugs, ensuring fixes.",
      experience: "2+ years"
    },
    {
      title: "Senior Full-Stack Developer",
      department: "Engineering",
      location: "Remote (US/EU)",
      type: "Full-time",
      description: "Join our engineering team to build and scale our AI-powered bookkeeping platform.",
      experience: "5+ years"
    },
    {
      title: "AI/ML Engineer",
      department: "AI Research",
      location: "San Francisco, CA",
      type: "Full-time",
      description: "Help improve our transaction categorization algorithms and develop new AI features.",
      experience: "3+ years"
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Create intuitive and delightful experiences for our financial management platform.",
      experience: "3+ years"
    },
    {
      title: "Customer Success Manager",
      department: "Customer Experience",
      location: "New York, NY",
      type: "Full-time",
      description: "Help our customers get the most out of DigiBooks and ensure their success.",
      experience: "2+ years"
    },
    {
      title: "Marketing Specialist",
      department: "Marketing",
      location: "Remote",
      type: "Contract",
      description: "Drive growth and awareness for our AI-powered bookkeeping solution.",
      experience: "2+ years"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Header Section */}
        <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-24">
          <div className="mx-auto max-w-7xl text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary mb-6 sm:mb-8 animate-fade-in">
              Join Our Team
            </h1>
            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-secondary mb-8 sm:mb-10 animate-fade-in [animation-delay:200ms]">
              Help us revolutionize bookkeeping with AI and make financial management effortless for businesses everywhere.
            </p>
          </div>
        </section>

        {/* Technology Stack Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-surface/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
              Our Technology Stack
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  category: "Frontend",
                  technologies: "ReactJS, Tailwind CSS"
                },
                {
                  category: "Backend",
                  technologies: "Node.js, Express.js"
                },
                {
                  category: "Databases",
                  technologies: "PostgreSQL, MongoDB (Optional)"
                },
                {
                  category: "AI Integration",
                  technologies: "OpenAI GPT API"
                },
                {
                  category: "Cloud & Infrastructure",
                  technologies: "AWS/DigitalOcean, Cloudflare"
                },
                {
                  category: "Payment Gateways",
                  technologies: "Flutterwave/Paystack"
                },
                {
                  category: "Bank Integration",
                  technologies: "Mono/Okra"
                },
                {
                  category: "Security",
                  technologies: "AES-256 Encryption, MFA"
                }
              ].map((stack, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-border hover:border-accent transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <h3 className="text-lg font-semibold mb-2">{stack.category}</h3>
                  <p className="text-secondary">{stack.technologies}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Jobs Section */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold mb-10 bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
              Available Positions
            </h2>
            
            <div className="grid gap-6">
              {availableJobs.map((job, index) => (
                <div 
                  key={index}
                  className="group p-6 rounded-xl bg-white border border-border hover:border-accent transition-all duration-300 hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold">{job.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-primary">
                          {job.department}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                          {job.location}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {job.type}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {job.experience}
                        </span>
                      </div>
                      <p className="mt-3 text-secondary">{job.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button className="group">
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Culture Section */}
        <section className="py-16 sm:py-24 bg-surface/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
              Why Join DigiBooks?
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Innovation-First Culture",
                  description: "Work on cutting-edge AI technology that's transforming an entire industry.",
                  emoji: "💡"
                },
                {
                  title: "Remote-Friendly",
                  description: "Work from anywhere with our distributed team spanning multiple countries.",
                  emoji: "🌎"
                },
                {
                  title: "Growth Opportunities",
                  description: "Develop your skills and advance your career with our mentorship programs.",
                  emoji: "📈"
                },
                {
                  title: "Competitive Benefits",
                  description: "Enjoy comprehensive healthcare, 401(k) matching, and stock options.",
                  emoji: "🏆"
                },
                {
                  title: "Work-Life Balance",
                  description: "Flexible working hours and unlimited PTO to ensure you stay refreshed.",
                  emoji: "⚖️"
                },
                {
                  title: "Diverse & Inclusive",
                  description: "Join a team that values different perspectives and backgrounds.",
                  emoji: "🌈"
                }
              ].map((benefit, index) => (
                <div 
                  key={index} 
                  className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-border hover:border-accent transition-all duration-300 hover:shadow-lg animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-4xl mb-4">{benefit.emoji}</div>
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-secondary">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Careers;
