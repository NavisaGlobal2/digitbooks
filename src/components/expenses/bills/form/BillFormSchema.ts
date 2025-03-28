
import { z } from "zod";
import { TransactionFrequency } from "@/types/recurringTransaction";

export const billFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  category_id: z.string().min(1, "Category is required"),
  frequency: z.enum(["daily", "weekly", "monthly", "quarterly", "annually"]),
  start_date: z.date({
    required_error: "Start date is required",
  }),
  end_date: z.date().optional(),
});

export type BillFormValues = z.infer<typeof billFormSchema>;

export const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
];

export const categories = [
  { id: "utilities", name: "Utilities" },
  { id: "rent", name: "Rent" },
  { id: "software", name: "Software" },
  { id: "office", name: "Office" },
  { id: "other", name: "Other" },
];
