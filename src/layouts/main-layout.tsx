import { useState } from "react";
import { Sidebar } from "../components/shared/sidebar";
import { Container } from "../components/shared/container";
import { Outlet } from "react-router-dom";
// import { Cross1Icon } from "@radix-ui/react-icons";
// import { useUser } from "@/hooks";
import { ClipLoader } from "react-spinners";
// import { USERS_INFO } from "@/constants";
// import profile from "../assets/profile.svg";
import { FaChevronDown } from "react-icons/fa6";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks";
import { useIdleTimer } from "react-idle-timer";
import { toast } from "react-toastify";
import { FaUserCircle } from "react-icons/fa";
import { useAppContext } from "@/context/AppContext";

export const MainLayout = () => {
  const { isAuthLoading, user } = useUser();
  const { searchTerm, handleSearchChange } = useAppContext();

  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(window.innerWidth > 768);
  const navigate = useNavigate();
  const handleToggleSidebar = () => {
    setOpen((open) => !open);
    setIsLoading(false);
  };

  useIdleTimer({
    timeout: 1000 * 60 * 5,
    onIdle: () => {
      toast.warn("Logged out due to inactivity");
      navigate("/auth");
      sessionStorage.clear();
    },
  });

  // const storedResponse = sessionStorage.getItem(USERS_INFO);
  // const user_info = storedResponse ? JSON.parse(storedResponse) : null;
  // console.log(user_info)
  console.log(isAuthLoading);
  return isLoading ? (
    <section className="h-screen flex items-center justify-center">
      <ClipLoader size={20} color="#7C2EBF" />
    </section>
  ) : (
    <main className="flex flex-col md:flex-row relative">
      <div className="h-0">
        <Sidebar open={open} handleToggleSidebar={handleToggleSidebar} />
      </div>
      <section className={`w-auto  flex-1 flex-col `}>
        <Container>
          <header className="h-12 flex items-center mt-8">
            <div className=" w-full flex md:flex-row justify-between items-center ">
              {/* {open ? <div></div> : <Cross1Icon />} */}
              {/* <div className="flex items-center gap-1">
                <div
                  className="lg:hidden self-end cursor-pointer"
                  onClick={handleToggleSidebar}
                ></div>
              </div> */}
              <div className="w-[30%]">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.3333 15.5L9.08333 10.25C8.66667 10.5833 8.1875 10.8472 7.64583 11.0417C7.10417 11.2361 6.52778 11.3333 5.91667 11.3333C4.40278 11.3333 3.12153 10.809 2.07292 9.76042C1.02431 8.71181 0.5 7.43056 0.5 5.91667C0.5 4.40278 1.02431 3.12153 2.07292 2.07292C3.12153 1.02431 4.40278 0.5 5.91667 0.5C7.43056 0.5 8.71181 1.02431 9.76042 2.07292C10.809 3.12153 11.3333 4.40278 11.3333 5.91667C11.3333 6.52778 11.2361 7.10417 11.0417 7.64583C10.8472 8.1875 10.5833 8.66667 10.25 9.08333L15.5 14.3333L14.3333 15.5ZM5.91667 9.66667C6.95833 9.66667 7.84375 9.30208 8.57292 8.57292C9.30208 7.84375 9.66667 6.95833 9.66667 5.91667C9.66667 4.875 9.30208 3.98958 8.57292 3.26042C7.84375 2.53125 6.95833 2.16667 5.91667 2.16667C4.875 2.16667 3.98958 2.53125 3.26042 3.26042C2.53125 3.98958 2.16667 4.875 2.16667 5.91667C2.16667 6.95833 2.53125 7.84375 3.26042 8.57292C3.98958 9.30208 4.875 9.66667 5.91667 9.66667Z"
                        fill="#E4E4E4"
                      />
                    </svg>
                  </div>
                  <input
                    className="bg-white border border-gray-300 text-sm text-black w-full h-[40px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F6EBFE] focus:border-transparent pl-10 pr-4 py-2 rounded-md"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="font-bold">
                {location.pathname === "/dashboard" && <h1></h1>}
                {location.pathname === "/customers" && <h1>Customers</h1>}
                {location.pathname === "/manageAdmins" && <h1>Admin</h1>}
                {location.pathname === "/savings" && <h1>Savings</h1>}
                {location.pathname === "/assetsCategories" && (
                  <h1>Categories</h1>
                )}
                {location.pathname === "/assets" && <h1>Assets</h1>}
                {location.pathname === "/creditEntry" && <h1>Public Sector Credit Entry</h1>}
                {location.pathname === "/transactions" && <h1>Transactions History</h1>}
                {location.pathname === "/auditLog" && <h1>Audit Logs</h1>}
                {location.pathname === "/interestRates" && (
                  <h1>Interest Rates</h1>
                )}
                {location.pathname === "/employeeInfo" && (
                  <h1>Data Refresh</h1>
                )}

                {location.pathname === "/settings" && <h1>Settings</h1>}
              </div>

              <div className="flex flex-row gap-2 justify-center items-center ">
                {/* <div>
                  <img src={profile} alt="" />
                </div> */}
                <div className="flex items-center justify-center">
                  <FaUserCircle className="text-gray-400 text-6xl" />
                </div>

                <div className=" md:mr-8 ">
                  <p className="text-xs font-semibold">{user?.username}</p>
                  <p className="text-xs text-[#A8A8A8] ">{user?.email}</p>
                </div>
                <div className="dropdown dropdown-end flex justify-center items">
                  <label tabIndex={0} className="cursor-pointer">
                    <FaChevronDown size="10" />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-0 border-0.5 bg-white rounded-sm w-32 mt-4 py-2  rounded"
                  >
                    <li
                      className="cursor-pointer hover:bg-gray-100 px-2 text-xs py-2"
                      onClick={() => {
                        navigate("/auth");
                      }}
                    >
                      Log Out
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </header>
        </Container>

        <article className={`mt-6 md:w-auto max-h-auto min-h-screen `}>
          <Outlet />
        </article>
      </section>
    </main>
  );
};
