
interface Benefit {
  title: string;
  description: string;
  emoji: string;
}

export const CompanyBenefits = () => {
  const benefits: Benefit[] = [
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
  ];

  return (
    <section className="py-16 sm:py-24 bg-surface/50 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
          Why Join DigiBooks?
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
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
  );
};
