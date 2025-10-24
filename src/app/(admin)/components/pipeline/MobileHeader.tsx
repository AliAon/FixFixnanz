import Link from "next/link";
import React, { useState } from "react";
import { FaTools } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { IoMdArrowDropdown } from "react-icons/io";
import { IoIosAdd } from "react-icons/io";
import { PiExportBold } from "react-icons/pi";

interface MobileHeaderProps {
  onManagePipelineClick: () => void;
  onPropertiesClick: () => void;
  onNewDealClick: () => void;
  onImportContactClick: () => void;
  contactCount: number;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  onManagePipelineClick,
  onPropertiesClick,
  onNewDealClick,
  onImportContactClick,
  contactCount,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
          onClick={onPropertiesClick}
        >
          <FiMenu className="mr-2" />
          <span className="font-semibold">properties</span>
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

        <div className="mt-4">
          <input
            type="text"
            placeholder="Search..."
            className="bg-white text-gray-800 rounded py-2 px-4 w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
