
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  resumeFile: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, `File size should be less than 5MB`)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Only PDF, DOC, and DOCX files are accepted"
    ),
  experience: z.string().min(1, "Please describe your relevant experience"),
  portfolioLink: z.string().optional(),
  availability: z.enum(["immediately", "2weeks", "1month", "other"]),
  coverLetter: z.string().optional(),
});

type JobApplicationFormProps = {
  jobTitle: string;
  jobDepartment: string;
  onSubmitSuccess: () => void;
};

export function JobApplicationForm({ jobTitle, jobDepartment, onSubmitSuccess }: JobApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      experience: "",
      portfolioLink: "",
      availability: "2weeks",
      coverLetter: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      console.log("Starting application submission process...");
      
      // Upload the resume file to Supabase Storage
      const file = values.resumeFile;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${values.fullName.replace(/\s+/g, '-').toLowerCase()}.${fileExt}`;
      
      console.log("Uploading resume file...", fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(`${fileName}`, file);
      
      if (uploadError) {
        console.error("Resume upload error:", uploadError);
        throw new Error(`Resume upload failed: ${uploadError.message}`);
      }
      
      console.log("Resume uploaded successfully:", uploadData);
      
      // Generate a URL for the uploaded file
      const resumeUrl = `${fileName}`;
      
      console.log("Storing application data in database...");
      
      // Store the application data in the database
      const { data: insertData, error: insertError } = await supabase
        .from('job_applications')
        .insert({
          job_title: jobTitle,
          job_department: jobDepartment,
          full_name: values.fullName,
          email: values.email,
          phone: values.phone,
          experience: values.experience,
          portfolio_link: values.portfolioLink || null,
          availability: values.availability,
          cover_letter: values.coverLetter || null,
          resume_url: resumeUrl
        })
        .select();
      
      if (insertError) {
        console.error("Database insert error:", insertError);
        throw new Error(`Application submission failed: ${insertError.message}`);
      }
      
      console.log("Application submitted and stored successfully:", insertData);
      
      toast({
        title: "Application Submitted!",
        description: "Thank you for applying. We'll be in touch soon.",
      });
      
      onSubmitSuccess();
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, onChange: (file: File) => void) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      onChange(file);
      setSelectedFileName(file.name);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Application for {jobTitle}</h3>
        <p className="text-sm text-muted-foreground">Department: {jobDepartment}</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+234 123 4567 890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="resumeFile"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Resume/CV</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center justify-center w-full">
                    <label 
                      htmlFor="resumeUpload" 
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PDF, DOC, or DOCX (MAX. 5MB)</p>
                        {selectedFileName && (
                          <p className="mt-2 text-sm font-medium text-primary">{selectedFileName}</p>
                        )}
                      </div>
                      <input
                        id="resumeUpload"
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, onChange)}
                        {...rest}
                      />
                    </label>
                  </div>
                </FormControl>
                <FormDescription>
                  Upload your resume (PDF, DOC, or DOCX format, max 5MB)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="portfolioLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portfolio/GitHub Link (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://github.com/yourusername" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relevant Experience</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Briefly describe your relevant experience for this role..." 
                    className="min-h-[120px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>When can you start?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="immediately" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Immediately
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="2weeks" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        In 2 weeks
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="1month" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        In 1 month
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="other" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Other (specify in cover letter)
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="coverLetter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Letter (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Why are you interested in this position?" 
                    className="min-h-[150px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={onSubmitSuccess}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#F2FCE2] text-primary hover:bg-[#E5F7C7] border border-[#D0E6B1]"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
