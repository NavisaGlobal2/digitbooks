
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { CareerHero } from "@/components/careers/CareerHero";
import { TechnologyStack } from "@/components/careers/TechnologyStack";
import { AvailableJobs } from "@/components/careers/AvailableJobs";
import { CompanyBenefits } from "@/components/careers/CompanyBenefits";

const Careers = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      <Navigation />
      
      <main className="pt-16">
        <CareerHero />
        <TechnologyStack />
        <AvailableJobs />
        <CompanyBenefits />
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default Careers;
