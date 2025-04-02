
import { z } from "zod";
import { RevenueSource, PaymentMethod, PaymentStatus } from "@/types/revenue";

// Define allowed values for the dropdowns
const revenueSources: RevenueSource[] = ["sales", "services", "investments", "grants", "donations", "royalties", "rental", "consulting", "affiliate", "other"];
const paymentMethods: PaymentMethod[] = ["cash", "card", "bank transfer", "crypto", "other"];
const paymentStatuses: PaymentStatus[] = ["paid", "pending", "overdue", "cancelled"];

// Define the schema for revenue form validation
export const revenueFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.date({
    required_error: "Date is required",
  }),
  source: z.enum(revenueSources as [RevenueSource, ...RevenueSource[]]),
  payment_method: z.enum(paymentMethods as [PaymentMethod, ...PaymentMethod[]]),
  payment_status: z.enum(paymentStatuses as [PaymentStatus, ...PaymentStatus[]]),
  client_name: z.string().optional(),
  notes: z.string().optional(),
});

// Export type for form values
export type RevenueFormValues = z.infer<typeof revenueFormSchema>;
