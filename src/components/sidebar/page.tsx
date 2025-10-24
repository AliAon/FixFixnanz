"use client";
import React, { useState } from "react";
import { AiFillHome } from "react-icons/ai";
import { FaMessage } from "react-icons/fa6";
import { FaUser, FaCalendarAlt } from "react-icons/fa";
import { BiSolidUserRectangle } from "react-icons/bi";
import { FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ConfirmationDialog from "../shared/ConfirmationDialouge";
import { toast } from "react-toastify";
import { logout } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, href, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (onClick) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center py-3 px-4 cursor-pointer rounded-lg hover:bg-base hover:text-white ${isActive ? "bg-base text-white" : "text-gray-500"
          }`}
      >
        <div className="mr-3">{icon}</div>
        <span className="font-roboto text-[18px]">{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center py-3 px-4 cursor-pointer rounded-lg hover:bg-base hover:text-white ${isActive ? "bg-base text-white" : "text-gray-500"
        }`}
    >
      <div className="mr-3">{icon}</div>
      <span className="font-roboto text-[18px]">{label}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = () => {
    dispatch(logout());
    toast.success("Successfully logged out");
    router.push("/login");
    setShowLogoutDialog(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutDialog(false);
  };

  return (
    <div className="w-full md:max-w-[285px] px-6 h-full lg:max-w-[285px] xl:max-w-[285px] bg-white py-6 rounded-lg shadow-lg shadow-[#b7afaf]">
      {/* Profile Section */}
      <div className="flex items-center mb-6">
        <div className="flex items-start gap-4 ">
          <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mx-auto mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/icons/user-profile.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-[18px] font-roboto font-semibold pt-4">
            Usman Saleem
          </h3>
        </div>
      </div>

      <nav className="space-y-2">
        <NavItem
          href="/customer-dashboard"
          icon={<AiFillHome size={20} />}
          label="Dashboard"
        />
        <NavItem
          href="/customer-messages"
          icon={<FaMessage size={20} />}
          label="News"
        />
        <NavItem
          href="/my-profile"
          icon={<FaUser size={20} />}
          label="My Profile"
        />
        <NavItem
          href="/appointments"
          icon={<FaCalendarAlt size={20} />}
          label="My Appointments"
        />
        <NavItem
          href="/contract"
          icon={<BiSolidUserRectangle size={20} />}
          label="My Contract"
        />
        <NavItem
          href="/profile-update"
          icon={<BiSolidUserRectangle size={20} />}
          label="Profile Setting"
        />

        <NavItem
          href=""
          icon={<FiLogOut size={20} />}
          label="Logout"
          onClick={handleLogoutClick}
        />
      </nav>

      <ConfirmationDialog
        isOpen={showLogoutDialog}
        title="Are you sure you want to logout?"
        message="You will be redirected to the login page."
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        confirmText="Logout"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Sidebar;
