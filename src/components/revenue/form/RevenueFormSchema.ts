
import { z } from "zod";
import { RevenueSource, PaymentMethod, PaymentStatus } from "@/types/revenue";

export const revenueFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  date: z.date(),
  source: z.string().refine((val): val is RevenueSource => 
    ['sales', 'services', 'investments', 'grants', 'donations', 'royalties', 'rental', 'consulting', 'affiliate', 'other'].includes(val), 
    { message: "Invalid revenue source" }
  ),
  payment_method: z.string().refine((val): val is PaymentMethod => 
    ['cash', 'card', 'bank transfer', 'crypto', 'other'].includes(val), 
    { message: "Invalid payment method" }
  ),
  payment_status: z.string().refine((val): val is PaymentStatus => 
    ['paid', 'pending', 'overdue', 'cancelled'].includes(val), 
    { message: "Invalid payment status" }
  ),
  client_name: z.string().optional(),
  notes: z.string().optional(),
});

export type RevenueFormValues = z.infer<typeof revenueFormSchema>;
