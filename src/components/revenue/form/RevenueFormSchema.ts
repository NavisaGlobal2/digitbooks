
import { z } from "zod";

export const revenueFormSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.date(),
  source: z.enum(['sales', 'services', 'investments', 'grants', 'donations', 'royalties', 'rental', 'consulting', 'affiliate', 'other']),
  payment_method: z.enum(['cash', 'card', 'bank transfer', 'crypto', 'other']),
  payment_status: z.enum(['paid', 'pending', 'overdue', 'cancelled']),
  client_name: z.string().optional(),
  notes: z.string().optional(),
});

export type RevenueFormValues = z.infer<typeof revenueFormSchema>;
