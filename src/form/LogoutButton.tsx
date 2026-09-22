"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { useDispatch } from "react-redux";
import { clearProfile } from "@/libs/redux/slices/profileSlice";

const IconLogout = ({
  className = "",
  fill = "transparent",
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16 13V11H8V8L3 12L8 16V13H16ZM20 3H12V5H20V19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3Z"
        fill="#151515"
      />
    </svg>
  );
};

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(clearProfile());
    signOut({ callbackUrl: "/" });
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2  text-[13px] cursor-pointer h-[35px] justify-center  bg-tranparent  hover:bg-gray-100  ${className}`}
    >
      <IconLogout className="w-5 h-5" /> Logout
    </button>
  );
};

export default LogoutButton;
