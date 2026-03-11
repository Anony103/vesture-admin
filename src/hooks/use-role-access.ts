// import { SESSION_STORAGE_KEY } from "@/constants";
// import { decodeAuthToken } from "@/utils";
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";

// export const useRoleAccess = (roles: string[]) => {
//   const navigate = useNavigate();
//   useEffect(() => {
//     const dataFromSession = sessionStorage.getItem(SESSION_STORAGE_KEY);

//     if (!dataFromSession) {
//       toast.error("Authorized, please login", {
//         toastId: "unauthorized-toast-3338",
//       });
//       navigate("/login");
//       return;
//     }

//     const user = decodeAuthToken(dataFromSession);

//     if (user && !user?.password_changed) {
//       toast.warn("You cannot access this page until you change your password", {
//         toastId: "use_password_change",
//       });
//       navigate("/update-password");
//       return;
//     }
//     if (roles.length === 0) {
//       return;
//     }

//     const transformedRoles = roles.map((role) => role.toUpperCase());

//     if (!transformedRoles.includes(user?.roleaccess?.toUpperCase())) {
//       toast.warn("You do not have permission to access this page.", {
//         toastId: "no-permission-33292",
//       });
//       navigate("/login");
//     }
//   }, [navigate, roles]);
// };
// 