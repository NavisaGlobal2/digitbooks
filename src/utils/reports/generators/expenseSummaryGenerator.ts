
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { format } from "date-fns";
import html2canvas from "html2canvas";

/**
 * Generate expense summary report content
 */
export const generateExpenseSummaryContent = async (doc: jsPDF): Promise<void> => {
  // First try to use the snapshot approach
  const reportContainer = document.getElementById("expense-report-content");
  
  if (reportContainer) {
    try {
      const canvas = await html2canvas(reportContainer, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgProps = doc.getImageProperties(imgData);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Add the captured image to the PDF
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Success with snapshot - return early
      return;
    } catch (error) {
      console.error("Error capturing expense report snapshot, falling back to manual rendering:", error);
      // Continue with fallback approach below
    }
  }
  
  // Fallback to the manual rendering approach
  // Add title for this section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Expense Summary", 20, 70);
  
  // Reset font for regular content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  
  // Find the expense data from the DOM to recreate in PDF
  if (!reportContainer) {
    doc.text("Error: Could not find expense report data.", 20, 85);
    return;
  }
  
  // Try to find the total expenses value
  const totalExpensesEl = reportContainer.querySelector(".text-2xl.font-bold");
  let totalExpenses = "N/A";
  if (totalExpensesEl) {
    totalExpenses = totalExpensesEl.textContent || "N/A";
  }
  
  // Add total expenses info
  doc.text("Total Expenses:", 20, 85);
  doc.text(totalExpenses, 100, 85);
  
  // Add expense categories table if we can find the data
  try {
    const tableRows: any[] = [];
    
    // Extract data from DOM
    const tableBody = reportContainer.querySelectorAll("tbody tr");
    if (tableBody && tableBody.length > 0) {
      tableBody.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length >= 3) {
          const category = cells[0].textContent?.trim() || "";
          const amount = cells[1].textContent?.trim() || "";
          const percentage = cells[2].textContent?.trim() || "";
          
          tableRows.push([category, amount, percentage]);
        }
      });
    }
    
    if (tableRows.length > 0) {
      // Add expense categories breakdown table
      autoTable(doc, {
        startY: 95,
        head: [["Category", "Amount", "Percentage"]],
        body: tableRows,
        margin: { top: 95 },
        styles: { fontSize: 10 },
        headStyles: { 
          fillColor: [22, 163, 74],
          textColor: 255, 
          fontStyle: "bold" 
        },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });
    } else {
      doc.text("No expense category data available.", 20, 95);
    }
  } catch (error) {
    console.error("Error generating expense table for PDF:", error);
    doc.text("Error generating expense categories table.", 20, 95);
  }
};
