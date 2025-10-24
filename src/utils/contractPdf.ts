import { jsPDF } from "jspdf";

interface ContractPdfData {
  contractNumber: string;
  companyName: string;
  categoryName: string;
  startDate: string;
  endDate: string;
  amount: number;
  paymentFrequency: string;
  duration: number;
  // User data
  userName?: string;
  userAddress?: string;
}

export const generateContractPdf = (contractData: ContractPdfData) => {
  // Create a new PDF document
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set document properties
  pdf.setProperties({
    title: "Vertragsinformationen",
    subject: "Contract Document",
    author: "FixFinanz",
    creator: "FixFinanz Contract System",
  });

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  };

  // Set margins and positioning
  const margin = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = margin;

  // Title
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Vertragsinformationen", margin, yPosition);
  yPosition += 15;

  // Add a line separator
  pdf.setLineWidth(0.5);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Contract details
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");

  // Versicherungsnehmer (Policy holder)
  pdf.setFont("helvetica", "bold");
  pdf.text("Versicherungsnehmer:", margin, yPosition);
  pdf.setFont("helvetica", "normal");
  pdf.text(contractData.userName || "N/A", margin + 50, yPosition);
  yPosition += 8;

  // Address (if available)
  if (contractData.userAddress) {
    pdf.text(contractData.userAddress, margin + 50, yPosition);
    yPosition += 8;
  }
  yPosition += 5;

  // Gesellschaft (Company)
  pdf.setFont("helvetica", "bold");
  pdf.text("Gesellschaft:", margin, yPosition);
  pdf.setFont("helvetica", "normal");
  pdf.text(contractData.companyName, margin + 30, yPosition);
  yPosition += 10;

  // Vertragsnummer (Contract number)
  pdf.setFont("helvetica", "bold");
  pdf.text("Vertragsnummer:", margin, yPosition);
  pdf.setFont("helvetica", "normal");
  pdf.text(contractData.contractNumber, margin + 40, yPosition);
  yPosition += 10;

  // Vertragsbeginn (Start date)
  pdf.setFont("helvetica", "bold");
  pdf.text("Vertragsbeginn:", margin, yPosition);
  pdf.setFont("helvetica", "normal");
  pdf.text(formatDate(contractData.startDate), margin + 35, yPosition);
  yPosition += 10;

  // Vertragsende (End date)
  pdf.setFont("helvetica", "bold");
  pdf.text("Vertragsende:", margin, yPosition);
  pdf.setFont("helvetica", "normal");
  pdf.text(formatDate(contractData.endDate), margin + 30, yPosition);
  yPosition += 15;

  // Additional contract details
  yPosition += 5;
  pdf.setFont("helvetica", "bold");
  pdf.text("Weitere Vertragsdaten:", margin, yPosition);
  yPosition += 10;

  pdf.setFont("helvetica", "normal");
  pdf.text(`Kategorie: ${contractData.categoryName}`, margin, yPosition);
  yPosition += 8;
  
  pdf.text(`Betrag: ${contractData.amount}€`, margin, yPosition);
  yPosition += 8;
  
  pdf.text(`Zahlungsweise: ${contractData.paymentFrequency}`, margin, yPosition);
  yPosition += 8;
  
  pdf.text(`Vertragsdauer: ${contractData.duration} Tage`, margin, yPosition);
  yPosition += 15;

  // Footer
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "italic");
  pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, margin, yPosition);

  // Open PDF in new tab
  const pdfBlob = pdf.output('blob');
  const url = URL.createObjectURL(pdfBlob);
  
  // Open in new tab with a proper title
  const newWindow = window.open(url, '_blank');
  if (newWindow) {
    newWindow.document.title = `Contract ${contractData.contractNumber} - FixFinanz`;
  }
  
  // Alternative: Download the PDF with proper filename
  // const link = document.createElement('a');
  // link.href = url;
  // link.download = `Contract_${contractData.contractNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
  // link.click();
  
  // Clean up the URL object after a delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10000); // Increased delay to ensure PDF loads properly
}; 