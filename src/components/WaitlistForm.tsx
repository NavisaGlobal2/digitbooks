
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Mail, User, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const waitlistSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  company: z.string().optional(),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

const WaitlistForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
    },
  });

  const onSubmit = async (data: WaitlistFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Store waitlist data in Supabase
      const { error } = await supabase
        .from("waitlist")
        .insert([
          {
            name: data.name,
            email: data.email,
            company: data.company || null,
          },
        ]);

      if (error) throw error;
      
      setIsSuccess(true);
      toast.success("You've been added to our waitlist!");
      form.reset();
    } catch (error) {
      console.error("Error submitting to waitlist:", error);
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md px-6 py-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-border">
      <h3 className="text-xl font-semibold mb-6 text-center bg-gradient-to-r from-primary to-[#8B5CF6] bg-clip-text text-transparent">
        Join Our Waitlist
      </h3>
      
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="text-lg font-medium mb-2">Thank You!</h4>
          <p className="text-secondary mb-4">
            You've been added to our waitlist. We'll notify you when we launch.
          </p>
          <Button 
            onClick={() => setIsSuccess(false)} 
            variant="outline"
          >
            Join Again
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/70 w-4 h-4" />
                      <Input 
                        placeholder="John Doe" 
                        className="pl-10" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/70 w-4 h-4" />
                      <Input 
                        placeholder="your@email.com" 
                        type="email" 
                        className="pl-10" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your Company" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Join Waitlist"}
              {!isSubmitting && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default WaitlistForm;
