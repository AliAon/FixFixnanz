import React, { ReactNode } from "react";

interface ButtonProps {
  text: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  className = "",
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn-shine min-h-[50px] hover:bg-[#1778F2] py-0 font-medium font-roboto ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;
