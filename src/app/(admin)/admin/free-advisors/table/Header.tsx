import Image from "next/image";
import React, { useState,  useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LiaTimesSolid } from "react-icons/lia";
import { AppDispatch, RootState } from "@/redux/store";
import { 
  fetchFinancialAdvisorUsers, 
  setFinancialAdvisorCurrentFilters,
  FetchFinancialAdvisorUsersParams 
} from "@/redux/slices/usersSlice";

// interface DropdownProps {
//   label: string;
//   options?: string[];
// }

// const Dropdown: React.FC<DropdownProps> = ({
//   label,
//   options = ["Option 1", "Option 2", "Option 3"],
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedOption, setSelectedOption] = useState(label);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleOptionSelect = (option: string) => {
//     setSelectedOption(option);
//     setIsOpen(false);
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="w-full px-4 py-[6px] text-left bg-white border border-gray-300 rounded-md flex justify-between items-center"
//         type="button"
//         aria-haspopup="true"
//         aria-expanded={isOpen}
//       >
//         <span className="text-gray-800 font-normal text-base">
//           {selectedOption}
//         </span>
//         <svg
//           className="w-5 h-5 text-gray-500"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="2"
//             d="M19 9l-7 7-7-7"
//           ></path>
//         </svg>
//       </button>

//       {isOpen && (
//         <div className="absolute left-0 mt-1 w-full bg-white rounded-md shadow-lg z-10 border border-gray-200">
//           <div className="py-1">
//             {options.map((option, index) => (
//               <div
//                 key={index}
//                 className="px-4 py-2 text-sm text-gray-700 hover:text-white hover:bg-[#0D6EFD] cursor-pointer"
//                 onClick={() => handleOptionSelect(option)}
//               >
//                 {option}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { financialAdvisorCurrentFilters } = useSelector((state: RootState) => state.users);
  const [localCurrentFilters, setLocalCurrentFilters] = useState<FetchFinancialAdvisorUsersParams>({});

  // Initialize local filters from Redux state
  useEffect(() => {
    setLocalCurrentFilters(financialAdvisorCurrentFilters);
  }, [financialAdvisorCurrentFilters]);

  const applyFilters = (newFilters: Partial<FetchFinancialAdvisorUsersParams>) => {
    const updatedFilters = {
      ...localCurrentFilters,
      ...newFilters,
      page: 1, // Reset to first page when applying new filters
      limit: 10, // Keep the same limit
    };

    setLocalCurrentFilters(updatedFilters);
    // Save filters to Redux state
    dispatch(setFinancialAdvisorCurrentFilters(updatedFilters));
    dispatch(fetchFinancialAdvisorUsers(updatedFilters));
  };

  const handleEmailVerifiedFilter = () => {
    // Toggle email verified filter
    const newEmailVerifiedValue = localCurrentFilters.email_verified ? undefined : true;
    const updatedFilters = { ...localCurrentFilters };
    
    if (newEmailVerifiedValue === undefined) {
      delete updatedFilters.email_verified;
    } else {
      updatedFilters.email_verified = newEmailVerifiedValue;
    }
    
    applyFilters(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters: FetchFinancialAdvisorUsersParams = {
      page: 1,
      limit: 10,
    };
    setLocalCurrentFilters(resetFilters);
    // Save reset filters to Redux state
    dispatch(setFinancialAdvisorCurrentFilters(resetFilters));
    dispatch(fetchFinancialAdvisorUsers(resetFilters));
  };

  // Load initial data on component mount
  useEffect(() => {
    // Load all financial advisors initially (no filters)
    const initialFilters = { page: 1, limit: 10 };
    dispatch(setFinancialAdvisorCurrentFilters(initialFilters));
    dispatch(fetchFinancialAdvisorUsers(initialFilters));
  }, [dispatch]);

  return (
    <div className="p-4">
      <h1 className="text-4xl font-semibold text-[#32325D] mb-6">
        Free Advisors
      </h1>

      <div className="flex items-center xsm:items-end sm:items-end sm:flex-col xsm:flex-col justify-between">
        <div className="flex flex-wrap items-center gap-8  w-full">
          {" "}
          {/* <div className="w-full max-w-xs">
            <Dropdown label="Free advisors" options={advisorOptions} />
          </div> */}
          <div className="flex items-center mx-4 space-x-2">
            {/* <Link href="">
              <Image
                src="/images/icons/file.png"
                alt="file"
                width={80}
                height={80}
              />
            </Link> */}
            <button
              onClick={handleEmailVerifiedFilter}
              className={`border-none bg-transparent hover:opacity-70 transition-all duration-200 rounded-lg p-2 ${
                localCurrentFilters.email_verified ? 'bg-blue-100 border-2 border-blue-500' : ''
              }`}
              title="Filter by Email Verified"
            >
              <Image
                src="/images/icons/email.png"
                alt="Filter by Email Verified"
                width={60}
                height={60}
              />
            </button>
          </div>
          
          {/* Active filters indicator */}
          {localCurrentFilters.email_verified && (
            <div className="flex items-center space-x-2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                Email Verified Filter Active
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleReset}
          className="border border-primary bg-white text-primary hover:bg-primary hover:text-white duration-150 rounded-md px-4 py-2 flex items-center"
          type="button"
        >
          <LiaTimesSolid size={24} className="mr-2 font-bold" />
          Reset
        </button>
      </div>
    </div>
  );
};

export default Header;
