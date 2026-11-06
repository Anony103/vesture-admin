import { Container } from "../components/shared/container";
// import { useRoleAccess } from "@/hooks";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "../types/table-type";
// import { users } from "../data/Datafortable";
import { ActionIcon } from "../components/svg-icons/action-icon";
import useMangeTransactions from "@/hooks/use-manage-transactions";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formatNaira = (value: number) =>
  `₦${value.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// name, bank and account number of one side of a transaction, one per line; "-" when none is known
const Party = ({
  name,
  bank,
  account,
}: {
  name?: string | null;
  bank?: string | null;
  account?: string | null;
}) => {
  if (!name && !bank && !account) return <span>-</span>;
  return (
    <div className="flex flex-col leading-tight min-w-[150px]">
      {name && <span className="font-medium">{name}</span>}
      {bank && <span className="text-xs text-[#6D6C6C]">{bank}</span>}
      {account && <span className="text-xs text-[#6D6C6C]">{account}</span>}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="flex flex-col gap-1 border-b pb-2">
    <span className="text-[11px] uppercase tracking-wide text-gray-400">{label}</span>
    <span className="text-sm text-gray-800 break-words">{value || "-"}</span>
  </div>
);

const statusTone = (status?: string | null) =>
  status === "success"
    ? "bg-green-100 text-green-700"
    : status === "failed"
    ? "bg-red-100 text-red-700"
    : "bg-amber-100 text-amber-800";

const Transactions = () => {
  // useRoleAccess("manager");
  const [selected, setSelected] = useState<Transaction | null>(null);
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
        return <span className="inline-block w-full">{formatNaira(value)}</span>;
      },
    },
    {
      accessorKey: "userFullName",
      header: () => <span>User Full Name</span>,
    },
    {
      id: "from",
      header: () => <span>From</span>,
      cell: ({ row }) => (
        <Party
          name={row.original.senderName}
          bank={row.original.senderBank}
          account={row.original.senderAccountNumber}
        />
      ),
    },
    {
      id: "to",
      header: () => <span>To</span>,
      cell: ({ row }) => (
        <Party
          name={row.original.receiverName}
          bank={row.original.receiverBank}
          account={row.original.receiverAccountNumber}
        />
      ),
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
          cell: ({ row }) => {
            return (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} className="p-0 cursor-pointer">
                  <ActionIcon />
                </div>
                <ul
                  tabIndex={0}
                  className="dropdown-content text-left bg-[#4F4F4F] rounded-md text-sm text-white z-[1] w-52 shadow"
                >
                  <li
                    className="py-2 pl-3 cursor-pointer"
                    onClick={() => {
                      // close the dropdown, then show this row's details
                      (document.activeElement as HTMLElement | null)?.blur();
                      setSelected(row.original);
                    }}
                  >
                    View Details
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

        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="bg-white max-w-3xl max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Transaction details</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-semibold text-gray-900">
                    {formatNaira(selected.amount ?? 0)}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusTone(selected.transactionStatus)}`}
                  >
                    {selected.transactionStatus || "-"}
                  </span>
                  <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-gray-600">
                    {selected.transactionType || "-"}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-md bg-gray-50 p-3">
                    <span className="text-[11px] uppercase tracking-wide text-gray-400 block mb-1">From</span>
                    <Party
                      name={selected.senderName}
                      bank={selected.senderBank}
                      account={selected.senderAccountNumber}
                    />
                  </div>
                  <div className="rounded-md bg-gray-50 p-3">
                    <span className="text-[11px] uppercase tracking-wide text-gray-400 block mb-1">To</span>
                    <Party
                      name={selected.receiverName}
                      bank={selected.receiverBank}
                      account={selected.receiverAccountNumber}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  <DetailRow label="Customer" value={selected.userFullName} />
                  <DetailRow label="Reason" value={selected.transactionReason} />
                  <DetailRow label="Transaction reference" value={selected.transactionReference} />
                  <DetailRow label="Product" value={selected.productType} />
                  <DetailRow label="Transaction date" value={selected.transactionDate} />
                  <DetailRow label="Created on" value={selected.created_on} />
                  <DetailRow label="Updated on" value={selected.updated_on} />
                  <DetailRow label="Transaction id" value={selected.id} />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </article>
    </Container>
  );
};

export default Transactions;
