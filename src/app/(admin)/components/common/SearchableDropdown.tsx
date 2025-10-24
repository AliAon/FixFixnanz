import { useState, useEffect, useRef } from 'react';
import { IoMdArrowDropdown } from 'react-icons/io';

interface Option {
  value: string;
  label: string;
}

interface SearchableDropdownProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showSearchbar?: boolean;
  disabled?: boolean;
}

export default function SearchableDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  showSearchbar = true,
  disabled = false
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        className={`relative border border-gray-300 rounded-md ${
          disabled ? 'bg-gray-100' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between p-2 cursor-pointer ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={`block truncate ${!selectedOption ? 'text-gray-400' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <IoMdArrowDropdown
            className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            {showSearchbar && (
              <div className="p-2 border-b">
                <input
                  type="text"
                  className="w-full p-1 text-sm border border-gray-300 rounded"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            <ul className="max-h-60 overflow-auto">
              {filteredOptions.map((option) => (
                <li
                  key={option.value}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    option.value === value ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </li>
              ))}
              {filteredOptions.length === 0 && (
                <li className="px-4 py-2 text-gray-500">No options found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 