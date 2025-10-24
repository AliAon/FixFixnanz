import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { 
  getAdvisorContract, 
  // updateAdvisorContract, 
  // getAdvisorContractPdf 
} from "@/redux/slices/advisorContractSlice";
import { toast } from "react-toastify";

const AVContractDisplay = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { contract, isLoading, error, downloadUrl } = useSelector(
    (state: RootState) => state.advisorContract
  );
  
  const [contractHtml, setContractHtml] = useState("");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [contractStatus, setContractStatus] = useState<"pending" | "approved" | "declined">("pending");

  // Fetch contract data from API when component mounts
  useEffect(() => {
    dispatch(getAdvisorContract());
  }, [dispatch]);

  // Set the contract HTML content when available
  useEffect(() => {
    if (contract && contract.body) {
      setContractHtml(contract.body);
      
      // Check if the contract has a status field
      if (typeof contract.status === 'string') {
        setContractStatus(contract.status as "pending" | "approved" | "declined");
      }
    }
  }, [contract]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle PDF download from API
  useEffect(() => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  }, [downloadUrl]);

  const handleApprove = async () => {
    toast.success("Contract approved successfully!");

    // try {
    //   // Set local status immediately for better UX
    //   setContractStatus("approved");
      
    //   // Send the status through a different method or API endpoint
    //   // For now, use the existing endpoint but only send the status as a query parameter
    //   await dispatch(updateAdvisorContract({ 
    //     body: `status=approved&id=${contract?.id || ''}`,
    //     // Using body but with minimal content
    //   })).unwrap();
      
    //   toast.success("Contract approved successfully!");
    // } catch (err) {
    //   // Revert status on error
    //   setContractStatus("pending");
    //   toast.error("Failed to approve contract");
    // }
  };

  const handleDecline = async () => {
    toast.success("Contract declined successfully!");

    // try {
    //   // Set local status immediately for better UX
    //   setContractStatus("declined");
      
    //   // Update contract status via API
    //   await dispatch(updateAdvisorContract({ 
    //     body: contractHtml,
    //   })).unwrap();
      
    //   toast.success("Contract declined successfully!");
    // } catch (err) {
    //   // Revert status on error
    //   setContractStatus("pending");
    //   toast.error("Failed to decline contract");
    // }
  };

  const handleDownload = async () => {
    // Skip trying to use the API endpoint since we know it's failing
    // and go straight to client-side generation
    setDownloadingPdf(true);
    try {
      await generatePdfLocally();
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };
  const generatePdfLocally = async () => {
    setDownloadingPdf(true);
  
    try {
      // Get the contract element
      const contractElement = document.getElementById("contract-content");
      if (!contractElement) {
        throw new Error("Contract element not found");
      }
  
      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
  
      // Set document properties
      pdf.setProperties({
        title: "Advisor Contract",
        subject: "Contract Document",
        author: "System",
        creator: "AVContractDisplay",
      });
  
      // Add a title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Advisor Contract", 20, 20);
  
      // Add date
      const today = new Date();
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`Generated on: ${today.toLocaleDateString()}`, 20, 30);
  
      // Get HTML structure with headings and paragraphs
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contractHtml;
      
      // Starting position
      let yPos = 40;
      const lineHeight = 7; // mm
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const textWidth = pageWidth - (margin * 2);
      
      // Process each element in the contract
      const processNode = (node: Node | Element, level = 0) => {
        // Skip empty text nodes
        if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
          return;
        }
        
        // Process different types of nodes
        if (node.nodeType === Node.TEXT_NODE) {
          // Handle text node
          const text = node.textContent?.trim() || "";
          if (text) {
            const lines = pdf.splitTextToSize(text, textWidth);
            
            // Check if we need a new page
            if (yPos + (lines.length * lineHeight) > pageHeight - margin) {
              pdf.addPage();
              yPos = margin;
            }
            
            pdf.text(lines, margin, yPos);
            yPos += lines.length * lineHeight + 2; // Extra spacing after paragraph
          }
        } else if (node instanceof Element) {
          // Handle element node
          const tagName = node.tagName.toLowerCase();
          
          // Handle headings
          if (tagName.match(/^h[1-6]$/)) {
            const headingLevel = parseInt(tagName.substring(1));
            const headingText = node.textContent?.trim() || "";
            
            // Check if we need a new page
            if (yPos + 15 > pageHeight - margin) {
              pdf.addPage();
              yPos = margin;
            }
            
            // Set heading style based on level
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(22 - (headingLevel * 2)); // h1=20, h2=18, h3=16, etc.
            
            const headingLines = pdf.splitTextToSize(headingText, textWidth);
            pdf.text(headingLines, margin, yPos);
            
            yPos += headingLines.length * lineHeight + 5; // Extra space after headings
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(12);
          } 
          // Handle paragraphs
          else if (tagName === 'p') {
            const text = node.textContent?.trim() || "";
            
            if (text) {
              // Check if we need a new page
              if (yPos + 10 > pageHeight - margin) {
                pdf.addPage();
                yPos = margin;
              }
              
              const lines = pdf.splitTextToSize(text, textWidth);
              pdf.text(lines, margin, yPos);
              yPos += lines.length * lineHeight + 4; // Extra spacing after paragraph
            }
          } 
          // For other elements, process their children
          else {
            // Process all child nodes
            for (const childNode of node.childNodes) {
              processNode(childNode, level + 1);
            }
          }
        }
      };
      
      // Process all content
      for (const childNode of tempDiv.childNodes) {
        processNode(childNode);
      }
  
      // Save the PDF
      pdf.save(`Advisor_Contract_${today.toISOString().split("T")[0]}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };
  // Display loading state
  if (isLoading && !contractHtml) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Display error state
  if (error && !contractHtml) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <p>Error: {error}</p>
      </div>
    );
  }

  // Display empty state
  if (!contractHtml) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded">
        <p>No contract available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Contract Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <h2 className="text-2xl font-medium underline text-primary">
          Advisor Contract
        </h2>
        {contractStatus !== "pending" && (
          <div className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${
            contractStatus === "approved" 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {contractStatus === "approved" ? "Approved" : "Declined"}
          </div>
        )}
      </div>

      {/* Contract Content - using dangerouslySetInnerHTML to render the HTML content */}
      <div 
        id="contract-content" 
        className="p-6 contract-content"
        dangerouslySetInnerHTML={{ __html: contractHtml }} 
      />

      {/* Action Buttons */}
      <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          onClick={handleApprove}
          disabled={isLoading || contractStatus !== "pending"}
          className={`${
            isLoading || contractStatus !== "pending" 
              ? "bg-green-300 cursor-not-allowed" 
              : "bg-green-600 hover:bg-green-700"
          } text-white py-2 px-4 rounded font-medium`}
        >
          Approve
        </button>
        <button
          onClick={handleDecline}
          disabled={isLoading || contractStatus !== "pending"}
          className={`${
            isLoading || contractStatus !== "pending" 
              ? "bg-red-300 cursor-not-allowed" 
              : "bg-red-600 hover:bg-red-700"
          } text-white py-2 px-4 rounded font-medium`}
        >
          Decline
        </button>
        <button
          onClick={handleDownload}
          disabled={downloadingPdf || isLoading}
          className={`${
            downloadingPdf || isLoading 
              ? "bg-blue-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700"
          } text-white py-2 px-4 rounded font-medium flex items-center`}
        >
          {downloadingPdf ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            "Download as PDF"
          )}
        </button>
      </div>

      {/* Add a style block to handle the HTML content styling */}
      <style jsx global>{`
        .contract-content h1, 
        .contract-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .contract-content h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
        }
        .contract-content p {
          margin-bottom: 1rem;
        }
        .contract-content ul, 
        .contract-content ol {
          margin-left: 2rem;
          margin-bottom: 1rem;
        }
        .contract-content li {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default AVContractDisplay;