
export const TechnologyStack = () => {
  const techStacks = [
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
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-surface/30 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
          Our Technology Stack
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStacks.map((stack, index) => (
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
  );
};
