/* eslint-disable  @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { acceptAdvisorContract, fetchAdvisorProfile } from "@/redux/slices/advisorsSlice";
import { toast } from "react-toastify";
import Loader from "@/components/shared/Loader/Loader";

interface ContractModalProps {
  contract: any;
  isLoading: boolean;
  user: any;
  currentAdvisor: any;
  onAccept: () => void;
}

const ContractModal: React.FC<ContractModalProps> = ({
  contract,
  isLoading,
  user,
  onAccept
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [contractHtml, setContractHtml] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Set contract HTML content and replace placeholders with user data
  useEffect(() => {
    if (contract?.body && user) {
      let processedHtml = contract.body;

      // Format current date as DD.MM.YYYY (e.g., 16.10.2025)
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const formattedDate = `${day}.${month}.${year}`;

      // Format place as "postal_code city" (e.g., "13037 Berlin")
      const place = [user.postal_code, user.city]
        .filter(Boolean)
        .join(' ') || '';

      // Replace placeholders with actual user data
      const placeholders: Record<string, string> = {
        '[first_name]': user.first_name || '',
        '[last_name]': user.last_name || '',
        '[email]': user.email || '',
        '[number]': user.phone || '',
        '[address]': [
          user.address,
          user.city,
          user.state,
          user.postal_code,
          user.country
        ].filter(Boolean).join(', ') || '',
        '[company]': user.company_name || '',
        '[place]': place,
        '[date]': formattedDate,
      };

      // Replace each placeholder in the HTML
      Object.entries(placeholders).forEach(([placeholder, value]) => {
        const escapedPlaceholder = placeholder.replace(/[[\]]/g, '\\$&');
        processedHtml = processedHtml.replace(
          new RegExp(escapedPlaceholder, 'g'),
          value || '<span style="color: #999; font-style: italic;">Not provided</span>'
        );
      });

      setContractHtml(processedHtml);
    }
  }, [contract, user]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrolledToBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (scrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAcceptContract = async () => {
    setIsAccepting(true);
    try {
      await dispatch(acceptAdvisorContract()).unwrap();
      await dispatch(fetchAdvisorProfile()).unwrap();
      toast.success("Contract accepted successfully!");
      onAccept();
    } catch (error) {
      console.error("Failed to accept contract:", error);
      toast.error("Failed to accept contract. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-70 z-[9998]"
        style={{ backdropFilter: "blur(4px)" }}
      />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
          {/* Header */}
          <div className="bg-[#03254c] text-white p-6 rounded-t-lg flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Advisor Contract - Acceptance Required ggg
                </h2>
                <p className="mt-2 text-sm text-gray-200">
                  You must read and accept the contract to use the platform
                </p>
              </div>
              <div className="text-yellow-300 text-4xl">⚠️</div>
            </div>
          </div>

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto p-6 contract-content bg-gray-50"
            onScroll={handleScroll}
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
                <p className="ml-4">Loading contract...</p>
              </div>
            ) : contractHtml ? (
              <div className="bg-white p-6 rounded-lg shadow-sm" dangerouslySetInnerHTML={{ __html: contractHtml }} />
            ) : (
              <div className="p-6 bg-yellow-100 text-yellow-700 rounded">
                <p className="font-bold">Contract not loaded yet. Please wait...</p>
                <p className="mt-2 text-sm">If this persists, contact support.</p>
              </div>
            )}
          </div>

          {/* Scroll Indicator */}
          {!hasScrolledToBottom && contractHtml && (
            <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200 flex-shrink-0 animate-pulse">
              <p className="text-sm text-yellow-800 text-center font-semibold">
                ⬇️ Please scroll to the bottom to read the entire contract before accepting
              </p>
            </div>
          )}

          {/* Footer - ONLY ACCEPT BUTTON */}
          <div className="bg-white p-6 border-t-2 border-gray-200 rounded-b-lg flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                {hasScrolledToBottom ? (
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-2xl">✓</span>
                    <span className="text-green-600 font-semibold">
                      You&apos;ve read the entire contract
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">
                    📄 Please read the entire contract
                  </span>
                )}
              </div>

              {/* ONLY ACCEPT BUTTON - NO "MAYBE LATER" BUTTON */}
              <button
                onClick={handleAcceptContract}
                disabled={!hasScrolledToBottom || isAccepting}
                className={`${!hasScrolledToBottom || isAccepting
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow-lg"
                  } text-white py-3 px-8 rounded-lg font-bold transition-all duration-200 flex items-center text-lg`}
              >
                {isAccepting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Accepting...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✓</span>
                    I Accept the Contract
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center border-t pt-4">
              By clicking &quot;I Accept the Contract&quot;, you agree to all terms and conditions outlined in this document.
              This action will be recorded with a timestamp.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .contract-content h1, 
        .contract-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
          margin-top: 1.5rem;
          color: #1f2937;
        }
        .contract-content h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
          margin-top: 1rem;
          color: #374151;
        }
        .contract-content p {
          margin-bottom: 1rem;
          line-height: 1.6;
          color: #4b5563;
        }
        .contract-content ul, 
        .contract-content ol {
          margin-left: 2rem;
          margin-bottom: 1rem;
        }
        .contract-content li {
          margin-bottom: 0.5rem;
          color: #4b5563;
        }
        .contract-content strong {
          font-weight: 600;
          color: #1f2937;
        }
      `}</style>
    </>
  );
};

export default ContractModal;