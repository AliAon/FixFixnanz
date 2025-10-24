import React, { useState, useRef, useEffect, ReactNode } from "react";
import { FaUsers, FaUserCheck } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { LiaTimesSolid } from "react-icons/lia";
import { LuCalendarDays } from "react-icons/lu";
import { MdVerified, MdFilePresent } from "react-icons/md";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  fetchUsersInfo,
  FetchUsersInfoParams,
  setCurrentFilters,
} from "@/redux/slices/usersSlice";

interface FilterButtonProps {
  icon: ReactNode;
  label: string;
  items: Array<{
    label: string;
    value: string;
  }>;
  onSelect: (value: string) => void;
  isActive?: boolean;
  activeValue?: string;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  icon,
  label,
  items,
  onSelect,
  isActive = false,
  activeValue,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleItemClick = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  // Find the active item to show in button
  const activeItem = items.find(item => item.value === activeValue);
  const buttonLabel = activeItem ? activeItem.label : label;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm font-medium shadow-sm ${
          isActive 
          ? "bg-[#002d51] text-white border-2 border-[#004080] shadow-md transform scale-[1.02]"
          : "bg-white text-[#002d51] border border-[#002d51] hover:bg-[#f8fafc] hover:border-[#004080]"
        }`}
      >
        <span className="text-base">{icon}</span>
        <span className="whitespace-nowrap">{buttonLabel}</span>
        <IoMdArrowDropdown
          size={18}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-full min-w-[200px] bg-white rounded-lg shadow-xl z-20 border border-gray-200 overflow-hidden">
          <div className="py-2">
            {items.map((item, index) => (
              <div
                key={index}
                onClick={() => handleItemClick(item.value)}
                className={`px-4 py-3 hover:bg-[#f8fafc] cursor-pointer transition-colors duration-150 text-sm ${activeValue === item.value
                  ? 'bg-[#002d51] text-white font-medium'
                  : 'text-gray-700 hover:text-[#002d51]'
                  }`}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface StatusFilterProps {
  onSelect: (status: string) => void;
  currentStatus?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
}

const StatusFilter: React.FC<StatusFilterProps> = ({
  onSelect,
  currentStatus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statusOptions = [
    { label: "Active Users", value: "active" },
    { label: "Inactive Users", value: "inactive" },
  ];

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

  const handleStatusSelect = (status: string) => {
    onSelect(status);
    setIsOpen(false);
  };

  const isActive = !!currentStatus;
  const activeStatusOption = statusOptions.find(opt => opt.value === currentStatus);
  const buttonLabel = isActive && activeStatusOption ? activeStatusOption.label : "User Status";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm font-medium shadow-sm ${isActive
          ? "bg-[#002d51] text-white border-2 border-[#004080] shadow-md transform scale-[1.02]"
          : "bg-white text-[#002d51] border border-[#002d51] hover:bg-[#f8fafc] hover:border-[#004080]"
          }`}
      >
        <span className="text-base">
          {currentStatus === 'active' ? (
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          ) : currentStatus === 'inactive' ? (
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          ) : (
            <FaUserCheck />
          )}
        </span>
        <span className="whitespace-nowrap">{buttonLabel}</span>
        <IoMdArrowDropdown
          size={18}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Status Selection Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-full min-w-[200px] bg-white rounded-lg shadow-xl z-20 border border-gray-200 overflow-hidden">
          <div className="py-2">
            <div className="px-4 py-2 bg-[#002d51] text-white text-sm font-medium">
              Select User Status
            </div>
            {statusOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleStatusSelect(option.value)}
                className={`px-4 py-3 hover:bg-[#f8fafc] cursor-pointer transition-colors duration-150 text-sm flex items-center gap-3 ${currentStatus === option.value
                  ? 'bg-[#002d51] text-white font-medium'
                  : 'text-gray-700 hover:text-[#002d51]'
                  }`}
              >
                <div className={`w-3 h-3 rounded-full ${option.value === 'active' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface LargeActionButtonProps {
  icon: ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  isActive?: boolean;
  activeColor: string;
}

const LargeActionButton: React.FC<LargeActionButtonProps> = ({
  icon,
  label,
  description,
  onClick,
  isActive = false,
  activeColor,
}) => {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden group p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${isActive
        ? `${activeColor} border-opacity-50 shadow-lg`
        : "bg-white border-[#002d51]/20 hover:border-[#002d51]/40 hover:shadow-md"
        }`}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${isActive ? 'opacity-10' : ''
        } bg-gradient-to-br from-[#002d51] to-[#004080]`}></div>

      <div className="relative flex flex-col items-center text-center space-y-2">
        <div className={`text-3xl transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#002d51] group-hover:text-[#004080]'
          }`}>
          {icon}
        </div>
        <div>
          <div className={`font-semibold text-sm transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#002d51] group-hover:text-[#004080]'
            }`}>
            {label}
          </div>
          <div className={`text-xs mt-1 transition-colors duration-300 ${isActive ? 'text-white/80' : 'text-gray-600 group-hover:text-[#002d51]/80'
            }`}>
            {description}
          </div>
        </div>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        </div>
      )}
    </button>
  );
};

