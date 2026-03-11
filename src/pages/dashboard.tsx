import { Container } from "../components/shared/container";
import DashboardCard from "../components/dashboard/DashboardCard";
import Savings from "../assets/savings.svg";
import Customer from "../assets/customers.svg";
import Assets from "../assets/assets.svg";
import Categories from "../assets/categories.svg";
// import { useRoleAccess } from "@/hooks";
import PieChartComp from "../components/dashboard/PieChart";
import BarChartComponent from "../components/dashboard/BarChart";
import { GroupData } from "../types";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
// import { users } from "../data/Datafortable";
import { User } from "../types";
import useDashboard from "@/hooks/use-dashboard";
import TabItem from "@/components/tabItem";
import {
  Dialog,
  // DialogTrigger,
  // DialogContent,
  // DialogHeader,
  // DialogTitle,
  // DialogDescription,
  // DialogClose,
} from "@/components/ui/dialog";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Tabs } from "@/data/ItemData";
const Dashboard = () => {
  // useRoleAccess("manager");
  // const [customerType, setCustomerType] = useState("all");
  const {
    allUsers,
    allUsersLoading,
    stats,
    statsLoading,
    monthlyTransaction,
    savingsPercentage,
    setMonth,
    displayTime,
    setDisplayTime,
    setCurrentPage,
    totalPages,
    // setTotalPages,
    currentPage,
    customerType,
    setPageSize,
    pageSize,
    setCustomerType,
  } = useDashboard();
  // const data: GroupData[] = [
  //   { id: 0, name: "Group A", value: 100 },
  //   { id: 1, name: "Group B", value: 300 },
  //   { id: 2, name: "Group C", value: 100 },
  // ];
  const chartData: GroupData[] = [
    { id: 0, name: "SSS", value: savingsPercentage?.sssPercentage },
    {
      id: 1,
      name: "Target Savings",
      value: savingsPercentage?.targetSavingsPercentage,
    },
    {
      id: 2,
      name: "Smart Lock",
      value: savingsPercentage?.smartLockPercentage,
    },
    { id: 3, name: "BNPL", value: savingsPercentage?.bnplPercentage },
  ];

  const columns: ColumnDef<User>[] = [
    {
      id: "number",
      header: "S/N",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "firstName",
      header: "First Name",
      cell: ({ row }) => {
        const firstName = row.original.firstName as string;
        const lastName = row.original.lastName as string;
        const middleName = row.original.middleName as string;
        return (
          <span>{`${firstName || ""} ${middleName || ""} ${
            lastName || ""
          }`}</span>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        return <span>{row.getValue("username") || "N/A"}</span>;
      },
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
    },
    {
      accessorKey: "address",
      header: "Address",
    },
    {
      accessorKey: "bvn",
      header: "BVN",
    },
    {
      accessorKey: "organization",
      header: "Organization",
    },
    {
      accessorKey: "status",
      header: "Account Status",
      cell: ({ row }) => {
        const status = row?.original.status;

        // if (!isEnabled) return <span className="text-red-500">Disabled</span>;
        // if (!isLocked) return <span className="text-red-500">Locked</span>;
     if (status === "deactivated")
          return <span className="text-red-500">{status}</span>;
        if (status === "pending")
          return <span className="text-yellow-500">{status}</span>;
        return <span className="text-green-500">{status}</span>;
      },
    },
    {
      accessorKey: "created_on",
      header: "Registration Date",
      cell: ({ getValue }) => {
        const date = new Date(getValue() as string);
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    //  {
    //    accessorKey: "status",
    //    header: () => <span></span>,
    //    cell: ({ row }) => {
    //      console.log(row?.original);
    //      return (
    //        <div className="dropdown dropdown-end">
    //          <div tabIndex={0} className="p-0">
    //            <ActionIcon />
    //          </div>
    //          <ul
    //            tabIndex={0}
    //            className="dropdown-content text-left bg-[#4F4F4F] gap-y-2 cursor-pointer  rounded-md text-sm text-white z-[100] p-2 w-52  shadow"
    //          >
    //            {row?.original.status === "deactivated" ||
    //            row?.original.status === null ? (
    //              <li
    //                onClick={() =>
    //                  handleToggleModal(
    //                    MODAL_TYPE.ACTIVATE_CUSTOMER,
    //                    row?.original
    //                  )
    //                }
    //              >
    //                <a>Activate</a>
    //              </li>
    //            ) : (
    //              ""
    //            )}

    //            {row?.original.status === "ACTIVE" ||
    //            row?.original.status === null ? (
    //              <li
    //                onClick={() =>
    //                  handleToggleModal(
    //                    MODAL_TYPE.DEACTIVATE_CUSTOMER,
    //                    row?.original
    //                  )
    //                }
    //              >
    //                <a>DeActivate</a>
    //              </li>
    //            ) : (
    //              ""
    //            )}
    //          </ul>
    //        </div>
    //      );
    //    },
    //  },
  ];
  const options = [
    { title: "This Week", value: "this-week" },
    { title: "This Month", value: "this-month" },
    { title: "This Year", value: "this-year" },
  ];

  return (
    <Container>
      <article className="min-h-screen">
        <div className=" grid grid-cols-1 md:grid-cols-4 gap-4">
          {" "}
          <DashboardCard
            title="Savings"
            amount={stats?.totalSavings}
            icon={Savings}
            loading={statsLoading}
          />
          <DashboardCard
            title="Customer"
            amount={stats?.totalCustomers}
            icon={Customer}
            loading={statsLoading}
          />
          <DashboardCard
            title="Assets"
            amount={stats?.totalAssets}
            icon={Assets}
            loading={statsLoading}
          />
          <DashboardCard
            title="Categories"
            amount={stats?.totalAssetCategories}
            icon={Categories}
            loading={statsLoading}
          />
        </div>
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3  mt-4 ">
          <div className=" bg-white rounded p-4 h-[300px] ">
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold">Savings</p>
              <div className="flex">
                <p className="text-[10px] text-[#7C2EBF] bg-[#F6EBFE] rounded-lg px-2 py-1">
                  {displayTime}
                </p>
                <Dialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center text-customRed focus:outline-none">
                        <ChevronDown className=" h-[16px]" />
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      className="w-56 p-0 bg-white"
                      align="center"
                      sideOffset={4}
                      forceMount
                    >
                      {/* Header */}
                      <DropdownMenuLabel className="font-normal mt-2">
                        {/* <p className="text-[14px] text-[#8C8C8C]">
                        Select your preferred wallet
                      </p> */}
                      </DropdownMenuLabel>

                      {/* Dynamically generated wallet items */}
                      {options?.map((item, index: number) => (
                        <React.Fragment key={index}>
                          {/* Add separator before all items except the first */}
                          {index > 0 && (
                            <DropdownMenuSeparator className="h-[2px] " />
                          )}
                          <DropdownMenuItem
                            onSelect={() => {
                              setMonth(item?.value);
                              setDisplayTime(item.title);
                            }}
                            className="hover:bg-gray-100 py-2 cursor-pointer border-b-2 py-4"
                          >
                            <p className="text-[14px] font-medium leading-none">
                              {item?.title}
                            </p>
                          </DropdownMenuItem>
                        </React.Fragment>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Dialog>
              </div>
            </div>
            {chartData.every((item) => item.value === 0) ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="text-4xl mb-2">🫙</div>
                <p className="text-gray-500 text-sm font-semibold">
                  No chart data yet
                </p>
                <p className="text-gray-400 text-xs">
                  Start saving to see your progress here!
                </p>
              </div>
            ) : (
              <PieChartComp data={chartData} />
            )}

            <ul className="flex flex-row mt-0 gap-2 justify-between items-center mx-auto">
              <li className="flex items-center text-xs">
                <span className="text-[#7C2EBF] text-xl mr-2">•</span> bnpl
              </li>
              <li className="flex items-center text-xs">
                <span className="text-[#C87DFE] text-xl mr-2">•</span> smartLock
              </li>
              <li className="flex items-center text-xs whitespace-nowrap">
                <span className="text-[#DDAEFE] text-xl mr-2">•</span> sss
              </li>
              <li className="flex items-center text-xs whitespace-nowrap">
                <span className="text-[#A97DFE] text-xl mr-2">•</span>{" "}
                targetSavings
              </li>
            </ul>
          </div>
          <div className="md:col-span-2 bg-white rounded p-4 ">
            <p className="text-xs font-semibold">Transactions</p>
            <BarChartComponent data={monthlyTransaction} />
          </div>
        </div>
        <article className=" mt-6 ">
          <h1 className="text-base font-semibold">Customers</h1>
          <div className=" bg-white rounded-md mt-2 py-4">
            <div className="flex flex-row  gap-10 text-xs text-[#6D6C6C] pt-6 px-2">
              {Tabs.map((tab) => (
                <TabItem
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  active={customerType === tab.value}
                  onClick={setCustomerType}
                />
              ))}
            </div>
            <div>
              <DataTable
                data={allUsers}
                loading={allUsersLoading}
                columns={columns}
                useApiPagination={true}
                totalPages={totalPages || 1}
                currentPage={currentPage}
                onPageChange={(newPage) => setCurrentPage(newPage)}
                setPageSize = {setPageSize}
                pageSize={pageSize}
              />
            </div>
          </div>
          <div></div>
        </article>
      </article>
    </Container>
  );
};

export default Dashboard;
