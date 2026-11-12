import { ColumnDef } from "@tanstack/react-table";
import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import TabItem from "@/components/tabItem";
import Button from "../components/shared/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useAutoSave from "@/hooks/use-auto-save";
import { AutoSaveFilter, AutoSaveRow } from "@/types/auto-save-type";

const TABS: { label: string; value: AutoSaveFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "On track", value: "ON" },
  { label: "Behind", value: "BEHIND" },
  { label: "Paused", value: "PAUSED" },
  { label: "Waiting", value: "WAITING" },
];

const MEANING: Record<string, string> = {
  ON: "Running as planned: its debits are being taken from the customer's wallet.",
  BEHIND: "The wallet was too short on the last debit. It is tried again the next day, and the customer is emailed. After three days in a row it is paused.",
  PAUSED: "The system switched it off (the wallet was short three days in a row, or the plan ended). The customer has to turn it on again.",
  WAITING: "The plan is not funded yet, so nothing is taken. A Target Lock waiting for its first bank transfer is removed if it does not arrive within 24 hours.",
};

const TONE: Record<string, string> = {
  ON: "bg-green-100 text-green-700",
  BEHIND: "bg-amber-100 text-amber-800",
  PAUSED: "bg-red-100 text-red-700",
  WAITING: "bg-gray-100 text-gray-600",
};

const TYPE_LABEL: Record<string, string> = { SMALLVEST: "SmallVest", TARGET_LOCK: "Target Lock" };
const EVERY: Record<string, string> = { DAILY: "day", WEEKLY: "week", MONTHLY: "month", YEARLY: "year" };

