
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
import { Download, AlertCircle } from "lucide-react";

interface JobApplication {
  id: string;
  job_title: string;
  job_department: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  resume_url: string;
}

const ApplicationsAdmin = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('job_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        setApplications(data as JobApplication[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load applications');
        toast({
          title: "Error loading applications",
          description: err instanceof Error ? err.message : 'An unexpected error occurred',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [toast]);

  const handleDownloadResume = async (resumeUrl: string, applicantName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(resumeUrl);
      
      if (error) {
        throw error;
      }
      
      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${applicantName.replace(/\s+/g, '_')}_resume${resumeUrl.substring(resumeUrl.lastIndexOf('.'))}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      toast({
        title: "Error downloading resume",
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8">Job Applications</h1>
        
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadResume(app.resume_url, app.full_name)}
                      >
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
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
