import { Tabs } from "@/components/shared/tabs";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { ChevronDown, Landmark, TriangleAlert } from "lucide-react";
import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  LmsPaymentProvider,
  LmsTransferInstruction,
} from "../types/table-type";
import { RowMenu } from "@/components/shared/row-menu";
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
  <div className="flex flex-col gap-1 border-b border-line pb-2">
    <span className="v-eyebrow">{label}</span>
    <span className="break-words text-sm">{value ?? "-"}</span>
  </div>
);

const SummaryCard = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "brand" | "mint" | "danger" | "sky" | "neutral";
}) => <StatCard label={label} value={value} tone={tone ?? "brand"} />;

/** The status words in the table, as badges. */
const statusChip = (value: string) => {
  const tone = value === "SUCCESSFUL" || value === "TREATED" ? "v-chip-ok" : value === "FAILED" ? "v-chip-bad" : "v-chip-warn";
  return <span className={`v-chip capitalize ${tone}`}>{value.toLowerCase()}</span>;
};

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
      accessorKey: "transferableAmount",
      header: () => <span>Transferable Amount</span>,
      cell: ({ row }) => {
        const value = row.original.transferableAmount ?? row.original.amount;
        return (
          <span className="inline-block w-full">
            ₦
            {Number(value ?? 0).toLocaleString("en-NG", {
              minimumFractionDigits: 2,
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "ippisNumber",
      header: () => <span>IPPIS Number</span>,
      cell: ({ getValue }) => {
        const value = (getValue() as string) ?? "";
        return <span className="inline-block">{value || "-"}</span>;
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
      header: () => <span>Loan Account ID</span>,
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
      cell: ({ getValue }) => statusChip(((getValue() as string) ?? "")),
    },
    {
      accessorKey: "transferStatus",
      header: () => <span>Transfer Status</span>,
      cell: ({ getValue }) => statusChip(((getValue() as string) ?? "")),
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
          <span className={`v-chip ${value ? "v-chip-ok" : ""}`}>{value ? "Yes" : "No"}</span>
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
          <RowMenu
            items={[
              { label: "View Details", onSelect: () => setSelectedRecord(record) },
              {
                label: busy ? "Retrying..." : "Retry Transfer",
                hidden: record.transferStatus === "SUCCESSFUL",
                disabled: busy,
                onSelect: () => handleRetry(record.id),
              },
              {
                label: busy ? "Resending..." : "Resend Webhook",
                hidden: record.status !== "TREATED",
                disabled: busy,
                onSelect: () => handleResendWebhook(record.id),
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <Container>
      <article className="mt-6 min-h-screen">
        {/* PAYMENT SERVICE CONFIG */}
        <div className="bg-white rounded-md p-6 mb-6">
          <h1 className="mb-1 font-display text-lg font-semibold">LMS Transfer Settings</h1>
          <p className="mb-6 text-sm text-fg2">
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
                  className={`flex flex-col gap-4 rounded-2xl border p-5 transition-colors ${
                    isActive
                      ? "border-brand/50 bg-brand/10 shadow-[0_0_0_1px_rgb(var(--brand-rgb)/0.2),0_18px_40px_-24px_rgb(var(--brand-rgb)/0.6)]"
                      : "border-line bg-panel"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-3">
                      <span className={`grid h-10 w-10 place-items-center rounded-xl border ${isActive ? "border-brand/40 bg-brand/20 text-brand" : "border-line bg-panel-hi text-fg3"}`}>
                        <Landmark size={18} />
                      </span>
                      <span className="font-display text-base font-semibold">{label}</span>
                    </span>
                    {isActive ? (
                      <span className="v-chip v-chip-ok">
                        <span className="v-live-dot" /> Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivateProvider(key)}
                        disabled={activatingProvider === key}
                        className="v-btn v-btn-soft v-btn-sm"
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
            <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              <TriangleAlert size={16} /> No provider is active — LMS transfers will fail until one is activated.
            </p>
          )}

          {/* CONFIG CHANGE HISTORY */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
          >
            {showHistory ? "Hide Change History" : "View Change History"}
            <ChevronDown size={14} className={`transition-transform duration-200 ${showHistory ? "rotate-180" : ""}`} />
          </button>
          {showHistory && (
            <div className="mt-3 overflow-x-auto">
              {configHistoryLoading ? (
                <p className="py-2 text-xs text-fg3">
                  Loading history...
                </p>
              ) : configHistory.length === 0 ? (
                <p className="py-2 text-xs text-fg3">
                  No configuration changes recorded yet.
                </p>
              ) : (
                <table className="v-table">
                  <thead>
                    <tr>
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
          <div className="flex flex-col gap-3 px-4 pt-4 pb-4 md:flex-row md:items-center md:justify-between">
            <Tabs
              tabs={[
                { value: "transfers", label: "Transfers" },
                { value: "report", label: "Report" },
              ]}
              value={view}
              onChange={(value) => setView(value as typeof view)}
              label="View"
            />
            {view === "transfers" && (
              <div>
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
              <div className="flex flex-col gap-3 border-t border-line px-4 py-4 md:flex-row md:items-center md:justify-between">
                <Tabs
                  tabs={TRANSFER_STATUS_TABS}
                  value={transferStatusFilter}
                  onChange={setTransferStatusFilter}
                  label="Transfer status"
                />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-fg2">
                    Treatment Status:
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="v-field !w-auto !py-1.5"
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
            <div className="border-t border-line">
              {/* REPORT FILTERS */}
              <div className="flex flex-col md:flex-row md:items-end gap-3 px-4 pt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-fg2">Provider</label>
                  <select
                    value={reportProvider}
                    onChange={(e) => setReportProvider(e.target.value)}
                    className="v-field !w-auto"
                  >
                    <option value="">All Providers</option>
                    <option value="PROVIDUS">Providus</option>
                    <option value="BANKONE">BankOne</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-fg2">Period</label>
                  <select
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    className="v-field !w-auto"
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
                      <label className="text-xs text-fg2">From</label>
                      <input
                        type="date"
                        value={reportFrom}
                        onChange={(e) => setReportFrom(e.target.value)}
                        className="v-field !w-auto"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-fg2">To</label>
                      <input
                        type="date"
                        value={reportTo}
                        onChange={(e) => setReportTo(e.target.value)}
                        className="v-field !w-auto"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* REPORT SUMMARY */}
              <div className="px-4 py-4">
                <StatGrid className="lg:grid-cols-5">
                  <SummaryCard label="Total Transfers" value={report?.totalTransfers ?? 0} tone="brand" />
                  <SummaryCard label="Successful" value={report?.successful ?? 0} tone="mint" />
                  <SummaryCard label="Failed" value={report?.failed ?? 0} tone="danger" />
                  <SummaryCard label="Via Providus" value={report?.byProvider?.PROVIDUS ?? 0} tone="sky" />
                  <SummaryCard label="Via BankOne" value={report?.byProvider?.BANKONE ?? 0} tone="neutral" />
                </StatGrid>
              </div>
              {(report?.from || report?.to) && (
                <p className="px-4 pb-3 text-xs text-fg3">
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
          <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
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
                  label="Amount (Gross)"
                  value={`₦${Number(
                    selectedRecord.amount ?? 0
                  ).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`}
                />
                <DetailRow
                  label="Upfront Fees"
                  value={
                    selectedRecord.upfrontFees != null
                      ? `₦${Number(selectedRecord.upfrontFees).toLocaleString(
                          "en-NG",
                          { minimumFractionDigits: 2 }
                        )}`
                      : "-"
                  }
                />
                <DetailRow
                  label="Transferable Amount"
                  value={`₦${Number(
                    selectedRecord.transferableAmount ??
                      selectedRecord.amount ??
                      0
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
                  label="Loan Account ID"
                  value={selectedRecord.loanAccountNumber}
                />
                <DetailRow
                  label="BankOne Customer ID"
                  value={selectedRecord.bankOneCustomerId}
                />
                <DetailRow
                  label="IPPIS Number"
                  value={selectedRecord.ippisNumber}
                />
                <DetailRow
                  label="Narration (from LMS, not sent to bank)"
                  value={selectedRecord.narration}
                />
                <DetailRow
                  label="Bank Narration (as sent)"
                  value={
                    selectedRecord.ippisNumber
                      ? `${selectedRecord.ippisNumber} DOMINION LOAN Transfer ${selectedRecord.customerName}`
                      : "-"
                  }
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
                  value={statusChip(selectedRecord.transferStatus ?? "")}
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
                        <pre className="v-mono whitespace-pre-wrap break-all rounded-xl border border-line bg-field p-3 text-xs">
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
