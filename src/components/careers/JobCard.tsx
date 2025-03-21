
import { JobApplicationModal } from "@/components/JobApplicationModal";

export interface JobPosition {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  experience: string;
}

interface JobCardProps {
  job: JobPosition;
  index: number;
}

export const JobCard = ({ job, index }: JobCardProps) => {
  return (
    <div 
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
          <JobApplicationModal jobTitle={job.title} jobDepartment={job.department} />
        </div>
      </div>
    </div>
  );
};
