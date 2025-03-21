
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, AlertCircle, RefreshCw, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JobApplication {
  id: string;
  job_title: string;
  job_department: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  resume_url: string | null;
  experience: string;
  portfolio_link: string | null;
  availability: string;
  cover_letter: string | null;
}

const ApplicationsAdmin = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const { toast } = useToast();

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching applications...");
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fetch error:", error);
        throw new Error(error.message);
      }

      console.log("Applications fetched:", data);
      setApplications(data as JobApplication[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load applications';
      console.error("Error in fetch applications:", errorMessage);
      setError(errorMessage);
      toast({
        title: "Error loading applications",
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDownloadResume = async (resumeUrl: string | null, applicantName: string) => {
    if (!resumeUrl) {
      toast({
        title: "No Resume Available",
        description: "This application does not have a resume attached.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("Downloading resume:", resumeUrl);
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(resumeUrl);
      
      if (error) {
        console.error("Download error:", error);
        throw error;
      }
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      const fileExt = resumeUrl.includes('.') ? resumeUrl.substring(resumeUrl.lastIndexOf('.')) : '.pdf';
      a.download = `${applicantName.replace(/\s+/g, '_')}_resume${fileExt}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Resume Downloaded",
        description: `${applicantName}'s resume has been downloaded successfully.`,
      });
    } catch (err) {
      console.error("Resume download error:", err);
      toast({
        title: "Error downloading resume",
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    }
  };

  const formatAvailability = (availability: string) => {
    switch(availability) {
      case 'immediately': return 'Immediately';
      case '2weeks': return 'In 2 weeks';
      case '1month': return 'In 1 month';
      case 'other': return 'Other (see cover letter)';
      default: return availability;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchApplications}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="text-center py-10">Loading applications...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-10">No applications submitted yet.</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableCaption>List of job applications</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Resume</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.full_name}</TableCell>
                    <TableCell>{app.job_title}</TableCell>
                    <TableCell>{app.job_department}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.phone}</TableCell>
                    <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {app.resume_url ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadResume(app.resume_url, app.full_name)}
                        >
                          <Download className="h-4 w-4 mr-2" /> Download
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">No resume</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Application Details</DialogTitle>
                            <DialogDescription>
                              Submitted on {new Date(app.created_at).toLocaleString()}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h3 className="text-sm font-medium">Full Name</h3>
                                <p>{app.full_name}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">Position</h3>
                                <p>{app.job_title} ({app.job_department})</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">Email</h3>
                                <p>{app.email}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">Phone</h3>
                                <p>{app.phone}</p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">Availability</h3>
                                <p>{formatAvailability(app.availability)}</p>
                              </div>
                              {app.portfolio_link && (
                                <div>
                                  <h3 className="text-sm font-medium">Portfolio Link</h3>
                                  <a 
                                    href={app.portfolio_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {app.portfolio_link}
                                  </a>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium">Experience</h3>
                              <p className="whitespace-pre-wrap">{app.experience}</p>
                            </div>
                            
                            {app.cover_letter && (
                              <div>
                                <h3 className="text-sm font-medium">Cover Letter</h3>
                                <p className="whitespace-pre-wrap">{app.cover_letter}</p>
                              </div>
                            )}
                            
                            <div className="flex justify-end">
                              {app.resume_url && (
                                <Button 
                                  onClick={() => handleDownloadResume(app.resume_url, app.full_name)}
                                  className="ml-2"
                                >
                                  <Download className="h-4 w-4 mr-2" /> Download Resume
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default ApplicationsAdmin;
