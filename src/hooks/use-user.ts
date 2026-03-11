import { useEffect, useState } from "react";
import { SESSION_STORAGE_KEY } from "../constants";
import { useNavigate } from "react-router-dom";
// import { decodeAuthToken } from "@/utils";
import { toast } from "react-toastify";
import { User } from "@/types";

export const useUser = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  // const [user, setUser] = useState(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const dataFromSession = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!dataFromSession) {
      toast.warn("Please login to proceed", {
        toastId: "unauthorized-toast-3338",
      });
      navigate("/auth", { replace: true });
      return;
    }
    // sessionStorage.getItem(`${SESSION_STORAGE_KEY}_TEMP_AUTH_DATA`);
    const user: User = JSON.parse(
      sessionStorage.getItem(`${SESSION_STORAGE_KEY}_TEMP_AUTH_DATA`) || ""
    );
    setUser(user);
    setIsAuthLoading(false);
  }, [navigate]);

  return { isAuthLoading, user };
};
