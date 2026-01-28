import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * IBK Terminal - Receipt Generation Utility
 * Converts a DOM element into a high-quality PDF
 */
export const generateReceiptPDF = async (elementId: string, fileName: string = 'IBK-Transfer-Receipt.pdf') => {
  const input = document.getElementById(elementId);
  
  if (!input) {
    console.error("Receipt element not found");
    return;
  }

  try {
    const canvas = await html2canvas(input, {
      scale: 2, // Higher scale for crisp text
      useCORS: true,
      backgroundColor: '#060a11', // Matches your dashboard theme
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF (A4 size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return false;
  }
};