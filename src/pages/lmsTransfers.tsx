import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  LmsPaymentProvider,
  LmsTransferInstruction,
} from "../types/table-type";
import { ActionIcon } from "../components/svg-icons/action-icon";
import Button from "../components/shared/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useLmsTransfers from "@/hooks/use-lms-transfers";

const TRANSFER_STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Successful", value: "SUCCESSFUL" },
  { label: "Failed", value: "FAILED" },
];

const PROVIDERS: { key: LmsPaymentProvider; label: string }[] = [
  { key: "PROVIDUS", label: "Providus" },
  { key: "BANKONE", label: "BankOne" },
];

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 border-b pb-2">
    <span className="text-[11px] uppercase tracking-wide text-gray-400">
      {label}
    </span>
    <span className="text-sm break-words">{value ?? "-"}</span>
  </div>
);

const SummaryCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) => (
  <div className="border rounded-md p-4 flex flex-col gap-1">
    <span className="text-xs text-gray-500">{label}</span>
    <span className={`text-xl font-bold ${accent ?? ""}`}>{value}</span>
  </div>
);

const LmsTransfers = () => {
  const {
    view,
    setView,
    allTransfers,
    allTransfersLoading,
    allTransfersError,
    transferStatusFilter,
    setTransferStatusFilter,
    statusFilter,
    setStatusFilter,
    selectedRecord,
    setSelectedRecord,
    providusBankNames,
    bankoneBankNames,
    pageSize,
    setPageSize,
    handleRetry,
    handleResendWebhook,
    actionLoadingId,
    handleTriggerReprocess,
    triggerLoading,
    activeProvider,
    providusSourceAccount,
    setProvidusSourceAccount,
    bankoneSourceAccount,
    setBankoneSourceAccount,
    handleSaveSourceAccount,
    savingProvider,
    handleActivateProvider,
    activatingProvider,
    showHistory,
    setShowHistory,
    configHistory,
    configHistoryLoading,
    report,
    reportLoading,
    reportError,
    reportProvider,
    setReportProvider,
    reportPeriod,
    setReportPeriod,
    reportFrom,
    setReportFrom,
    reportTo,
    setReportTo,
    reportPageSize,
    setReportPageSize,
  } = useLmsTransfers();

  const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleString() : "-";

  const describeBankCode = (
    code: string | null,
    names: Record<string, string>
  ) => {
    if (!code) return "-";
    const name = names[code];
    return name ? `${code} (${name})` : code;
  };

  const columns: ColumnDef<LmsTransferInstruction>[] = [
    {
      id: "number",
      header: "S/N",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "lmsReferenceId",
      header: () => <span>LMS Reference</span>,
    },
    {
      accessorKey: "customerName",
      header: () => <span>Customer</span>,
    },
    {
      accessorKey: "amount",
      header: () => <span>Amount</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as number) ?? 0;
        return (
          <span className="inline-block w-full">
            ₦
            {Number(value).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "bankName",
      header: () => <span>Bank</span>,
    },
    {
      id: "bankCodes",
      header: () => <span>Bank Codes</span>,
      cell: ({ row }) => {
        const { providusBankCode, bankoneBankCode } = row.original;
        return (
          <div className="flex flex-col gap-1">
            <span>
              Providus: {describeBankCode(providusBankCode, providusBankNames)}
            </span>
            <span>
              BankOne: {describeBankCode(bankoneBankCode, bankoneBankNames)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "accountNumber",
      header: () => <span>Account Number</span>,
    },
    {
      accessorKey: "loanAccountNumber",
      header: () => <span>Loan Account</span>,
    },
    {
      accessorKey: "transactionReference",
      header: () => <span>Transaction Reference</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "-";
        return <span className="inline-block">{value || "-"}</span>;
      },
    },
    {
      accessorKey: "providerUsed",
      header: () => <span>Provider Used</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return (
          <span className="inline-block capitalize">
            {value ? value.toLowerCase() : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <span>Status</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return (
          <span
            className={`inline-block capitalize ${
              value === "TREATED" ? "text-[#2C9720]" : "text-[#B58A00]"
            }`}
          >
            {value.toLowerCase()}
          </span>
        );
      },
    },
    {
      accessorKey: "transferStatus",
      header: () => <span>Transfer Status</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return (
          <div>
            {value === "SUCCESSFUL" ? (
              <span className="inline-block text-[#2C9720] capitalize">
                {value.toLowerCase()}
              </span>
            ) : value === "FAILED" ? (
              <span className="inline-block text-[#E70E02] capitalize">
                {value.toLowerCase()}
              </span>
            ) : (
              <span className="inline-block text-[#B58A00] capitalize">
                {value.toLowerCase()}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "failureReason",
      header: () => <span>Failure Reason</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return (
          <span
            className="inline-block max-w-[200px] truncate"
            title={value || undefined}
          >
            {value || "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "webhookSent",
      header: () => <span>Webhook Sent</span>,
      cell: ({ getValue }) => {
        const value = getValue() as boolean;
        return (
          <span
            className={`inline-block ${
              value ? "text-[#2C9720]" : "text-gray-500"
            }`}
          >
            {value ? "Yes" : "No"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdOn",
      header: () => <span>Created On</span>,
      cell: ({ getValue }) => (
        <span className="inline-block">
          {formatDate((getValue() as string) ?? null)}
        </span>
      ),
    },
    {
      accessorKey: "treatedOn",
      header: () => <span>Treated On</span>,
      cell: ({ getValue }) => (
        <span className="inline-block">
          {formatDate((getValue() as string) ?? null)}
        </span>
      ),
    },
    {
      accessorKey: "id",
      header: () => <span></span>,
      cell: ({ row }) => {
        const record = row.original;
        const busy = actionLoadingId === record.id;
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
                className="py-2 pl-3 cursor-pointer hover:opacity-80"
                onClick={() => setSelectedRecord(record)}
              >
                View Details
              </li>
              {record.transferStatus !== "SUCCESSFUL" && (
                <li
                  className="py-2 pl-3 cursor-pointer hover:opacity-80"
                  onClick={() => !busy && handleRetry(record.id)}
                >
                  {busy ? "Retrying..." : "Retry Transfer"}
                </li>
              )}
              {record.transferStatus === "SUCCESSFUL" && (
                <li
                  className="py-2 pl-3 cursor-pointer hover:opacity-80"
                  onClick={() => !busy && handleResendWebhook(record.id)}
                >
                  {busy ? "Resending..." : "Resend Webhook"}
                </li>
              )}
            </ul>
          </div>
        );
      },
    },
  ];

  return (
    <Container>
      <article className="mt-6 min-h-screen">
        {/* PAYMENT SERVICE CONFIG */}
        <div className="bg-white rounded-md p-6 mb-6">
          <h1 className="text-lg font-bold mb-1">LMS Transfer Settings</h1>
          <p className="text-xs text-gray-500 mb-6">
            Each provider keeps its own source account. Exactly one provider is
            active at a time — activating one automatically deactivates the
            other.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {PROVIDERS.map(({ key, label }) => {
              const isActive = activeProvider === key;
              const account =
                key === "PROVIDUS"
                  ? providusSourceAccount
                  : bankoneSourceAccount;
              const setAccount =
                key === "PROVIDUS"
                  ? setProvidusSourceAccount
                  : setBankoneSourceAccount;
              return (
                <div
                  key={key}
                  className={`border rounded-md p-4 flex flex-col gap-3 ${
                    isActive ? "border-[#7C2EBF]" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{label}</span>
                    {isActive ? (
                      <span className="text-xs bg-[#F6EBFE] text-[#7C2EBF] px-3 py-1 rounded-full font-semibold">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivateProvider(key)}
                        disabled={activatingProvider === key}
                        className="text-xs border border-[#7C2EBF] text-[#7C2EBF] px-3 py-1 rounded-full hover:bg-[#F6EBFE] disabled:opacity-50"
                      >
                        {activatingProvider === key
                          ? "Activating..."
                          : "Set Active"}
                      </button>
                    )}
                  </div>
                  <Input
                    label="Source Account"
                    placeholder={`Enter ${label} source account`}
                    className="text-xs h-[40px]"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                  />
                  <div className="max-w-[160px]">
                    <Button
                      color="lightpurple"
                      name="Save Account"
                      type="button"
                      onClick={() => handleSaveSourceAccount(key)}
                      loading={savingProvider === key}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {!activeProvider && (
            <p className="text-xs text-[#E70E02] mt-4">
              No provider is active — LMS transfers will fail until one is
              activated.
            </p>
          )}

          {/* CONFIG CHANGE HISTORY */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs text-[#7C2EBF] font-semibold mt-6"
          >
            {showHistory ? "Hide Change History ▲" : "View Change History ▼"}
          </button>
          {showHistory && (
            <div className="mt-3 overflow-x-auto">
              {configHistoryLoading ? (
                <p className="text-xs text-gray-500 py-2">
                  Loading history...
                </p>
              ) : configHistory.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">
                  No configuration changes recorded yet.
                </p>
              ) : (
                <table className="table w-full whitespace-nowrap text-xs">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4 font-semibold">Date</th>
                      <th className="py-2 pr-4 font-semibold">Provider</th>
                      <th className="py-2 pr-4 font-semibold">
                        Source Account
                      </th>
                      <th className="py-2 pr-4 font-semibold">Active</th>
                      <th className="py-2 pr-4 font-semibold">Change</th>
                      <th className="py-2 pr-4 font-semibold">Changed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {configHistory.map((entry, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 pr-4">
                          {formatDate(entry.changedOn)}
                        </td>
                        <td className="py-2 pr-4 capitalize">
                          {entry.provider?.toLowerCase()}
                        </td>
                        <td className="py-2 pr-4">
                          {entry.sourceAccount || "-"}
                        </td>
                        <td className="py-2 pr-4">
                          {entry.active ? "Yes" : "No"}
                        </td>
                        <td className="py-2 pr-4">
                          {entry.changeDescription || "-"}
                        </td>
                        <td className="py-2 pr-4">{entry.changedBy || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* TRANSFERS / REPORT */}
        <div className="bg-white rounded-md pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-6 px-2 gap-3">
            <div className="flex flex-row gap-6 text-xs text-[#6D6C6C]">
              {(["transfers", "report"] as const).map((tab) => (
                <p
                  key={tab}
                  className={`${
                    view === tab
                      ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                      : ""
                  } mx-2 pb-6 cursor-pointer capitalize`}
                  onClick={() => setView(tab)}
                >
                  {tab === "transfers" ? "Transfers" : "Report"}
                </p>
              ))}
            </div>
            {view === "transfers" && (
              <div className="pb-4 md:pb-6 pr-2">
                <Button
                  color="purple"
                  name="Reprocess All Pending/Failed"
                  type="button"
                  onClick={handleTriggerReprocess}
                  loading={triggerLoading}
                />
              </div>
            )}
          </div>

          {view === "transfers" ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between px-2 gap-3 border-t pt-4">
                <div className="flex flex-row gap-8 text-xs text-[#6D6C6C]">
                  {TRANSFER_STATUS_TABS.map((tab) => (
                    <p
                      key={tab.label}
                      className={`${
                        transferStatusFilter === tab.value
                          ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
                          : ""
                      } mx-2 pb-4 cursor-pointer`}
                      onClick={() => setTransferStatusFilter(tab.value)}
                    >
                      {tab.label}
                    </p>
                  ))}
                </div>
                <div className="flex items-center gap-2 pb-4 pr-2">
                  <label className="text-xs text-gray-600">
                    Treatment Status:
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
                  >
                    <option value="">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="TREATED">Treated</option>
                  </select>
                </div>
              </div>
              <DataTable
                data={allTransfers ?? []}
                columns={columns}
                loading={allTransfersLoading}
                error={allTransfersError}
                pageSize={pageSize}
                setPageSize={setPageSize}
              />
            </>
          ) : (
            <div className="border-t">
              {/* REPORT FILTERS */}
              <div className="flex flex-col md:flex-row md:items-end gap-3 px-4 pt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600">Provider</label>
                  <select
                    value={reportProvider}
                    onChange={(e) => setReportProvider(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
                  >
                    <option value="">All Providers</option>
                    <option value="PROVIDUS">Providus</option>
                    <option value="BANKONE">BankOne</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600">Period</label>
                  <select
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    className="border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
                  >
                    <option value="">All Time</option>
                    <option value="DAILY">Today</option>
                    <option value="WEEKLY">Last 7 Days</option>
                    <option value="CUSTOM">Custom Range</option>
                  </select>
                </div>
                {reportPeriod === "CUSTOM" && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-600">From</label>
                      <input
                        type="date"
                        value={reportFrom}
                        onChange={(e) => setReportFrom(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-600">To</label>
                      <input
                        type="date"
                        value={reportTo}
                        onChange={(e) => setReportTo(e.target.value)}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* REPORT SUMMARY */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 px-4 py-4">
                <SummaryCard
                  label="Total Transfers"
                  value={report?.totalTransfers ?? 0}
                />
                <SummaryCard
                  label="Successful"
                  value={report?.successful ?? 0}
                  accent="text-[#2C9720]"
                />
                <SummaryCard
                  label="Failed"
                  value={report?.failed ?? 0}
                  accent="text-[#E70E02]"
                />
                <SummaryCard
                  label="Via Providus"
                  value={report?.byProvider?.PROVIDUS ?? 0}
                />
                <SummaryCard
                  label="Via BankOne"
                  value={report?.byProvider?.BANKONE ?? 0}
                />
              </div>
              {(report?.from || report?.to) && (
                <p className="text-xs text-gray-500 px-4 pb-2">
                  Covering {formatDate(report?.from ?? null)} to{" "}
                  {formatDate(report?.to ?? null)}
                </p>
              )}

              <DataTable
                data={report?.transfers ?? []}
                columns={columns}
                loading={reportLoading}
                error={reportError}
                pageSize={reportPageSize}
                setPageSize={setReportPageSize}
              />
            </div>
          )}
        </div>

        {/* RECORD DETAILS */}
        <Dialog
          open={!!selectedRecord}
          onOpenChange={(open) => !open && setSelectedRecord(null)}
        >
          <DialogContent className="bg-white max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Transfer Details — {selectedRecord?.lmsReferenceId}
              </DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-3 mt-2">
                <DetailRow
                  label="Customer"
                  value={selectedRecord.customerName}
                />
                <DetailRow
                  label="Amount"
                  value={`₦${Number(
                    selectedRecord.amount ?? 0
                  ).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`}
                />
                <DetailRow label="Bank" value={selectedRecord.bankName} />
                <DetailRow
                  label="Account Number"
                  value={selectedRecord.accountNumber}
                />
                <DetailRow
                  label="Providus Bank Code"
                  value={describeBankCode(
                    selectedRecord.providusBankCode,
                    providusBankNames
                  )}
                />
                <DetailRow
                  label="BankOne Bank Code"
                  value={describeBankCode(
                    selectedRecord.bankoneBankCode,
                    bankoneBankNames
                  )}
                />
                <DetailRow
                  label="Loan Account"
                  value={selectedRecord.loanAccountNumber}
                />
                <DetailRow
                  label="BankOne Customer ID"
                  value={selectedRecord.bankOneCustomerId}
                />
                <DetailRow
                  label="Narration"
                  value={selectedRecord.narration}
                />
                <DetailRow
                  label="Transaction Reference"
                  value={selectedRecord.transactionReference}
                />
                <DetailRow
                  label="Provider Used"
                  value={
                    selectedRecord.providerUsed
                      ? selectedRecord.providerUsed.toLowerCase()
                      : "-"
                  }
                />
                <DetailRow
                  label="Status"
                  value={selectedRecord.status?.toLowerCase()}
                />
                <DetailRow
                  label="Transfer Status"
                  value={
                    <span
                      className={
                        selectedRecord.transferStatus === "SUCCESSFUL"
                          ? "text-[#2C9720]"
                          : selectedRecord.transferStatus === "FAILED"
                          ? "text-[#E70E02]"
                          : "text-[#B58A00]"
                      }
                    >
                      {selectedRecord.transferStatus?.toLowerCase()}
                    </span>
                  }
                />
                <DetailRow
                  label="Failure Reason"
                  value={selectedRecord.failureReason}
                />
                <DetailRow
                  label="Webhook Sent"
                  value={selectedRecord.webhookSent ? "Yes" : "No"}
                />
                <DetailRow
                  label="Webhook Sent At"
                  value={formatDate(selectedRecord.webhookSentAt)}
                />
                <DetailRow
                  label="Treated On"
                  value={formatDate(selectedRecord.treatedOn)}
                />
                <DetailRow
                  label="Created On"
                  value={formatDate(selectedRecord.createdOn)}
                />
                <DetailRow
                  label="Updated On"
                  value={formatDate(selectedRecord.updatedOn)}
                />
                <div className="md:col-span-2">
                  <DetailRow
                    label="Webhook Response"
                    value={
                      selectedRecord.webhookResponse ? (
                        <pre className="text-xs bg-gray-50 rounded-md p-3 whitespace-pre-wrap break-all">
                          {selectedRecord.webhookResponse}
                        </pre>
                      ) : (
                        "-"
                      )
                    }
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </article>
    </Container>
  );
};

export default LmsTransfers;
