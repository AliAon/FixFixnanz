"use client";
import React, { useState } from "react";
import { IoCall, IoCloseOutline } from "react-icons/io5";
import { MdHistory, MdDialpad, MdBackspace } from "react-icons/md";

type PhoneDialerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contactData?: {
    name?: string;
    phone?: string;
    company?: string;
    email?: string;
  };
};

const PhoneDialerModal: React.FC<PhoneDialerModalProps> = ({
  isOpen,
  onClose,
  contactData,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>(
    contactData?.phone ? `+49${contactData.phone}` : "+49"
  );
  const [showDialPad, setShowDialPad] = useState<boolean>(true);
  const [showCallHistory, setShowCallHistory] = useState<boolean>(false);

  if (!isOpen) return null;

  // Sample call history data
  const callHistory = [
    {
      name: "Martin Zenner",
      number: "+49 736 287 61873",
      time: "06.12.2024, 14:30",
      type: "outgoing",
    },
    {
      name: "Saiful Test",
      number: "+49 634 527 34567",
      time: "05.12.2024, 11:15",
      type: "incoming",
    },
    {
      name: "Unknown",
      number: "+49 555 123 456",
      time: "04.12.2024, 16:45",
      type: "missed",
    },
    {
      name: "Customer Support",
      number: "+49 800 123 4567",
      time: "01.12.2024, 10:20",
      type: "outgoing",
    },
    {
      name: "Neue Kunden Service",
      number: "+49 777 888 9999",
      time: "30.11.2024, 09:15",
      type: "incoming",
    },
    {
      name: "Beispiel Marketing",
      number: "+49 123 456 7890",
      time: "29.11.2024, 10:05",
      type: "outgoing",
    },
    {
      name: "Max Mustermann",
      number: "+49 987 654 3210",
      time: "28.11.2024, 15:22",
      type: "missed",
    },
  ];

  const handleNumberClick = (num: string) => {
    setPhoneNumber((prev) => prev + num);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => {
      if (prev.length <= 3) return "+49";
      return prev.slice(0, -1);
    });
  };

  const toggleView = () => {
    setShowDialPad(!showDialPad);
    setShowCallHistory(!showCallHistory);
  };

  // Define dial pad buttons
  const dialPadButtons = [
    { number: "1", letters: "" },
    { number: "2", letters: "ABC" },
    { number: "3", letters: "DEF" },
    { number: "4", letters: "GHI" },
    { number: "5", letters: "JKL" },
    { number: "6", letters: "MNO" },
    { number: "7", letters: "PQRS" },
    { number: "8", letters: "TUV" },
    { number: "9", letters: "WXYZ" },
    { number: "*", letters: "" },
    { number: "0", letters: "" },
    { number: "#", letters: "" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center pt-4 pb-20">
      <div className="w-full max-w-sm bg-gray-900  rounded-lg shadow-lg">
        {/* Header */}
        <div className="bg-white p-3 flex justify-between items-center rounded-t-lg">
          <h2 className="text-black text-sm">Direkter Anruf beim Kunden</h2>
          <button
            onClick={onClose}
            className="text-gray-500 bg-transparent p-0 border-none"
          >
            <IoCloseOutline size={24} />
          </button>
        </div>

        {/* Phone number display */}
        <div className="bg-[#3C4259] px-4 py-6 ">
          <div className="text-xs text-gray-400 text-center">
            Typnummer nach (+49)
          </div>
          <div className="flex justify-between items-center">
            <div className="text-white text-xl font-semibold mt-1">
              {phoneNumber}
            </div>
            <button
              onClick={handleBackspace}
              className="text-gray-400 bg-transparent border-none p-1"
            >
              <MdBackspace size={20} />
            </button>
          </div>
        </div>

        {/* Main content area - Dial Pad or Call History */}
        <div className="bg-[#1e284b] p-3">
          {showDialPad && (
            <div className="grid grid-cols-3 gap-1">
              {dialPadButtons.map((button) => (
                <button
                  key={button.number}
                  onClick={() => handleNumberClick(button.number)}
                  className="flex flex-col items-center bg-transparent p-0 border-none justify-center h-14 w-full rounded-full hover:bg-gray-700 transition-colors"
                >
                  <span className="text-white font-bold font-roboto text-xl">
                    {button.number}
                  </span>
                  {button.letters && (
                    <span className="text-white text-xs">{button.letters}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {showCallHistory && (
            <div>
              {callHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 border-b border-gray-700"
                >
                  <div className="mr-2 text-lg">
                    {item.type === "incoming"
                      ? "↙️"
                      : item.type === "outgoing"
                      ? "↗️"
                      : "❌"}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm">{item.name}</div>
                    <div className="text-gray-400 text-xs flex items-center">
                      <span>{item.number}</span>
                      <span className="mx-1">•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                  <button className="text-green-500 p-1 rounded-full hover:bg-gray-700">
                    <IoCall size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Call button */}
          <div className="flex justify-center mt-4">
            <button className="bg-[#249b42] text-white rounded-full p-3">
              <IoCall size={22} />
            </button>
          </div>
        </div>

        {/* Form fields */}
        <div className="bg-[#3c4259] p-4 space-y-3">
          <div>
            <select className="w-full p-2 text-xs border border-gray-700 bg-gray-800 text-white rounded">
              <option>Select Unternehmen</option>
              {contactData?.company && (
                <option selected>{contactData.company}</option>
              )}
            </select>
          </div>

          <div className="flex items-center">
            <label className="text-white w-24 text-xs">E-Mail</label>
            <input
              className="flex-1 p-2 text-xs border text-black outline-none rounded"
              type="email"
              defaultValue={contactData?.email || ""}
            />
          </div>

          <div className="flex items-center">
            <label className="text-white w-24 text-xs">Vorname</label>
            <input
              className="flex-1 p-2 text-xs border  text-black outline-none rounded"
              type="text"
              defaultValue={
                contactData?.name ? contactData.name.split(" ")[0] : ""
              }
            />
          </div>

          <div className="flex items-center">
            <label className="text-white w-24 text-xs">Nachname</label>
            <input
              className="flex-1 p-2 text-xs border text-black outline-none rounded"
              type="text"
              defaultValue={
                contactData?.name ? contactData.name.split(" ")[1] || "" : ""
              }
            />
          </div>

          <div className="flex items-center">
            <label className="text-white w-24 text-xs">Pipelines</label>
            <select className="flex-1 p-2 text-xs border text-black outline-none rounded">
              <option>Select Pipeline</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="text-white w-24 text-xs">Stages</label>
            <select className="flex-1 p-2 text-xs border text-black outline-none rounded">
              <option>Select Stage</option>
            </select>
          </div>

          <button className="w-full bg-[#0DCAF0] hover:bg-[#31d2f2] duration-150 text-black py-2 rounded text-base">
            Hinzufügen
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-700 rounded-b-lg">
          <button
            onClick={toggleView}
            className={`flex flex-col items-center bg-transparent duration-150 border-none p-1 ${
              !showDialPad ? "text-blue-500" : "text-black"
            }`}
          >
            <MdHistory size={24} />
            <span className="text-base mt-1">Call History</span>
          </button>

          <button
            onClick={toggleView}
            className={`flex flex-col items-center bg-transparent duration-150 border-none p-1 ${
              showDialPad ? "text-blue-500" : "text-black"
            }`}
          >
            <MdDialpad size={24} />
            <span className="text-base mt-1">Dial Pad</span>
          </button>

          <div className="flex space-x-2">
            <button className="bg-green-500 text-white px-3 py-1 rounded text-xs">
              YES
            </button>
            <button className="bg-red-500 text-white px-3 py-1 rounded text-xs">
              NO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneDialerModal;
