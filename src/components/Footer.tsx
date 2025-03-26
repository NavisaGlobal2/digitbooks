
import { Link } from "react-router-dom";

const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: ["Features", "Pricing", "Security", "Updates"],
    },
    {
      title: "Company",
      links: ["About", "Blog", "Careers", "Press"],
    },
    {
      title: "Resources",
      links: ["Documentation", "Help Center", "Contact", "Status"],
    },
    {
      title: "Legal",
      links: ["Privacy", "Terms", "Security", "Cookies"],
    },
  ];

  return (
    <footer className="bg-primary text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link
                      to={`/${link.toLowerCase()}`}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/70 text-sm">
            © 2024 DigitBooks. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="#" className="text-white/70 hover:text-white transition-colors">
              Twitter
            </Link>
            <Link to="#" className="text-white/70 hover:text-white transition-colors">
              LinkedIn
            </Link>
            <Link to="#" className="text-white/70 hover:text-white transition-colors">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
