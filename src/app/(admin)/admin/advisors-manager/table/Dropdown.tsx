import React, { useState, useRef, useEffect, ReactNode } from "react";
import { IoMdArrowDropdown } from "react-icons/io";

interface DropdownItem {
  label: string;
  action: () => void;
  icon?: ReactNode;
  color?: string;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  variant?: "primary" | "secondary";
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  items,
  variant = "primary",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (e: React.MouseEvent) => {
    // Prevent event from propagating
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
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

  const handleItemClick = (
    item: DropdownItem, 
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    console.log("object");

    // Prevent event from propagating
    e.stopPropagation();
    
    // Call the item's action
    item.action();
    
    // Close dropdown
    setIsOpen(false);
  };

  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      // Prevent dropdown from closing when clicking inside
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={toggleDropdown}
        className={`flex items-center ${
          variant === "primary"
            ? "bg-gray-800 hover:bg-gray-900 text-white"
            : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700"
        } px-3 py-1 rounded text-sm`}
      >
        {label}{" "}
        <span className="ml-1">
          <IoMdArrowDropdown size={20} />
        </span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-1 w-40 p-2 border border-gray-300 bg-white rounded-md shadow-lg z-10"
          // Additional prevention of event propagation
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <div
                key={index}
                onClick={(e) => handleItemClick(item, e)}
                className={`block w-full text-left px-4 py-2 text-sm mb-1 rounded-md cursor-pointer ${
                  item.color 
                    ? `${item.color} text-white` 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center">
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;