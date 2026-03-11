import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DisableBackButton = () => {
  const navigate = useNavigate();
  // const location = useLocation();


  useEffect(() => {
    const handlePopState = () => {
      navigate(1); // Prevent navigating backward
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  return null; // No UI element, just logic
};

export default DisableBackButton;
