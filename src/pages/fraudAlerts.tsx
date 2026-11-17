import { ColumnDef } from "@tanstack/react-table";
import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import { Tabs } from "@/components/shared/tabs";
import Button from "../components/shared/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useFraudAlerts from "@/hooks/use-fraud-alerts";
import { FraudAlert, FraudStatusFilter } from "@/types/fraud-type";

const TABS: { label: string; value: FraudStatusFilter }[] = [
  { label: "Open", value: "OPEN" },
  { label: "Dismissed", value: "DISMISSED" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "All", value: "ALL" },
];

const RULE_NAMES: Record<string, string> = {
  NEW_ACCOUNT_LARGE_WITHDRAWAL: "Large withdrawal from a new account",
  MONEY_IN_THEN_OUT: "Money out soon after money in",
  PAYOUT_NAME_MISMATCH: "Payout account in a different name",
  PAYOUT_ACCOUNT_SHARED: "Payout account shared with another customer",
  LOGIN_FAILURES_ONE_ADDRESS: "One address failing to sign in to many accounts",
  WEBHOOK_REFUSAL_SPIKE: "Burst of refused payment webhooks",
  LIMIT_WOULD_BLOCK: "A limit would have refused this (not enforced)",
};

const SEVERITY_TONE: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-800",
  LOW: "bg-gray-100 text-gray-600",
};

const STATUS_TONE: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-800",
  DISMISSED: "bg-gray-100 text-gray-600",
  CONFIRMED: "bg-red-100 text-red-700",
};

