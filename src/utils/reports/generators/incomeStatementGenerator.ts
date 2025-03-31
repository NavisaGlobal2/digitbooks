
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Generates income statement content for the PDF
 */
export function generateIncomeStatementContent(doc: jsPDF): void {
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
  const finalY = (doc.lastAutoTable.finalY) + 15;
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
  const finalY2 = (doc.lastAutoTable.finalY) + 15;
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
