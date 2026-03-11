// import Login from "../pages/login";
import SignIn from "../assets/Login.png";

import { Outlet } from "react-router";
export const AuthLayout = () => {
  return (
    <main
      style={{
        backgroundImage: `url(${SignIn})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      // 
    >
      <Outlet />
    </main>
  );
};
