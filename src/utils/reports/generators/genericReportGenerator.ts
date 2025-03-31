
import jsPDF from "jspdf";
import "jspdf-autotable";

// Type declaration for jsPDF with autoTable functionality
type JsPDFWithAutoTable = jsPDF & {
  autoTable: (options: any) => any;
};

/**
 * Generates generic report content for the PDF
 */
export function generateGenericReportContent(doc: jsPDF): void {
  doc.setFontSize(14);
  doc.text("Financial Summary", 20, 70);
  
  // Create generic sample data based on report type
  doc.setFontSize(11);
  (doc as JsPDFWithAutoTable).autoTable({
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
