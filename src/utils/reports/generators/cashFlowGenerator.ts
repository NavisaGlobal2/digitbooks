
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
    
    // Reset the position to start after the header
    doc.setPage(1);
    
    // Create a clone of the report to snapshot
    const clone = reportContainer.cloneNode(true) as HTMLElement;
    clone.style.position = "fixed";
    clone.style.top = "-9999px";
    clone.style.left = "-9999px";
    clone.style.width = "800px";
    clone.style.backgroundColor = "white";
    clone.style.padding = "20px";
    clone.style.margin = "0";
    
    // Remove print-hidden elements from the clone
    clone.querySelectorAll(".print\\:hidden").forEach(element => {
      element.remove();
    });
    
    // Add the clone to the document body
    document.body.appendChild(clone);
    
    // Wait for rendering to complete
    setTimeout(async () => {
      try {
        // Generate canvas from the clone
        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc) => {
            // Fix any SVG rendering issues
            clonedDoc.querySelectorAll('svg').forEach(svg => {
              svg.setAttribute('width', svg.getBoundingClientRect().width.toString());
              svg.setAttribute('height', svg.getBoundingClientRect().height.toString());
            });
          }
        });
        
        // Calculate dimensions and add to PDF
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 210; // A4 width
        const pageHeight = 295; // A4 height
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add the image to PDF
        doc.addImage({
          imageData: imgData,
          x: 0,
          y: 60, // Starting after the header
          width: imgWidth,
          height: imgHeight
        });
        
        // Remove the clone from the document
        document.body.removeChild(clone);
        
      } catch (error) {
        console.error("Error capturing Cash Flow report:", error);
        if (document.body.contains(clone)) {
          document.body.removeChild(clone);
        }
      }
    }, 1000); // Added longer delay to ensure proper rendering
    
  } catch (error) {
    console.error("Error in Cash Flow report generation:", error);
  }
}
