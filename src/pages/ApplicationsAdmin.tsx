
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, FileDown } from "lucide-react";
import ApplicationsTable from "@/components/applications/ApplicationsTable";

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
  status: string;
}

const ApplicationsAdmin = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
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

  const handleDownloadAllResumes = async () => {
    const applicationsWithResumes = applications.filter(app => app.resume_url);
    
    if (applicationsWithResumes.length === 0) {
      toast({
        title: "No Resumes Available",
        description: "There are no resumes attached to any applications.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDownloadingAll(true);
    
    try {
      // Create a zip file containing all resumes
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Download each resume and add to zip
      for (const app of applicationsWithResumes) {
        if (!app.resume_url) continue;
        
        const { data, error } = await supabase.storage
          .from('resumes')
          .download(app.resume_url);
        
        if (error) {
          console.error(`Error downloading resume for ${app.full_name}:`, error);
          continue;
        }
        
        const fileExt = app.resume_url.includes('.') ? app.resume_url.substring(app.resume_url.lastIndexOf('.')) : '.pdf';
        const fileName = `${app.full_name.replace(/\s+/g, '_')}_${app.job_title.replace(/\s+/g, '_')}${fileExt}`;
        
        zip.file(fileName, data);
      }
      
      // Generate the zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create a download link for the zip
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_resumes_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "All Resumes Downloaded",
        description: `Successfully downloaded ${applicationsWithResumes.length} resume(s).`,
      });
    } catch (err) {
      console.error("Error downloading all resumes:", err);
      toast({
        title: "Error Downloading Resumes",
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);
      
      if (error) {
        console.error("Status update error:", error);
        throw error;
      }
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      toast({
        title: "Status Updated",
        description: `Application status has been updated to ${newStatus}.`,
      });
    } catch (err) {
      console.error("Status update error:", err);
      toast({
        title: "Error Updating Status",
        description: err instanceof Error ? err.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Job Applications</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchApplications}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleDownloadAllResumes}
              disabled={isDownloadingAll || isLoading}
              size="sm"
              variant="accent"
            >
              <FileDown className="h-4 w-4 mr-2" />
              {isDownloadingAll ? 'Downloading...' : 'Download All CVs'}
            </Button>
          </div>
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
          <ApplicationsTable 
            applications={applications} 
            onDownloadResume={handleDownloadResume}
            onStatusChange={updateApplicationStatus}
          />
        )}
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
};

export default ApplicationsAdmin;