const Chip = ({ state }: { state: string }) => (
  <span title={MEANING[state]} className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE[state] ?? TONE.WAITING}`}>
    {state === "ON" ? "On track" : state.charAt(0) + state.slice(1).toLowerCase()}
  </span>
);

const naira = (n: number | null | undefined) => (n == null ? "-" : `₦${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`);
const day = (v: string | null | undefined) => (v ? new Date(`${v.slice(0, 10)}T00:00:00`).toLocaleDateString("en-NG", { dateStyle: "medium" }) : "-");
const when = (v: string | null | undefined) => (v ? new Date(v).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "-");
const schedule = (r: AutoSaveRow) => (r.amount == null ? "-" : `${naira(r.amount)} every ${EVERY[r.frequency ?? "MONTHLY"] ?? "month"}`);

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1 border-b pb-2">
    <span className="text-[11px] uppercase tracking-wide text-gray-400">{label}</span>
    <span className="text-sm text-gray-800 break-words">{value ?? "-"}</span>
  </div>
);

const AutoSave = () => {
  const a = useAutoSave();
  const plan = a.selected;

  const columns: ColumnDef<AutoSaveRow>[] = [
    {
      header: "Customer",
      accessorKey: "customerName",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-semibold">{row.original.customerName || "-"}</div>
          <div className="text-gray-500">{row.original.customerEmail ?? ""}</div>
        </div>
      ),
    },
    {
      header: "Plan",
      accessorKey: "planName",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-semibold">{row.original.planName ?? "-"}</div>
          <div className="text-gray-500">{TYPE_LABEL[row.original.planType]}</div>
        </div>
      ),
    },
    { header: "Status", accessorKey: "state", cell: ({ row }) => <Chip state={row.original.state} /> },
    {
      header: "Schedule",
      accessorKey: "amount",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-semibold">{schedule(row.original)}</div>
          {row.original.firstAmount != null && <div className="text-gray-500">first {naira(row.original.firstAmount)}</div>}
        </div>
      ),
    },
    {
      header: "Next debit",
      accessorKey: "nextDate",
      cell: ({ row }) => <span className="text-xs whitespace-nowrap">{day(row.original.nextDate)}</span>,
    },
    {
      header: "Taken so far",
      accessorKey: "totalDebited",
      cell: ({ row }) => (
        <span className="text-xs whitespace-nowrap">
          {row.original.debitsTaken} × · {naira(row.original.totalDebited)}
        </span>
      ),
    },
    {
      header: "Wallet",
      accessorKey: "walletBalance",
      cell: ({ row }) => {
        const short = row.original.amount != null && row.original.walletBalance != null && row.original.walletBalance < row.original.amount;
        return <span className={`text-xs ${short ? "font-semibold text-red-600" : ""}`}>{naira(row.original.walletBalance)}</span>;
      },
    },
    {
      header: "Missed",
      accessorKey: "misses",
      cell: ({ row }) => <span className="text-xs">{row.original.misses > 0 ? `${row.original.misses} day${row.original.misses === 1 ? "" : "s"}` : "-"}</span>,
    },
    {
      header: "",
      id: "view",
      cell: ({ row }) => (
        <button onClick={() => a.setSelected(row.original)} className="text-xs text-[#7C2EBF] font-semibold">
          View
        </button>
      ),
    },
  ];

  return (
    <Container>
      <article className="mt-6 min-h-screen">
        <div className="bg-white rounded-md pb-2">
          <div className="flex flex-row flex-wrap gap-x-5 md:gap-x-8 text-xs text-[#6D6C6C] pt-6 px-2">
            {TABS.map((t) => (
              <TabItem
                key={t.value}
                label={`${t.label}${a.list?.counts ? ` (${a.list.counts[t.value] ?? 0})` : ""}`}
                value={t.value}
                active={a.filter === t.value}
                onClick={a.changeFilter as never}
              />
            ))}
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-2 py-4 border-b">
            <input
              value={a.searchInput}
              onChange={(e) => a.setSearchInput(e.target.value)}
              placeholder="Search customer name, email or plan"
              className="border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
            />
            <select
              value={a.type}
              onChange={(e) => a.changeType(e.target.value)}
              aria-label="Plan type"
              className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
            >
              <option value="ALL">All plans</option>
              <option value="SMALLVEST">SmallVest</option>
              <option value="TARGET_LOCK">Target Lock</option>
            </select>
            <Button name="Refresh" color="lightpurple" onClick={() => a.refetchList()} />
          </div>
          {a.filter !== "ALL" && <p className="px-3 pt-3 text-xs text-gray-500">{MEANING[a.filter]}</p>}
          <DataTable
            data={a.list?.content ?? []}
            columns={columns}
            loading={a.listLoading}
            error={a.listError}
            useApiPagination={true}
            totalPages={a.list?.totalPages || 1}
            currentPage={a.currentPage}
            onPageChange={(p) => a.setCurrentPage(p)}
            setPageSize={a.setPageSize}
            pageSize={a.pageSize}
          />
        </div>

        <Dialog open={!!plan} onOpenChange={(open) => !open && a.setSelected(null)}>
          <DialogContent className="bg-white max-w-3xl max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{plan ? `${plan.planName ?? "Plan"} · ${TYPE_LABEL[plan.planType]}` : "Plan"}</DialogTitle>
            </DialogHeader>
            {plan && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <Chip state={plan.state} />
                  <p className="text-xs text-gray-600">{MEANING[plan.state]}</p>
                </div>
                {plan.pausedReason && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    <span className="text-[11px] uppercase tracking-wide text-red-400 block mb-1">Why it stopped</span>
                    {plan.pausedReason}
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  <Row label="Customer" value={`${plan.customerName || "-"}${plan.customerEmail ? ` · ${plan.customerEmail}` : ""}`} />
                  <Row label="Wallet balance" value={naira(plan.walletBalance)} />
                  <Row label="Schedule" value={schedule(plan)} />
                  {plan.firstAmount != null && <Row label="First deposit" value={naira(plan.firstAmount)} />}
                  <Row label="Next debit" value={day(plan.nextDate)} />
                  <Row label="Last debit" value={day(plan.lastDebitDate)} />
                  {plan.startDate && <Row label="Started" value={day(plan.startDate)} />}
                  <Row label="Days missed in a row" value={plan.misses} />
                  <Row label="Plan status" value={plan.planStatus} />
                  <Row label="Saved so far" value={naira(plan.saved)} />
                  {plan.target != null && <Row label="Target" value={naira(plan.target)} />}
                  <Row label="Debits taken by auto-save" value={`${plan.debitsTaken} · ${naira(plan.totalDebited)}`} />
                  {plan.awaitingInitialUntil && <Row label="First deposit due by" value={when(plan.awaitingInitialUntil)} />}
                </div>
                <section>
                  <h3 className="text-sm font-semibold mb-2">Recent debits</h3>
                  {a.debitsLoading && <p className="text-xs text-gray-500">Loading...</p>}
                  {!a.debitsLoading && (a.debits?.length ?? 0) === 0 && <p className="text-xs text-gray-500">No debit has been taken yet.</p>}
                  {(a.debits?.length ?? 0) > 0 && (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-400">
                          <th className="py-1 font-normal">Due</th>
                          <th className="py-1 font-normal">Amount</th>
                          <th className="py-1 font-normal">Reference</th>
                          <th className="py-1 font-normal">Taken</th>
                        </tr>
                      </thead>
                      <tbody>
                        {a.debits?.map((d) => (
                          <tr key={d.id} className="border-t">
                            <td className="py-1.5">{day(d.dueDate)}</td>
                            <td className="py-1.5 font-semibold">{naira(d.amount)}</td>
                            <td className="py-1.5 font-mono">{d.reference}</td>
                            <td className="py-1.5">{when(d.createdOn)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </article>
    </Container>
  );
};

export default AutoSave;
