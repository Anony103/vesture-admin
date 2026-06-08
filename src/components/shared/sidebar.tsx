import React from "react";
import { useNavigate } from "react-router-dom";
import {
  DashboardIcon,
  ManageAdminIcon,
  CustomersIcon,
  SavingsIcon,
  AssetsCategories,
  AssetIcon,
  CreditEntryIcon,
  TransactionIcon,
  AuditLogsIcon,
  SettingsIcon,
  LogoutIcon,
  InterestRateIcon
} from "../svg-icons";
// import { ReceiptIcon } from "../svg-icons/receipt-icon";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { NavLink } from "react-router-dom";

// import { NOTIFY_TOKEN_SESSION_STORAGE_KEY } from "@/constants";
// import { toast } from "react-toastify";
// import { useUser } from "@/hooks";

type Props = {
  open: boolean;
  handleToggleSidebar: () => void;
};
export const Sidebar: React.FC<Props> = ({ open, handleToggleSidebar }) => {
  const navigate = useNavigate();
  // const { user } = useUser();

  const onLinkClick = () => {
    if (window.innerWidth > 768) {
      return;
    }
    handleToggleSidebar();
  };

  const menuItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: <DashboardIcon />,
      id: "1",
    },

    {
      title: "Customers",
      path: "/customers",
      icon: <CustomersIcon />,
      id: "2",
    },
    {
      title: "Manage Admins",
      path: "/manageAdmins",
      icon: <ManageAdminIcon />,
      id: "3",
    },
    {
      title: "Savings",
      path: "/savings/all",
      icon: <SavingsIcon />,
      id: "4",
    },
    {
      title: "Assets Categories",
      path: "/assetsCategories",
      icon: <AssetsCategories />,
      id: "5",
    },
    {
      title: "Assets",
      path: "/assets",
      icon: <AssetIcon />,
      id: "6",
    },
    {
      title: "Public Sector Credit Entry",
      path: "/creditEntry",
      icon: <CreditEntryIcon />,
      id: "7",
    },
    {
      title: "Interest Rates",
      path: "/interestRates",
      icon: <InterestRateIcon />,
      id: "8",
    },
      {
      title: "Data Refresh",
      path: "/employeeInfo",
      icon: <InterestRateIcon />,
      id: "9",
    },
    {
      title: "Finance",
      path: "/finance",
      icon: <TransactionIcon />,
      id: "13",
    },
    {
      title: "Transaction History",
      path: "/transactions",
      icon: <TransactionIcon />,
      id: "10",
    },
    {
      title: "Audit Log",
      path: "/auditLog",
      icon: <AuditLogsIcon />,
      id: "11",
    },
    {
      title: "Settings",
      path: "/settings",
      icon: <SettingsIcon />,
      id: "12",
    },
  ];

  // const handleLogout = () => {
  //   sessionStorage.removeItem(NOTIFY_TOKEN_SESSION_STORAGE_KEY);
  //   toast.success("Logout successful..");
  //   navigate("/auth/login");
  // };

  return (
    <aside
      className={` h-screen  ${
        open ? "lg:w-72 " : "lg:w-20"
      } duration-300 overflow-y-auto no-scrollbar`}
    >
      <nav
        className={`bg-white fixed md:pt-2 lg:left-0 top-0 bottom-0 z-20 ${
          open ? "w-72 " : "w-0 -left-20 lg:block lg:w-20"
        } duration-300 flex flex-col gap-2`}
      >
        <div
          className={`flex items-center justify-start px-5 ${
            open ? "w-[100%]" : "w-full"
          } h-8`}
        >
          <div className="flex justify-between items-center w-[100%]">
            <h1
              className={`text-black origin-left font-semibold text-lg ${
                open ? "scale-1" : "scale-0 lg:hidden"
              } duration-300`}
            >
              PayRise
            </h1>
            <div>
              <HamburgerMenuIcon
                onClick={handleToggleSidebar}
                className="cursor-pointer text-center"
              />
            </div>
          </div>
        </div>
        <div className="flex h-full flex-col justify-between">
          <ul className=" flex flex-col gap-2 overflow-x-hidden ">
            {menuItems.map((item, index) => (
              <li
                className={` gap-0.5
                 ${ index === 2 || index === 7 || index === 9
                    ? "border-b-2 border-gray-100"
                    : ""}
                `}
                key={item.id}
              >
                <NavLink
                  to={item.path}
                  onClick={onLinkClick}
                  className={({ isActive }) =>
                    `w-full ${
                      open ? "" : "lg:justify-center"
                    } text-black flex items-center gap-x-4 text-xs cursor-pointer hover:opacity-80 p-2 pl-5 ${
                      isActive
                        ? "bg-[#F6EBFE] font-bold border-r-4 border-r-[#7C2EBF]"
                        : "bg-transparent"
                    }`
                  }
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{item.icon}</span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="left"
                        sideOffset={open ? 250 : 35}
                        className="bg-white shadow-sm text-black"
                        arrowPadding={4}
                      >
                        <p className="text-sm">{item.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span
                    className={`font-sm text-xs ${
                      open ? "scale-1 w-auto" : "scale-0 w-0"
                    }`}
                  >
                    {item.title}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex h-[10vh] w-full items-center justify-center ">
            <button
              className={`flex items-center p-1 pl-5 gap-3 text-black w-full font-bold ${
                open ? "" : "lg:justify-center"
              }`}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <LogoutIcon />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="left"
                    sideOffset={open ? 250 : 35}
                    className="bg-white shadow-sm text-black"
                    arrowPadding={4}
                  >
                    <p className=" font-normal">Logout</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span
                className={`text-xs text-base ${
                  open ? "scale-1 w-auto " : "scale-0 w-0"
                }`}
                onClick={() => {
                  navigate("/auth");
                  sessionStorage.clear();
                }}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};
