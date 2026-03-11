import React from "react";
import { ClipLoader } from "react-spinners";

interface ButtonProps {
  color?: string;
  onClick?: () => void;
  name: string;
  type?: "submit" | "reset" | "button"; // Restrict to valid button types
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  color,
  onClick,
  name,
  type,
  loading,
}) => {
  const colorVariants = {
    lightpurple: "bg-[#E2CEF3] text-[#7C2EBF]",
    purple: "bg-[#7C2EBF] text-white hover:bg-[#7C2EBF]",
  };
  return (
    <button
      onClick={onClick}
      type={type}
      className={`text-xs flex py-3 px-4  rounded-md ${
        color === "lightpurple"
          ? colorVariants.lightpurple
          : colorVariants.purple
      }`}
    >
      {loading ? <ClipLoader size="10px" color="white" /> : name}
    </button>
  );
};

export default Button;
