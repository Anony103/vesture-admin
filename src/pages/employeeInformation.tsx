import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { EmployeeRecord } from "../types/table-type";
import { ActionIcon } from "../components/svg-icons/action-icon";
import Button from "../components/shared/button";
import { useNavigate } from "react-router-dom";
import useEmployeeInfo from "@/hooks/use-employee-info";

const EmployeeInformation = () => {
  // useRoleAccess("manager");
  // const [customerType, setCustomerType] = useState("allcustomers");
  const navigate = useNavigate();
  const {
    employeeInfos,
    employeInfosLoading,
    employeInfosError,
    setCurrentPage,
    currentPage,
    totalPages,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleEndDateChange,
    handleStartDateChange,
    setPageSize,
    pageSize
  } = useEmployeeInfo();

  const EmployeeColumns: ColumnDef<EmployeeRecord>[] = [
    {
      id: "sn",
      header: "S/N",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "fullName",
      header: "Full Name",
    },
    {
      accessorKey: "ippisNumber",
      header: "IPPIS No",
    },
    {
      accessorKey: "employerOrganization",
      header: "Organization",
    },
    {
      accessorKey: "employmentStatus",
      header: "Status",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        const color = value === "Active" ? "text-green-600" : "text-red-600";

        return <span className={`font-medium ${color}`}>{value}</span>;
      },
    },
    {
      accessorKey: "bankName",
      header: "Bank",
    },
    {
      accessorKey: "accountNumber",
      header: "Account No",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span>{value}</span>;
      },
    },
    {
      accessorKey: "netPay",
      header: "Net Pay",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return <span>₦{value?.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: "uploadedOn",
      header: "Uploaded On",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span>{new Date(value).toLocaleString()}</span>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: () => (
        <div>
          <ActionIcon />
        </div>
      ),
    },
  ];

  const handleCreateCredit = () => {
    navigate("createEmployees");
  };
  return (
    <Container>
      <article className=" mt-6 min-h-screen">
        <div className="flex justify-between">
          <div></div>
          <Button
            onClick={handleCreateCredit}
            color="purple"
            name="Upload Staff Information"
          />
        </div>
        <div className=" bg-white mt-2  rounded-md pb-2">
          {/* <div className="flex flex-row  gap-10 text-xs text-[#6D6C6C] pt-6 px-2">
            <p
              className={`${
                customerType === "allcustomers"
                  ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                  : ""
              } mx-2 pb-6`}
              onClick={() => {
                setCustomerType("allcustomers");
              }}
            >
              All{" "}
            </p>
            <p
              className={`${
                customerType === "pendingApproval"
                  ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                  : ""
              } mx-2 pb-6`}
              onClick={() => {
                setCustomerType("pendingApproval");
              }}
            >
              {" "}
              Regular{" "}
            </p>
            <p
              className={`${
                customerType === "approved"
                  ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                  : ""
              } mx-2 pb-6`}
              onClick={() => {
                setCustomerType("approved");
              }}
            >
              Target
            </p>
            <p
              className={`${
                customerType === "decline"
                  ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                  : ""
              } mx-2 pb-6`}
              onClick={() => {
                setCustomerType("decline");
              }}
            >
              Assets Finance
            </p>
          </div> */}
          <div className="flex flex-row gap-6 p-6">
            <div className="flex flex-row gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
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
            </div>
            <button
              // onClick={exportSavingsToExcel}
              // disabled={allSavingsLoading}
              className="text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md justify-end"
            >
              Export As Excel
            </button>
          </div>

          <DataTable
            data={employeeInfos}
            columns={EmployeeColumns}
            loading={employeInfosLoading}
            error={employeInfosError}
            useApiPagination={true}
            totalPages={totalPages || 1}
            currentPage={currentPage}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            setPageSize = {setPageSize}
            pageSize={pageSize}
          />
        </div>
        <div></div>
      </article>
    </Container>
  );
};

export default EmployeeInformation;
