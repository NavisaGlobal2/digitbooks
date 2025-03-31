
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";

// Add types for jsPDF-autotable to jsPDF
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ReportData {
  title: string;
  period: string;
  data?: any;
  dateRange?: { 
    startDate: Date; 
    endDate: Date 
  } | null;
}

export const generateReportPdf = (reportData: ReportData): void => {
  const { title, period, dateRange } = reportData;
  
  // Create a new PDF document
  const doc = new jsPDF();
  
  // Add metadata
  doc.setProperties({
    title: `${title} Report - ${period}`,
    subject: "Financial Report",
    creator: "Financial Management System",
    author: "System"
  });

  // Set font styling
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  
  // Add title
  doc.text(`${title} Report`, 105, 20, { align: "center" });
  
  // Add report period
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Period: ${period}`, 105, 30, { align: "center" });
  
  // Add generation date
  const currentDate = format(new Date(), "MMMM dd, yyyy");
  doc.setFontSize(10);
  doc.text(`Generated on: ${currentDate}`, 105, 38, { align: "center" });
  
  // Add report timeline
  if (dateRange) {
    const startDate = format(dateRange.startDate, "MMM dd, yyyy");
    const endDate = format(dateRange.endDate, "MMM dd, yyyy");
    
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 45, 170, 15, "F");
    doc.setFontSize(11);
    doc.text(`Report Period: ${startDate} - ${endDate}`, 105, 53, { align: "center" });
  }
  
  // Add report summary based on report type
  switch (title.toLowerCase().replace(/\s+/g, "-")) {
    case "income-statement":
      generateIncomeStatementContent(doc);
      break;
    case "revenue-summary":
    case "expense-summary":
    case "cash-flow":
    case "budget-analysis":
    case "profit-loss":
    default:
      generateGenericReportContent(doc, title);
      break;
  }
  
  // Add a footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: "center" });
  }
  
  // Save the PDF with the report name and date
  const fileName = `${title.toLowerCase().replace(/\s+/g, "-")}_report_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
};

function generateIncomeStatementContent(doc: jsPDF): void {
  doc.setFontSize(14);
  doc.text("Financial Summary", 20, 70);
  
  doc.setFontSize(11);
  doc.autoTable({
    startY: 75,
    head: [["Category", "Amount ($)", "% of Total"]],
    body: [
      ["Revenue", "50,000.00", "100%"],
      ["Cost of Goods Sold", "20,000.00", "40%"],
      ["Gross Profit", "30,000.00", "60%"],
      ["Operating Expenses", "15,000.00", "30%"],
      ["Net Income", "15,000.00", "30%"]
    ],
    theme: "grid",
    headStyles: {
      fillColor: [5, 209, 102],
      textColor: 255,
      fontStyle: "bold"
    },
    styles: {
      cellPadding: 5
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 40, halign: "right" }
    }
  });
  
  // Revenue breakdown
  doc.setFontSize(14);
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.text("Revenue Breakdown", 20, finalY);
  
  doc.autoTable({
    startY: finalY + 5,
    head: [["Revenue Source", "Amount ($)", "% of Total"]],
    body: [
      ["Sales", "35,000.00", "70%"],
      ["Services", "12,500.00", "25%"],
      ["Other Income", "2,500.00", "5%"]
    ],
    theme: "grid",
    headStyles: {
      fillColor: [5, 209, 102],
      textColor: 255,
      fontStyle: "bold"
    }
  });
  
  // Expense breakdown
  doc.setFontSize(14);
  const finalY2 = (doc as any).lastAutoTable.finalY + 15;
  doc.text("Expense Breakdown", 20, finalY2);
  
  doc.autoTable({
    startY: finalY2 + 5,
    head: [["Expense Category", "Amount ($)", "% of Total"]],
    body: [
      ["Salaries", "8,000.00", "53.3%"],
      ["Rent", "2,500.00", "16.7%"],
      ["Utilities", "1,200.00", "8.0%"],
      ["Marketing", "1,800.00", "12.0%"],
      ["Other", "1,500.00", "10.0%"]
    ],
    theme: "grid",
    headStyles: {
      fillColor: [5, 209, 102],
      textColor: 255,
      fontStyle: "bold"
    }
  });
}

function generateGenericReportContent(doc: jsPDF, title: string): void {
  doc.setFontSize(14);
  doc.text("Financial Summary", 20, 70);
  
  // Create generic sample data based on report type
  doc.setFontSize(11);
  doc.autoTable({
    startY: 75,
    head: [["Category", "Amount ($)", "Notes"]],
    body: [
      ["Category 1", "25,000.00", "Primary income source"],
      ["Category 2", "10,000.00", "Secondary income"],
      ["Category 3", "8,000.00", "Additional revenue"],
      ["Category 4", "5,000.00", "Other sources"],
      ["Total", "48,000.00", ""]
    ],
    theme: "grid",
    headStyles: {
      fillColor: [5, 209, 102],
      textColor: 255,
      fontStyle: "bold"
    },
    styles: {
      cellPadding: 5
    }
  });
  
  // Add placeholder text
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(11);
  doc.text(
    "This is a preliminary report. The data shown represents sample values for demonstration purposes. " +
    "In a production environment, this report would include actual financial data from your system.",
    20, finalY, { maxWidth: 170 }
  );
  
  // Add chart placeholder
  doc.setFontSize(14);
  const chartY = finalY + 20;
  doc.text("Report Visualization", 20, chartY);
  
  // Draw a rectangle to represent a chart
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(20, chartY + 5, 170, 80, 3, 3, "FD");
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text("Chart visualization would appear here", 105, chartY + 45, { align: "center" });
}
