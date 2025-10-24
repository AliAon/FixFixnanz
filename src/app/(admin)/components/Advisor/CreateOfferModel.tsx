// File: app/components/Advisor/CreateOfferModal.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Editor } from "primereact/editor";

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateOfferModal = ({ isOpen, onClose }: CreateOfferModalProps) => {
  const [items, setItems] = useState<{ id: number }[]>([{ id: 1 }]);
  const [betrag, setBetrag] = useState<string>("0.00");
  const [serviceBetrag, setServiceBetrag] = useState<string>("0.00");
  const [bezahltBetrag, setBezahltBetrag] = useState<string>("0.00");
  const [editorContent, setEditorContent] = useState<string>("");

  // Calculate totals
  const zwischenbetrag = parseFloat(betrag || "0");
  const umsatzsteuer = zwischenbetrag * 0.19;
  const gesamtbetrag = zwischenbetrag + umsatzsteuer;
  const falligerBetrag = gesamtbetrag - parseFloat(bezahltBetrag || "0");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { id: items.length + 1 }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving new offer", { editorContent });
    onClose();
  };

  // Editor header template for toolbar
  const editorHeader = (
    <span className="ql-formats">
      <button className="ql-bold" aria-label="Bold"></button>
      <button className="ql-italic" aria-label="Italic"></button>
      <button className="ql-underline" aria-label="Underline"></button>
      <button className="ql-strike" aria-label="Strike"></button>
      <button
        className="ql-list"
        value="ordered"
        aria-label="Ordered List"
      ></button>
      <button
        className="ql-list"
        value="bullet"
        aria-label="Bullet List"
      ></button>
    </span>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl my-8">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-700">
            Erstelle ein neues Angebot
          </h2>
          <Link
            href=""
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Datum</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="mm/dd/yyyy"
                  className="block w-full p-2.5 bg-white border border-gray-300 rounded-md"
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Angebotstitelt
              </label>
              <div className="relative">
                <select className="block w-full p-2.5 bg-white border border-gray-300 rounded-md appearance-none">
                  <option value="">Select Offer</option>
                  <option value="basic">Basic Package</option>
                  <option value="premium">Premium Package</option>
                  <option value="enterprise">Enterprise Package</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Setter</label>
              <div className="relative">
                <select className="block w-full p-2.5 bg-white border border-gray-300 rounded-md appearance-none">
                  <option value="">Select Setter</option>
                  <option value="john">John Doe</option>
                  <option value="jane">Jane Smith</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Closer</label>
              <div className="relative">
                <select className="block w-full p-2.5 bg-white border border-gray-300 rounded-md appearance-none">
                  <option value="">Select Closer</option>
                  <option value="mike">Mike Johnson</option>
                  <option value="sarah">Sarah Williams</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Titel</label>
              <input
                type="text"
                className="block w-full p-2.5 bg-white border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Type</label>
              <input
                type="text"
                className="block w-full p-2.5 bg-white border border-gray-300 rounded-md"
                value="Monthly"
                readOnly
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">Betrag</label>
              <input
                type="text"
                className="block w-full p-2.5 bg-white border border-gray-300 rounded-md"
                value={betrag}
                onChange={(e) => setBetrag(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2 text-sm font-medium">Beginn</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="mm/dd/yyyy"
                  className="block w-full p-2.5 bg-white border border-gray-300 rounded-md"
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                className="p-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="border border-gray-300 rounded-md">
              {/* PrimeReact Editor */}
              <Editor
                style={{ height: "200px" }}
                value={editorContent}
                onTextChange={(e) => setEditorContent(e.htmlValue || "")}
                headerTemplate={editorHeader}
              />
            </div>
          </div>

          <div className="mb-6">
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
              onClick={handleAddItem}
            >
              <span className="mr-2">+</span>
              hinzufügen
            </button>
          </div>

          <hr className="my-6" />

          <div className="grid grid-cols-2 gap-4 mb-4 mt-6">
            <div></div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Zwischenbetrag (netto) :</span>
                <span>{zwischenbetrag.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Umsatzsteuer: (USt 19%):</span>
                <span>{umsatzsteuer.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Gesamtbetrag :</span>
                <span>{gesamtbetrag.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Service Betrag:</span>
                <input
                  type="text"
                  className="w-40 p-2 border border-gray-300 rounded-md text-right"
                  value={serviceBetrag}
                  onChange={(e) => setServiceBetrag(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Bezahlter Betrag:</span>
                <input
                  type="text"
                  className="w-40 p-2 border border-gray-300 rounded-md text-right"
                  value={bezahltBetrag}
                  onChange={(e) => setBezahltBetrag(e.target.value)}
                />
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Fälliger Betrag:</span>
                <span>{falligerBetrag.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8 space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOfferModal;
