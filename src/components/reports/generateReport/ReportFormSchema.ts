
import * as z from "zod";

export const formSchema = z.object({
  reportType: z.string({
    required_error: "Please select a report type",
  }),
  reportPeriod: z.string({
    required_error: "Please select a report period",
  }),
  fileFormat: z.string({
    required_error: "Please select a file format",
  }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export type ReportFormValues = z.infer<typeof formSchema>;
