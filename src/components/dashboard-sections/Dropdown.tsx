"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

interface Option {
  value: string;
  label: string;
}

interface SearchableDropdownProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showSearchbar?: boolean; // Add this new prop
  disabled?: boolean;
}

const SearchablDropdown: React.FC<SearchableDropdownProps> = ({
  // label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  showSearchbar = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="mb-4">
      <label className="block font-roboto text-[16px]  text-secondary mb-1">
        {/* {label} */}
      </label>
      <div className="relative" ref={dropdownRef}>
        <div
          className="flex items-center justify-between w-full px-3 py-3 text-[16px] font-roboto bg-white border border-gray-300 rounded cursor-pointer"
          onClick={toggleDropdown}
        >
          <span
            className={`${!selectedOption ? "text-[#6C757D]" : "text-gray-900"
              }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {isOpen ? <IoIosArrowUp size={16} /> : <IoIosArrowDown size={16} />}
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg">
            {showSearchbar && (
              <div className="p-2 border-b border-gray-200">
                <div className="flex items-center px-2 py-1 bg-gray-50 border border-gray-300 rounded">
                  <input
                    type="text"
                    className="w-full px-2 placeholder:text-secondary py-1 text-sm bg-transparent border-none focus:ring-0 focus:outline-none"
                    placeholder="Search Category"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 
                      ${option.value === value
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : ""
                      }`}
                    onClick={() => handleOptionClick(option.value)}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No options found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchablDropdown;
