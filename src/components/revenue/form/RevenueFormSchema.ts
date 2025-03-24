
import { z } from "zod";

export const revenueFormSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.date(),
  source: z.enum(["sales", "services", "investments", "grants", "donations", "royalties", "rental", "consulting", "affiliate", "other"]),
  paymentMethod: z.enum(["cash", "card", "bank transfer", "crypto", "other"]),
  paymentStatus: z.enum(["paid", "pending", "overdue", "cancelled"]),
  clientName: z.string().optional(),
  notes: z.string().optional(),
});

export type RevenueFormValues = z.infer<typeof revenueFormSchema>;
