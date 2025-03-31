
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generate Cash Flow report content using direct snapshot approach
 */
export async function generateCashFlowContent(doc: jsPDF): Promise<void> {
  try {
    // Find the report container element
    const reportContainer = document.getElementById("report-container");
    
    if (!reportContainer) {
      console.error("Report container not found");
      return;
    }
    
    // Clone the report container to avoid modifying the original
    const clonedReport = reportContainer.cloneNode(true) as HTMLElement;
    clonedReport.id = "cloned-report-container";
    
    // Apply special styles for PDF generation
    clonedReport.style.position = "absolute";
    clonedReport.style.top = "-9999px";
    clonedReport.style.left = "-9999px";
    clonedReport.style.width = "800px"; // Fixed width for PDF
    clonedReport.style.backgroundColor = "white";
    clonedReport.style.padding = "20px";
    clonedReport.style.margin = "0";
    clonedReport.style.zIndex = "-1";
    
    // Remove print-specific CSS
    const printClasses = clonedReport.querySelectorAll(".print\\:hidden");
    printClasses.forEach(element => {
      (element as HTMLElement).style.display = "none";
    });
    
    // Append the clone to the body
    document.body.appendChild(clonedReport);
    
    // Wait a bit to ensure charts are rendered properly
    setTimeout(async () => {
      try {
        // Capture the cloned report as an image
        const canvas = await html2canvas(clonedReport, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById("cloned-report-container");
            if (clonedElement) {
              // Additional styles for better rendering
              clonedElement.querySelectorAll('svg').forEach(svg => {
                svg.style.maxWidth = "100%";
                svg.style.height = "auto";
              });
              
              // Ensure charts render correctly
              clonedElement.querySelectorAll('.recharts-surface').forEach(chart => {
                chart.setAttribute('width', '100%');
              });
            }
          }
        });
        
        // Get image data
        const imgData = canvas.toDataURL("image/png");
        
        // Calculate dimensions
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add the image to the PDF
        doc.addImage({
          imageData: imgData,
          x: 0,
          y: 60, // Starting after the header
          width: imgWidth,
          height: imgHeight
        });
        
        // Remove the cloned element
        document.body.removeChild(clonedReport);
        
      } catch (error) {
        console.error("Error generating Cash Flow report PDF:", error);
        document.body.removeChild(clonedReport);
      }
    }, 500); // Delay to ensure proper rendering
    
  } catch (error) {
    console.error("Error in Cash Flow report generation:", error);
  }
}
