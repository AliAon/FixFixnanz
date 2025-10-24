"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoIosMail } from "react-icons/io";
import { RiDashboard3Fill, RiContactsBook2Fill } from "react-icons/ri";
import { FaUser, FaStar, FaListUl, FaKey, FaUsers } from "react-icons/fa";
import { FaCartShopping, FaKitMedical } from "react-icons/fa6";
import { IoSettings } from "react-icons/io5";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BsBank2 } from "react-icons/bs";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { fetchPipelines } from "@/redux/slices/pipelineSlice";
import { AppDispatch } from "@/redux/store";

interface SidebarProps {
  isOpen: boolean;
}

// Updated interface to include roles for submenu items
interface NavItem {
  icon: React.ReactNode;
  text: string;
  href: string;
  hasSubmenu?: boolean;
  notification?: number;
  submenuItems?: { text: string; href: string; roles?: ("admin" | "financial-advisor")[] }[];
  roles?: ("admin" | "financial-advisor")[];
  isDynamicSubmenu?: boolean;
}

interface NavSectionItem {
  icon: React.ReactNode;
  text: string;
  href: string;
  hasSubmenu?: boolean;
  notification?: number;
  submenuItems?: { text: string; href: string; roles?: ("admin" | "financial-advisor")[] }[];
  roles?: ("admin" | "financial-advisor")[];
  isDynamicSubmenu?: boolean;
}