const Chip = ({ text, tone }: { text: string; tone: string }) => (
  <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${tone}`}>{text}</span>
);

const naira = (n: number) => `₦${Number(n).toLocaleString("en-NG")}`;
const when = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "-";

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1 border-b pb-2">
    <span className="text-[11px] uppercase tracking-wide text-gray-400">{label}</span>
    <span className="text-sm text-gray-800 break-words">{value ?? "-"}</span>
  </div>
);

const selectClass =
  "border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]";

const FraudAlerts = () => {
  const f = useFraudAlerts();
  const a = f.selected;

  const columns: ColumnDef<FraudAlert>[] = [
    { header: "Raised", accessorKey: "createdOn", cell: ({ row }) => <span className="text-xs whitespace-nowrap">{when(row.original.createdOn)}</span> },
    { header: "Severity", accessorKey: "severity", cell: ({ row }) => <Chip text={row.original.severity} tone={SEVERITY_TONE[row.original.severity]} /> },
    {
      header: "What",
      accessorKey: "title",
      cell: ({ row }) => (
        <span className="block max-w-[280px] text-xs text-gray-800" title={RULE_NAMES[row.original.rule] ?? row.original.rule}>
          {row.original.title}
        </span>
      ),
    },
    { header: "Customer", accessorKey: "customer", cell: ({ row }) => <span className="text-xs">{row.original.customer ?? "System"}</span> },
    {
      header: "Withdrawals",
      id: "blocks",
      cell: ({ row }) =>
        row.original.blocksWithdrawals && row.original.status !== "DISMISSED" ? (
          <span className="text-xs font-semibold text-red-700">On hold</span>
        ) : (
          <span className="text-xs text-gray-500">-</span>
        ),
    },
    { header: "Status", accessorKey: "status", cell: ({ row }) => <Chip text={row.original.status} tone={STATUS_TONE[row.original.status]} /> },
    {
      header: "",
      id: "view",
      cell: ({ row }) => (
        <button onClick={() => f.open(row.original)} className="text-xs text-[#7C2EBF] font-semibold">
          Review
        </button>
      ),
    },
  ];

  return (
    <Container>
      <article className="mt-6 min-h-screen space-y-4">
        {f.settings && (
          <section className="rounded-md bg-white p-4 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-sm font-semibold">Limits in force</h2>
              <Chip text={f.settings.enforced ? "Enforced" : "Not enforced (alerts only)"} tone={f.settings.enforced ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-800"} />
            </div>
            <div className="grid gap-x-6 gap-y-1 text-xs text-gray-700 md:grid-cols-3">
              {f.settings.limits.map((l) => (
                <p key={l.tier}>
                  <span className="font-semibold">Tier {l.tier}:</span> {naira(l.daily)} a day, {naira(l.monthly)} a month
                </p>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Withdrawals pause for {f.settings.holdHours} hours after a PIN, password or extra bank account change. {f.settings.pinMaxFailures} wrong PINs lock
              withdrawals for {f.settings.pinLockMinutes} minutes. These are set on the server.
            </p>
          </section>
        )}

        <div className="bg-white rounded-md pb-2">
          <div className="px-4 pt-4">
            <Tabs
              label="Alert status"
              tabs={TABS.map((t) => ({ value: t.value, label: t.label, count: f.list?.counts ? (f.list.counts[t.value] ?? 0) : undefined, attention: t.value === "OPEN" && (f.list?.counts?.OPEN ?? 0) > 0 }))}
              value={f.status}
              onChange={f.changeStatus}
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-4 py-4 border-b">
            <input
              value={f.searchInput}
              onChange={(e) => f.setSearchInput(e.target.value)}
              placeholder="Search customer, rule or details"
              className={`${selectClass} placeholder:text-gray-400 w-full md:w-96`}
            />
            <select value={f.severity} onChange={(e) => f.changeSeverity(e.target.value)} aria-label="Severity" className={selectClass}>
              <option value="ALL">All severities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <Button name="Refresh" color="lightpurple" onClick={() => f.refetchList()} />
          </div>
          <DataTable
            data={f.list?.content ?? []}
            columns={columns}
            loading={f.listLoading}
            error={f.listError}
            useApiPagination={true}
            totalPages={f.list?.totalPages || 1}
            currentPage={f.currentPage}
            onPageChange={(p) => f.setCurrentPage(p)}
            setPageSize={f.setPageSize}
            pageSize={f.pageSize}
          />
        </div>

        <Dialog open={!!a} onOpenChange={(open) => !open && f.close()}>
          <DialogContent className="bg-white max-w-2xl max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Fraud alert</DialogTitle>
            </DialogHeader>
            {a && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip text={a.severity} tone={SEVERITY_TONE[a.severity]} />
                  <Chip text={a.status} tone={STATUS_TONE[a.status]} />
                  <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                </div>
                <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-800">
                  <span className="text-[11px] uppercase tracking-wide text-gray-400 block mb-1">What was found</span>
                  {a.details ?? "-"}
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  <Row label="Rule" value={RULE_NAMES[a.rule] ?? a.rule} />
                  <Row label="Raised" value={when(a.createdOn)} />
                  <Row label="Customer" value={a.customer ?? "The system, not one customer"} />
                  <Row label="Customer id" value={a.userId} />
                  <Row
                    label="Their withdrawals"
                    value={a.blocksWithdrawals ? (a.status === "DISMISSED" ? "Released" : "On hold until this is dismissed") : "Not held by this alert"}
                  />
                  {a.reviewedBy && <Row label="Reviewed by" value={`${a.reviewedBy}, ${when(a.reviewedOn)}`} />}
                </div>
                <section className="space-y-2">
                  <label htmlFor="fraud-note" className="text-sm font-semibold block">
                    Note <span className="font-normal text-gray-500">(what you checked, optional)</span>
                  </label>
                  <textarea
                    id="fraud-note"
                    rows={3}
                    maxLength={500}
                    value={f.note}
                    onChange={(e) => f.setNote(e.target.value)}
                    className="w-full border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
                  />
                  <div className="flex flex-wrap gap-3">
                    <Button name={f.resolving ? "Saving..." : "Dismiss: nothing wrong"} color="lightpurple" onClick={() => f.resolve("DISMISS")} />
                    <Button name={f.resolving ? "Saving..." : "Confirm: this is fraud"} color="purple" onClick={() => f.resolve("CONFIRM")} />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Dismissing releases the customer&apos;s withdrawals. Confirming keeps them on hold; to stop the customer signing in, deactivate them from the Customers page.
                  </p>
                  {f.resolveError && <p className="text-xs text-red-600">{f.resolveError}</p>}
                </section>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </article>
    </Container>
  );
};

export default FraudAlerts;
