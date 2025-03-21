
import { JobCard, JobPosition } from "@/components/careers/JobCard";

export const availableJobs: JobPosition[] = [
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

export const AvailableJobs = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold mb-10 bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
          Available Positions
        </h2>
        
        <div className="grid gap-6">
          {availableJobs.map((job, index) => (
            <JobCard key={index} job={job} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