const NAV_SECTIONS: {
  CUSTOMER_OVERVIEW: NavSectionItem[];
  EXTRAS: NavSectionItem[];
} = {
  CUSTOMER_OVERVIEW: [
    {
      icon: <RiDashboard3Fill size={18} />,
      text: "DASHBOARD",
      href: "/admin",
      roles: ["admin", "financial-advisor"],
    },
    {
      icon: <FaUser size={18} />,
      text: "PROFIL",
      href: "/admin/manage-profile",
      roles: ["admin", "financial-advisor"],
    },
    {
      icon: <FaUser size={18} />,
      text: "Neukunden gewinnen",
      href: "/admin/get-new-clients",
      roles: ["admin", "financial-advisor"],
    },
    {
      icon: <FaCartShopping size={18} />,
      text: "BERATUNGEN",
      href: "/admin/consultations",
      hasSubmenu: true,
      roles: ["admin", "financial-advisor"],
      submenuItems: [
        { text: "AKTIVE BERATUNGEN", href: "/admin/active-orders" },
        { text: "ALLE BERATUNGEN", href: "/admin/orders" },
      ],
    },
    {
      icon: <FaKitMedical size={18} />,
      text: "VERWALTUNG",
      href: "/admin/management",
      hasSubmenu: true,
      roles: ["admin", "financial-advisor"],
      submenuItems: [
        { text: "My calendar", href: "/admin/calender" },
        { text: "E-Mail Signature", href: "/admin/signatures" },
        { text: "Locations", href: "/admin/meeting" },
      ],
    },
    {
      icon: <RiContactsBook2Fill size={18} />,
      text: "PIPELINES",
      href: "/admin/pipelines",
      hasSubmenu: true,
      isDynamicSubmenu: true,
      roles: ["admin", "financial-advisor"],
      submenuItems: [
        { text: "Overview Menu", href: "/admin/overview" },
      ],
    },
    {
      icon: <RiContactsBook2Fill size={18} />,
      text: "KUNDENVERTRÄGE",
      href: "/admin/contracts",
      hasSubmenu: true,
      roles: ["admin", "financial-advisor"],
      submenuItems: [
        { text: "Contract overview", href: "/admin/advisor-contracts" },
        { text: "Contract Categorie", href: "/admin/contract-categories", roles: ["admin"] }, // Only for admin
      ],
    },
    {
      icon: <FaStar size={18} />,
      text: "MEINE BEWERTUNGEN",
      href: "/admin/ratings",
      hasSubmenu: true,
      roles: ["admin", "financial-advisor"],
      submenuItems: [{ text: "All reviews", href: "/admin/ratings" }],
    },
    {
      icon: <FaListUl size={18} />,
      text: "SERVICE CATEGORY",
      href: "/admin/categories",
      hasSubmenu: true,
      roles: ["admin"],
      submenuItems: [
        { text: "CATEGORY", href: "/admin/categories" },
        { text: "SUB-CATEGORY", href: "/admin/sub-category" },
      ],
    },
    {
      icon: <BsBank2 size={18} />,
      text: "COMPANY",
      href: "/admin/company",
      hasSubmenu: false,
      roles: ["admin"],
    },
    {
      icon: <FaListUl size={18} />,
      text: "Support for Financial Advisors",
      href: "/admin/support",
      hasSubmenu: true,
      roles: ["admin"],
      submenuItems: [
        { text: "Support CATEGORY", href: "/admin/support-categories" },
        { text: "question & answer", href: "/admin/support-question-answer" },
        { text: "welcome message", href: "/admin/welcome-message" },
      ],
    },
    {
      icon: <FaKey size={18} />,
      text: "Roles and permission",
      href: "/admin/roles",
      hasSubmenu: false,
      roles: ["admin"],
    },
    {
      icon: <FaUsers size={18} />,
      text: "All USERS",
      href: "/admin/users",
      hasSubmenu: false,
      roles: ["admin"],
    },
    {
      icon: <FaUser size={18} />,
      text: "lead pool",
      href: "/admin/lead",
      hasSubmenu: true,
      roles: ["admin"],
      submenuItems: [
        { text: "create form", href: "/admin/forms" },
        { text: "leadpool pipeline", href: "/admin/leadpool-pipeline" },
      ],
    },
    {
      icon: <FaUser size={18} />,
      text: "agency",
      href: "/admin/agency",
      hasSubmenu: true,
      roles: ["admin"],
      submenuItems: [
        { text: "agency reports", href: "/admin/user-report" },
        { text: "agency advisors", href: "/admin/agency-advisor" },
        { text: "facebook campaigns", href: "/admin/active-campaigns" },
        { text: "agency pipeline", href: "/admin/agency-pipeline" },
        { text: "hubspost co-admin", href: "/admin/co-admin" },
        { text: "hubspost appointment", href: "/admin/co-admin-appoinment" },
      ],
    },
  ],
  EXTRAS: [
    {
      icon: <IoSettings size={18} />,
      text: "Einstellungen",
      href: "/admin/settings",
      roles: ["admin", "financial-advisor"],
    },
  ],
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const pathname = usePathname();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { pipelines } = useSelector((state: RootState) => state.pipeline);
  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role || "financial-advisor";

  // Check email verification status from localStorage and Redux
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(true);

  useEffect(() => {
    // Check email verification from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setIsEmailVerified(parsedUser.email_verified !== false);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setIsEmailVerified(true); // Default to true if parsing fails
      }
    }

    // Also check from Redux state if available
    if (user?.isEmailVerified !== undefined) {
      setIsEmailVerified(user.isEmailVerified);
    }
  }, [user]);

  useEffect(() => {
    dispatch(fetchPipelines());
  }, [dispatch]);

  useEffect(() => {
    const filteredSections = {
      CUSTOMER_OVERVIEW: NAV_SECTIONS.CUSTOMER_OVERVIEW.filter(
        (item) =>
          !item.roles ||
          item.roles.includes(userRole as "admin" | "financial-advisor")
      ),
      EXTRAS: NAV_SECTIONS.EXTRAS.filter(
        (item) =>
          !item.roles ||
          item.roles.includes(userRole as "admin" | "financial-advisor")
      ),
    };

    const allSections = [
      ...filteredSections.CUSTOMER_OVERVIEW,
      ...filteredSections.EXTRAS,
    ];

    const activeParent = allSections.find((item) => {
      if (item.hasSubmenu && item.submenuItems) {
        return item.submenuItems.some(
          (subItem) =>
            pathname === subItem.href || pathname.startsWith(`${subItem.href}/`)
        );
      }
      return false;
    });

    // Set the expanded item to the active parent's href
    if (activeParent) {
      setExpandedItem(activeParent.href);
    }
  }, [pathname, userRole]);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const toggleSubmenu = (href: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedItem((prev) => (prev === href ? null : href));
  };

  // Updated SubmenuWithAnimation to filter by user role
  const SubmenuWithAnimation = ({
    isExpanded,
    submenuItems
  }: {
    isExpanded: boolean;
    submenuItems: { text: string; href: string; roles?: ("admin" | "financial-advisor")[] }[];
    parentHref: string;
  }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<string>("0px");
    
    // Filter submenu items based on user role
    const filteredSubmenuItems = submenuItems.filter((item) => {
      if (item.roles) {
        return item.roles.includes(userRole as "admin" | "financial-advisor");
      }
      return true; // Show items without role restrictions
    });

    useEffect(() => {
      if (isExpanded && contentRef.current) {
        const scrollHeight = contentRef.current.scrollHeight;
        if (scrollHeight <= 170) {
          setHeight("auto");
        } else {
          setHeight("170px");
        }
      } else {
        setHeight("0px");
      }
    }, [isExpanded, filteredSubmenuItems]);

    return (
      <div
        style={{
          height: isExpanded ? height : "0px",
          opacity: isExpanded ? 1 : 0,
          overflow: "hidden",
          transition: "height 300ms ease-in-out, opacity 300ms ease-in-out",
        }}
      >
        <div
          ref={contentRef}
          className="px-4 py-2 bg-[#49647C] h-full overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#0f4d77 #49647C",
          }}
        >
          {filteredSubmenuItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className={`block py-2 text-sm uppercase font-semibold transition-colors ${
                isActive(item.href)
                  ? "text-white bg-[#0f4d77] pl-2 rounded-l-md"
                  : "text-[#CFD7DE] hover:text-white"
              }`}
            >
              {item.text}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const SidebarNavItem: React.FC<NavItem> = ({
    icon,
    text,
    href,
    hasSubmenu,
    notification,
    submenuItems,
    roles,
    isDynamicSubmenu,
  }) => {
    // Check if this item should be shown to the current user role
    if (roles && !roles.includes(userRole as "admin" | "financial-advisor")) {
      return null;
    }

    // If user is financial-advisor and email is not verified, only show DASHBOARD and PROFIL
    if (userRole === "financial-advisor" && !isEmailVerified) {
      if (text !== "DASHBOARD" && text !== "PROFIL") {
        return null;
      }
    }

    const active = isActive(href);
    const isExpanded = expandedItem === href;
    const hasActiveChild = submenuItems?.some((item) => isActive(item.href));

    return (
      <div>
        {hasSubmenu ? (
          <div
            onClick={(e) => toggleSubmenu(href, e)}
            className={`flex items-center py-[10px] uppercase cursor-pointer text-[0.9rem] font-roboto rounded-md my-1 transition-colors ${
              active || hasActiveChild
                ? "text-white"
                : "text-[#CFD7DE] hover:text-white"
            }`}
          >
            <span>{icon}</span>
            <span className="pl-2 text-sm font-medium uppercase">{text}</span>

            {notification && (
              <div className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {notification}
              </div>
            )}

            {hasSubmenu && (
              <span className="ml-auto">
                <div
                  style={{
                    transform: isExpanded ? "rotate(0deg)" : "rotate(0deg)",
                    transition: "transform 300ms ease-in-out",
                  }}
                >
                  {isExpanded ? (
                    <IoIosArrowDown size={14} />
                  ) : (
                    <IoIosArrowForward size={14} />
                  )}
                </div>
              </span>
            )}
          </div>
        ) : (
          <Link
            href={href}
            className={`flex items-center py-[10px] text-[0.9rem] font-roboto rounded-md my-1 transition-colors ${
              active ? "text-white" : "text-[#CFD7DE] hover:text-white"
            }`}
          >
            <span>{icon}</span>
            <span className="pl-2 text-sm font-medium uppercase">{text}</span>

            {notification && (
              <div className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {notification}
              </div>
            )}
          </Link>
        )}

        {hasSubmenu && (
          <SubmenuWithAnimation
            isExpanded={isExpanded}
            submenuItems={
              isDynamicSubmenu
                ? [
                    ...(submenuItems || []),
                    ...pipelines.map((pipeline) => ({
                      text: pipeline.name,
                      href: `/admin/pipeline?id=${pipeline.id}`,
                    })),
                  ]
                : submenuItems || []
            }
            parentHref={href}
          />
        )}
      </div>
    );
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isOpen && isMobile) {
    return null;
  }

  // Filter sections based on user role and email verification
  const filteredNavSections = {
    CUSTOMER_OVERVIEW: NAV_SECTIONS.CUSTOMER_OVERVIEW.filter((item) => {
      // Check role permissions first
      const hasRolePermission =
        !item.roles ||
        item.roles.includes(userRole as "admin" | "financial-advisor");

      // If user is financial-advisor and email is not verified, only show DASHBOARD and PROFIL
      if (userRole === "financial-advisor" && !isEmailVerified) {
        return (
          hasRolePermission &&
          (item.text === "DASHBOARD" || item.text === "PROFIL")
        );
      }

      return hasRolePermission;
    }),
    EXTRAS: NAV_SECTIONS.EXTRAS.filter((item) => {
      // Check role permissions first
      const hasRolePermission =
        !item.roles ||
        item.roles.includes(userRole as "admin" | "financial-advisor");

      // If user is financial-advisor and email is not verified, hide EXTRAS section
      if (userRole === "financial-advisor" && !isEmailVerified) {
        return false;
      }

      return hasRolePermission;
    }),
  };

  return (
    <aside
      className={`h-full bg-base w-64 fixed left-0 top-0 pt-24 overflow-y-auto z-20 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="text-[#ffffffcf] text-[14px] font-bold tracking-wider px-4 pt-2 uppercase">
        KUNDENÜBERSICHT
      </div>
      <div className="px-4 py-4">
        <div className="flex justify-center px-4 w-full items-center">
          <Link
            href="/admin/admin-chat"
            className="bg-white w-full rounded-md px-4 flex items-center justify-center gap-2 py-2 text-[#212529] font-roboto"
          >
            <IoIosMail size={20} />
            <span>Nachrichten</span>
            <span className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs ml-1">
              1
            </span>
          </Link>
        </div>
        <div className="pt-4 px-4">
          {filteredNavSections.CUSTOMER_OVERVIEW.map((item, index) => (
            <SidebarNavItem key={`customer-${index}`} {...item} />
          ))}
        </div>

        {filteredNavSections.EXTRAS.length > 0 && (
          <>
            <div className="text-[#ffffffcf] text-[14px] font-bold tracking-wider px-4 pt-8 pb-3 uppercase">
              EXTRAS
            </div>
            <div className="px-4">
              {filteredNavSections.EXTRAS.map((item, index) => (
                <SidebarNavItem key={`extra-${index}`} {...item} />
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;