const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [currentFilters, setLocalCurrentFilters] =
    useState<FetchUsersInfoParams>({
      page: 1,
      limit: 20,
    });

  // Apply filters and fetch data
  const applyFilters = (newFilters: Partial<FetchUsersInfoParams>) => {
    const updatedFilters = {
      ...currentFilters,
      ...newFilters,
      page: 1, // Reset to first page when applying new filters
    };
    
    // Remove undefined values from filters
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key as keyof FetchUsersInfoParams] === undefined) {
        delete updatedFilters[key as keyof FetchUsersInfoParams];
      }
    });
    
    setLocalCurrentFilters(updatedFilters);
    // Save filters to Redux state for pagination
    dispatch(setCurrentFilters(updatedFilters));
    dispatch(fetchUsersInfo(updatedFilters));
  };

  // Role filter options
  const roleItems = [
    { label: "👤 Agency Users", value: "user" },
    { label: "💼 Premiumn Advisors", value: "financial-advisor" },
    { label: "🆓 Free Advisors", value: "free-advisor" },
    { label: "👑 Administrators", value: "admin" },
  ];

  console.debug("Role items:", roleItems);

  // Registration date filter options
  const registrationDateItems = [
    { label: "📅 Today", value: "today" },
    { label: "📊 Last 7 days", value: "last_7_days" },
    { label: "📈 Last 30 days", value: "last_month" },
    { label: "🗓️ Last 3 months", value: "last_3_months" },
    { label: "📋 Last year", value: "last_year" },
  ];

  console.debug("Registration date items:", registrationDateItems);

  const handleRoleFilter = (value: string) => {
    // If the same filter is already active, remove it (toggle off)
    if (currentFilters.role === value) {
      const newFilters = { ...currentFilters };
      delete newFilters.role;
      applyFilters({ 
        ...newFilters,
        role: undefined 
      });
    } else {
      applyFilters({ role: value });
    }
  };

  const handleStatusFilter = (status: string, duration?: string) => {
    if (status === 'active') {
  // Remove inactive filters and set active filters
      const newFilters = { ...currentFilters };
      delete newFilters.inactive;
      applyFilters({
        ...newFilters,
        status: 'active',
        last_login: duration,
        inactive: undefined
      });
    } else if (status === 'inactive') {
      // Remove active filters and set inactive filters
      const newFilters = { ...currentFilters };
      delete newFilters.last_login;
      applyFilters({
        ...newFilters,
        status: 'inactive',
        inactive: duration,
        last_login: undefined
      });
    }
  };

  const handleRegistrationDateFilter = (value: string) => {
    // If the same filter is already active, remove it (toggle off)
    if (currentFilters.registration_date === value) {
      const newFilters = { ...currentFilters };
      delete newFilters.registration_date;
      applyFilters({ 
        ...newFilters,
        registration_date: undefined 
      });
    } else {
      applyFilters({ registration_date: value });
    }
  };

  const handleContractUploadedFilter = () => {
    // Toggle contract uploaded filter
    if (currentFilters.contract_uploaded) {
      const newFilters = { ...currentFilters };
      delete newFilters.contract_uploaded;
      applyFilters({ 
        ...newFilters,
        contract_uploaded: undefined 
      });
    } else {
      applyFilters({ contract_uploaded: true });
    }
  };

  const handleEmailVerifiedFilter = () => {
    // Toggle email verified filter
    if (currentFilters.email_verified) {
      const newFilters = { ...currentFilters };
      delete newFilters.email_verified;
      applyFilters({
        ...newFilters,
        email_verified: undefined
      });
    } else {
      applyFilters({ email_verified: true });
    }
  };

  const handleReset = () => {
    const resetFilters: FetchUsersInfoParams = {
      page: 1,
      limit: 20,
    };
    setLocalCurrentFilters(resetFilters);
    // Save reset filters to Redux state
    dispatch(setCurrentFilters(resetFilters));
    dispatch(fetchUsersInfo(resetFilters));
  };

  // Count active filters
  const activeFiltersCount = Object.keys(currentFilters).filter(
    key => key !== 'page' && key !== 'limit' && currentFilters[key as keyof FetchUsersInfoParams] !== undefined
  ).length;

  // Load initial data on component mount
  useEffect(() => {
    // Load all users initially (no filters)
    const initialFilters = { page: 1, limit: 20 };
    dispatch(setCurrentFilters(initialFilters));
    dispatch(fetchUsersInfo(initialFilters));
  }, [dispatch]);

  return (
    <div className="bg-gradient-to-r from-[#f8fafc] to-[#f1f5f9] mb-5 p-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-[#002d51] flex items-center gap-3">
          <FaUsers className="text-[#002d51]" />
          Alle Benutzer
          {activeFiltersCount > 0 && (
            <span className="bg-[#002d51] text-white text-sm px-2 py-1 rounded-full font-medium">
              {activeFiltersCount} Filter aktiv
            </span>
          )}
        </h1>
      </div>

      {/* Modernes abgerundetes Karten-Design für Filter */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#002d51]/10 p-6">
        {/* Zwei-Sektionen-Layout: Links (Filter + Zurücksetzen) und Rechts (Schnellaktionen) */}
        <div className="flex justify-between items-start gap-8">
          {/* Linke Sektion: Filter + Zurücksetzen-Button */}
          <div className="flex-1">
            {/* Filter-Sektions-Header */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-[#002d51] rounded-full"></div>
              <h3 className="text-lg font-semibold text-[#002d51]">Benutzer filtern</h3>
            </div>

            {/* Obere Zeile: Filter-Dropdowns */}
            <div className="flex flex-wrap gap-3 mb-4">
              <FilterButton
                icon={<FaUsers />}
                label="Nach Rolle filtern"
                items={[
                  { label: "👤 Agency Advisor", value: "user" },
                  { label: "💼 Premium Advisors", value: "financial-advisor" },
                  { label: "🆓 Free Advisors", value: "free-advisor" },
                  { label: "👑 Administratoren", value: "admin" },
                  { label: "👤 Co-Admin", value: "co-admin" },
                  { label: "💼 Manager", value: "Manager" },
                ]}
                onSelect={handleRoleFilter}
                isActive={!!currentFilters.role}
                activeValue={currentFilters.role}
              />

              <StatusFilter
                onSelect={handleStatusFilter}
                currentStatus={currentFilters.status}
              />

              <FilterButton
                icon={<LuCalendarDays />}
                label="Registrierungsdatum"
                items={[
                  { label: "📅 Heute", value: "today" },
                  { label: "📊 Letzte 7 Tage", value: "last_7_days" },
                  { label: "📈 Letzte 30 Tage", value: "last_month" },
                  { label: "🗓️ Letzte 3 Monate", value: "last_3_months" },
                  { label: "📋 Letztes Jahr", value: "last_year" }
                ]}
                onSelect={handleRegistrationDateFilter}
                isActive={!!currentFilters.registration_date}
                activeValue={currentFilters.registration_date}
              />

              <button
                onClick={handleReset}
                className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              >
                <LiaTimesSolid size={18} />
                Reset
                {activeFiltersCount > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Rechte Sektion: Schnellaktionen */}
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-[#002d51] rounded-full"></div>
              <h3 className="text-lg font-semibold text-[#002d51]">Schnellaktionen</h3>
            </div>

            <div className="flex gap-4">
              <LargeActionButton
                icon={<MdFilePresent />}
                label="Vertragsstatus"
                description="Benutzer mit hochgeladenen Verträgen"
                onClick={handleContractUploadedFilter}
                isActive={!!currentFilters.contract_uploaded}
                activeColor="bg-gradient-to-br from-blue-500 to-blue-600"
              />

              <LargeActionButton
                icon={<MdVerified />}
                label="E-Mail-Status"
                description="Benutzer mit verifizierten E-Mails"
                onClick={handleEmailVerifiedFilter}
                isActive={!!currentFilters.email_verified}
                activeColor="bg-gradient-to-br from-green-500 to-green-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;