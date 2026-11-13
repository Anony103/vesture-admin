import { RowMenu } from "@/components/shared/row-menu";
import { CopyText } from "@/components/shared/copy-text";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { ArrowRight, Download } from "lucide-react";
import { Container } from "../components/shared/container";
// import { useRoleAccess } from "@/hooks";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Transaction } from "../types/table-type";
// import { users } from "../data/Datafortable";
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
      {bank && <span className="text-xs text-fg3">{bank}</span>}
      {account && <span className="v-mono text-xs text-fg3">{account}</span>}
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="flex flex-col gap-1 border-b border-line pb-2">
    <span className="v-eyebrow">{label}</span>
    <span className="break-words text-sm text-fg">{value || "-"}</span>
  </div>
);

const statusTone = (status?: string | null) =>
  status === "success" ? "v-chip-ok" : status === "failed" ? "v-chip-bad" : "v-chip-warn";

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

  // the page of transactions being shown (the hook does not type it)
  const rows: Transaction[] = allTransactions ?? [];

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
        return <span className="v-mono inline-block w-full font-semibold">{formatNaira(value)}</span>;
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
      cell: ({ getValue }) => <CopyText value={(getValue() as string) ?? ""} />,
    },
    {
      accessorKey: "transactionStatus",
      header: () => <span>Status</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return <span className={`v-chip capitalize ${statusTone(value)}`}>{value || "-"}</span>;
      },
    },
    {
      accessorKey: "transactionType",
      header: () => <span>Type</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return <span className="v-chip capitalize">{value || "-"}</span>;
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
          cell: ({ row }) => (
            <RowMenu items={[{ label: "View Details", onSelect: () => setSelected(row.original) }]} />
          ),
        },
  ];

  return (
    <Container>
      <article className=" mt-6 min-h-screen">
        {rows.length > 0 && (
          <StatGrid className="mb-4">
            <StatCard label="Shown" tone="brand" value={rows.length} hint="Transactions on this page" />
            <StatCard
              label="Volume"
              tone="sky"
              value={formatNaira(rows.reduce((sum, t) => sum + (Number(t.amount) || 0), 0))}
              hint="Added up on this page"
            />
            <StatCard label="Successful" tone="mint" value={rows.filter((t) => t.transactionStatus === "success").length} hint="On this page" />
            <StatCard label="Failed" tone="danger" value={rows.filter((t) => t.transactionStatus === "failed").length} hint="On this page" />
          </StatGrid>
        )}
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
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 px-4 py-4 border-b">
            <div className="flex flex-row flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-fg2">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  className="v-field !w-auto !py-1.5"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-fg2">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  className="v-field !w-auto !py-1.5"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="v-btn v-btn-ghost v-btn-sm"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-row justify-end md:ml-auto">
              <button
                onClick={exportTransactionsToExcel}
                disabled={allTransactionsLoading}
                className="v-btn v-btn-primary"
              >
                <Download size={15} /> Export as Excel
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
          <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Transaction details</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="v-mono font-display text-3xl font-semibold tracking-tight">
                    {formatNaira(selected.amount ?? 0)}
                  </span>
                  <span className={`v-chip capitalize ${statusTone(selected.transactionStatus)}`}>
                    {selected.transactionStatus || "-"}
                  </span>
                  <span className="v-chip capitalize">{selected.transactionType || "-"}</span>
                </div>

                <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
                  <div className="rounded-xl border border-line bg-panel p-4">
                    <span className="v-eyebrow mb-1 block">From</span>
                    <Party
                      name={selected.senderName}
                      bank={selected.senderBank}
                      account={selected.senderAccountNumber}
                    />
                  </div>
                  <span className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-brand/30 bg-brand/15 text-brand md:rotate-0 rotate-90">
                    <ArrowRight size={16} />
                  </span>
                  <div className="rounded-xl border border-line bg-panel p-4">
                    <span className="v-eyebrow mb-1 block">To</span>
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
                  <DetailRow label="Transaction reference" value={<CopyText value={selected.transactionReference} />} />
                  <DetailRow label="Product" value={selected.productType} />
                  <DetailRow label="Transaction date" value={selected.transactionDate} />
                  <DetailRow label="Created on" value={selected.created_on} />
                  <DetailRow label="Updated on" value={selected.updated_on} />
                  <DetailRow label="Transaction id" value={<CopyText value={selected.id} />} />
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
