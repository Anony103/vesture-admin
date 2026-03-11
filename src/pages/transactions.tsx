import { Container } from "../components/shared/container";
// import { useRoleAccess } from "@/hooks";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "../types/table-type";
// import { users } from "../data/Datafortable";
import { ActionIcon } from "../components/svg-icons/action-icon";
import useMangeTransactions from "@/hooks/use-manage-transactions";
import { Link } from "react-router-dom";

const Transactions = () => {
  // useRoleAccess("manager");
  const {
    allTransactions,
    allTransactionsLoading,
    allTransactionsError,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleEndDateChange,
    handleStartDateChange,
    setCurrentPage,
    currentPage,
    totalPages,
    // customerType,
    // setCustomerType,
    setPageSize,
    exportTransactionsToExcel,
    pageSize
  } = useMangeTransactions();

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "number",
      header: "S/N",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "amount",
      header: () => <span>Amount</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as number) ?? 0;
        return <span className="inline-block w-full">${value.toFixed(2)}</span>;
      },
    },

    {
      accessorKey: "bankName",
      header: () => <span>Bank Name</span>,
    },
    {
      accessorKey: "accountNumber",
      header: () => <span>Account Number</span>,
    },
    {
      accessorKey: "userFullName",
      header: () => <span>User Full Name</span>,
    },
    {
      accessorKey: "beneficiaryName",
      header: () => <span>Beneficiary Name</span>,
    },
    {
      accessorKey: "beneficiaryAccountNumber",
      header: () => <span>Beneficiary Account Number</span>,
    },
    {
      accessorKey: "transactionReference",
      header: () => <span>Transaction Reference</span>,
    },
    {
      accessorKey: "transactionStatus",
      header: () => <span>Status</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return (
          <div>
            {value === "success" ? (
              <span className="inline-block text-[#2C9720] capitalize">
                {value}
              </span>
            ) : value === "failed" ? (
              <span className="inline-block text-[#E70E02] capitalize">
                {value}
              </span>
            ) : (
              <span className="inline-block capitalize">{value}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "transactionType",
      header: () => <span>Type</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return <span className="inline-block capitalize">{value}</span>;
      },
    },
    {
      accessorKey: "transactionReason",
      header: () => <span>Reason</span>,
    },
    {
      accessorKey: "transactionDate",
      header: () => <span>Date</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return <span className="inline-block">{value}</span>;
      },
    },
    {
      accessorKey: "created_on",
      header: () => <span>Created On</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return <span className="inline-block">{value}</span>;
      },
    },
    {
      accessorKey: "updated_on",
      header: () => <span>Updated On</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return <span className="inline-block">{value}</span>;
      },
    },
     {
          accessorKey: "id",
          header: () => <span></span>,
          cell: () => {
            return (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} className="p-0 cursor-pointer">
                  <ActionIcon />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content text-left bg-[#4F4F4F] rounded-md text-sm text-white z-[1] w-52 shadow"
                >
                  <li className="py-2 pl-3 cursor-pointer">
                    <Link to="details">View Details</Link>
                  </li>
                
                </ul>
              </div>
            );
          },
        },
  ];

  return (
    <Container>
      <article className=" mt-6 min-h-screen">
        <div className=" bg-white rounded-md pb-2">
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
              All Transactions{" "}
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
              Pending Transactions{" "}
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
              Approved
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
              Decline
            </p>
          </div> */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 px-2 py-4 border-b">
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

            <div className="flex flex-row justify-end p-6">
              <button
                onClick={exportTransactionsToExcel}
                disabled={allTransactionsLoading}
                className="text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md justify-end"
              >
                Export as Excel
              </button>
            </div>
          </div>
          <DataTable
            data={allTransactions}
            columns={columns}
            loading={allTransactionsLoading}
            error={allTransactionsError}
            useApiPagination={true}
            totalPages={totalPages || 1}
            currentPage={currentPage}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            setPageSize = {setPageSize}
            pageSize = {pageSize}
          />
        </div>
        <div></div>
      </article>
    </Container>
  );
};

export default Transactions;
