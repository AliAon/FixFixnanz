import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { BsQuestionCircleFill } from "react-icons/bs";
import { FaTools } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoIosAdd } from "react-icons/io";
import { IoCall } from "react-icons/io5";
import { PiExportBold } from "react-icons/pi";
import PhoneDialerModal from "./PhoneDialerModal"; // Import the PhoneDialerModal component

interface MobileHeaderProps {
  onManagePipelineClick: () => void;
  onNewDealClick: () => void;
  onImportContactClick: () => void;
  onStrategyPreparationClick: () => void;
  contactCount: number;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  onManagePipelineClick,
  onNewDealClick,
  onImportContactClick,
  onStrategyPreparationClick,
  contactCount,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Add state for the phone dialer modal
  const [isDialerOpen, setIsDialerOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to open the phone dialer
  const openPhoneDialer = () => {
    setIsDialerOpen(true);
  };

  // Function to close the phone dialer
  const closePhoneDialer = () => {
    setIsDialerOpen(false);
  };

  return (
    <div className="bg-base text-white">
      <div className="flex justify-between items-center p-4">
        <Link
          href=""
          onClick={toggleMenu}
          className="text-black rounded p-2"
          aria-label="Toggle menu"
        >
          <FiMenu size={24} />
        </Link>
      </div>

      <div className={`${isMenuOpen ? "block" : "hidden"} px-4 pb-4`}>
        <button
          onClick={onManagePipelineClick}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded w-full flex items-center justify-center mb-4"
        >
          <FaTools className="mr-2" />
          <span>Manage pipeline</span>
        </button>

        <div className="flex items-center justify-between py-3 border-b border-gray-700">
          <span className="font-semibold">All contacts</span>
          <span className="bg-yellow-400 text-black rounded-full px-2 py-0.5 text-xs">
            {contactCount}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-700">
          <span className="font-semibold">Pipelines</span>
          <IoMdArrowDropdown size={20} />
        </div>

        <div
          className="flex items-center py-3 border-b border-gray-700 cursor-pointer"
          onClick={onNewDealClick}
        >
          <IoIosAdd size={20} className="mr-2" />
          <span className="font-semibold">New deal</span>
        </div>

        <div
          className="flex items-center py-3 border-b border-gray-700 cursor-pointer"
          onClick={onImportContactClick}
        >
          <PiExportBold size={20} className="mr-2" />
          <span className="font-semibold">Import contacts</span>
        </div>
        <div
          className="flex items-center py-3 border-b border-gray-700 cursor-pointer"
          onClick={onStrategyPreparationClick}
        >
          <BsQuestionCircleFill size={20} className="mr-2" />
          <span>Strategy preparation</span>
        </div>
        <Link
          href="/admin/co-admin-contact"
          className="flex items-center bg-white mt-3 border-b border-gray-700 w-[80px] p-2 rounded-md font-semibold"
        >
          <Image
            src="/images/icons/hubspot.png"
            alt="hubspot"
            width={80}
            height={80}
          />
        </Link>
        {/* Update the Call button to open the Phone Dialer */}
        <button
          onClick={openPhoneDialer}
          className="flex items-center bg-[#198754] w-[80px] mt-3 p-2 rounded-md font-semibold"
        >
          <IoCall className="mr-1" /> Call
        </button>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Search..."
            className="bg-white text-gray-800 rounded py-2 px-4 w-full"
          />
        </div>
      </div>

      {/* Add the PhoneDialerModal component */}
      <PhoneDialerModal
        isOpen={isDialerOpen}
        onClose={closePhoneDialer}
        contactData={{
          name: "",
          phone: "",
          company: "",
          email: "",
        }}
      />
    </div>
  );
};

export default MobileHeader;
