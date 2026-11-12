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
  return (
    <button
      onClick={onClick}
      type={type}
      className={`v-btn ${color === "lightpurple" ? "v-btn-soft" : "v-btn-primary"}`}
    >
      {loading ? <ClipLoader size="12px" color="currentColor" /> : name}
    </button>
  );
};

export default Button;
