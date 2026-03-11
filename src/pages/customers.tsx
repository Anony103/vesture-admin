import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ActionIcon } from "../components/svg-icons/action-icon";
import { ClipLoader } from "react-spinners";
// import useDashboard from "@/hooks/use-dashboard";
import useMangeCustomer from "@/hooks/use-manage-customers";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { User } from "@/types";
import TabItem from "@/components/tabItem";
import { useNavigate } from "react-router";
import { exportToExcel } from "@/utils/exportAsExcel";
const Customers = () => {
  // useRoleAccess("manager");
  // const [customerType, setCustomerType] = useState("allcustomers");
  // const { allUsers, allUsersLoading } = useDashboard();
  const navigate = useNavigate();
  const {
    // register,
    onSubmit,
    handleSubmit,
    open,
    // errors,
    customerType,
    setCustomerType,
    isLoading,
    allUsersLoading,
    allUsers,
    // allUsersError,
    // setVisibility,
    // visibility,
    handleClose,
    handleToggleModal,
    modalState,
    MODAL_TYPE,
    // setValue,
    // watch,
    // ... other values
    endDate,
    setEndDate,
    setStartDate,
    startDate,

    setCurrentPage,
    totalPages,
    currentPage,
    selectedUser,
    setPageSize,
    pageSize,
  } = useMangeCustomer();

  type CustomerType = "all" | "ACTIVE" | "deactivated" | "pending";
  console.log(allUsers);
  interface Tab {
    label: string;
    value: CustomerType;
  }

  const tabs: Tab[] = [
    { label: "All Customers", value: "all" },
    // { label: "Pending Approval", value: "pending" },
    { label: "Approved", value: "ACTIVE" },
    { label: "Deactivated", value: "deactivated" },
  ];

  // interface TabItemProps {
  //   label: string;
  //   value: CustomerType;
  //   active: boolean;
  //   onClick: (value: CustomerType) => void;
  // }
  console.log(selectedUser);
  const columns: ColumnDef<User>[] = [
    {
      id: "number",
      header: "#",
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
    {
      accessorKey: "status",
      header: () => <span></span>,
      cell: ({ row }) => {
        console.log(row?.original);
        return (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} className="p-0">
              <ActionIcon />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content text-left bg-[#4F4F4F] gap-y-2 cursor-pointer  rounded-md text-sm text-white z-[100] w-52 shadow"
            >
              {row?.original.status === "deactivated" ||
              row?.original.status === null ? (
                <li
                  onClick={() =>
                    handleToggleModal(
                      MODAL_TYPE.ACTIVATE_CUSTOMER,
                      row?.original
                    )
                  }
                  className="cursor-pointer py-2 pl-3"
                >
                  <a>Activate</a>
                </li>
              ) : (
                ""
              )}

              {row?.original.status === "ACTIVE" ||
              row?.original.status === null ? (
                <li
                  onClick={() =>
                    handleToggleModal(
                      MODAL_TYPE.DEACTIVATE_CUSTOMER,
                      row?.original
                    )
                  }
                  className="cursor-pointer py-2 pl-3"
                >
                  <a>DeActivate</a>
                </li>
              ) : (
                ""
              )}
              {row?.original.status === "ACTIVE" ||
              row?.original.status === null ? (
                <li
                  onClick={() => navigate(`/savings/${row?.original.id}`)}
                  className="border-t-[1px] cursor-pointer border-t-white py-2 pl-3"
                >
                  <a>View Savings</a>
                </li>
              ) : (
                ""
              )}
            </ul>
          </div>
        );
      },
    },
  ];
  const style = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    height: "auto",
    width: 400,
    bgcolor: "background.paper",
    borderRadius: 1,
    boxShadow: 24,
    p: 2,
  };

  return (
    <Container>
      <article className=" mt-6 min-h-screen">
        <div className=" bg-white rounded-md pb-2">
          <div className="flex flex-row gap-5  md:gap-10 text-xs text-[#6D6C6C] pt-6 px-2">
            {tabs.map((tab) => (
              <TabItem
                key={tab.value}
                label={tab.label}
                value={tab.value}
                active={customerType === tab.value}
                onClick={setCustomerType}
              />
            ))}
          </div>
          {/* {customerType === "all" ? ( */}
          <div className="flex flex-col md:flex-row items-center gap-3 px-2 py-4 border-b">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
              />
            </div>

            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md"
              >
                Clear
              </button>
            )}
            <div className="flex flex-row justify-end p-6">
              <button
                onClick={() => {
                  exportToExcel<User>({
                    data: allUsers,
                    fileName: "users.xlsx",
                    columns: [
                      { header: "S/N", key: (_, i) => i + 1 },
                      { header: "Name", key: "firstName" },
                      { header: "Email", key: "email" },
                      { header: "Bvn", key: "bvn" },
                      { header: "Created At", key: "created_on" },
                    ],
                  });
                }}
                // disabled={allAdminsLoading}
                className="text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md justify-end"
              >
                Export As Excel
              </button>
            </div>
          </div>
          <div>
            <DataTable
              data={allUsers}
              columns={columns}
              loading={allUsersLoading}
              useApiPagination={true}
              totalPages={totalPages || 1}
              currentPage={currentPage}
              onPageChange={(newPage) => setCurrentPage(newPage)}
              setPageSize={setPageSize}
              pageSize={pageSize}
            />
          </div>
        </div>
        <div></div>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <h1 className="font-bold text-lg">
              {modalState === MODAL_TYPE.ACTIVATE_CUSTOMER
                ? "Activate"
                : "Deactivate"}
            </h1>
            <div className="flex flex-col gap-5 mt-3">
              <form
                className="flex flex-col gap-5"
                onSubmit={handleSubmit(onSubmit)}
              >
                {/* Only show password fields for CREATE_ADMIN */}

                {/* Only show password fields for CREATE_ADMIN */}
                {(modalState === MODAL_TYPE.ACTIVATE_CUSTOMER ||
                  modalState === MODAL_TYPE.DEACTIVATE_CUSTOMER) && (
                  <>
                    <div className="flex flex-col gap-1 ">
                      {/* <label className="text-xs">Status</label> */}
                      {/* <Select
                        value={watch("status")}
                        onValueChange={(value) => setValue("status", value)}
                      >
                        <SelectTrigger className="text-xs h-[40px] border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-[#7C2EBF] focus:border-transparent">
                          <SelectValue placeholder="Select status..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="active" className="text-xs">
                            Active
                          </SelectItem>
                          <SelectItem value="inactive" className="text-xs">
                            Inactive
                          </SelectItem>
                          <SelectItem value="suspended" className="text-xs">
                            Suspended
                          </SelectItem>
                        </SelectContent>
                      </Select> */}
                      <p className="flex items-center text-xs flex-wrap gap-1">
                        Do you want to
                        <span className="font-semibold">
                          {modalState === MODAL_TYPE.ACTIVATE_CUSTOMER
                            ? " activate"
                            : " deactivate"}
                        </span>
                        <span className="font-semibold">
                          {selectedUser?.username}
                        </span>
                        ?
                      </p>
                    </div>
                  </>
                )}

                {/* Additional fields for UPDATE_ADMIN can go here */}

                <div className="flex flex-row gap-4">
                  <button
                    type="submit"
                    className="text-xs flex bg-[#7C2EBF] py-3 px-4 w-[50%] text-center item-center justify-center text-white rounded-md hover:opacity-80"
                  >
                    {/* {isLoading ? (
                      <ClipLoader color="white" size="20" />
                    ) : modalState === MODAL_TYPE.DEACTIVATE_CUSTOMER ? (
                      "Deactivate Customer"
                    ) : (
                      " Activate Customer"
                    )} */}
                    {isLoading ? <ClipLoader color="white" size="20" /> : "Yes"}
                  </button>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="text-xs flex-1 bg-gray-300 py-3 px-4 text-gray-700 rounded-md hover:opacity-80 disabled:opacity-50"
                  >
                    No
                  </button>
                </div>
              </form>
            </div>
          </Box>
        </Modal>
      </article>
    </Container>
  );
};

export default Customers;
