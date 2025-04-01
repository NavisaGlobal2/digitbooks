
import { z } from "zod";

export const revenueFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.date(),
  source: z.string(),
  payment_method: z.string(),
  payment_status: z.string(),
  client_name: z.string().optional(),
  notes: z.string().optional(),
});

export type RevenueFormValues = z.infer<typeof revenueFormSchema>;
