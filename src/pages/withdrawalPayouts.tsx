import { ColumnDef } from "@tanstack/react-table";
import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import TabItem from "@/components/tabItem";
import Button from "../components/shared/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import usePayouts from "@/hooks/use-payouts";
import { PayoutFilter, PayoutRow } from "@/types/payout-type";

const TABS: { label: string; value: PayoutFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Needs attention", value: "NEEDS_ATTENTION" },
  { label: "Liquidating", value: "LIQUIDATING" },
  { label: "Debiting", value: "DEBITING" },
  { label: "Paying", value: "PAYING" },
  { label: "Confirming", value: "CONFIRMING" },
  { label: "Paid", value: "PAID" },
];

const LABEL: Record<string, string> = {
  NEEDS_ATTENTION: "Needs attention",
  LIQUIDATING: "Liquidating",
  DEBITING: "Debiting",
  PAYING: "Paying",
  CONFIRMING: "Confirming",
  PAID: "Paid",
};

const MEANING: Record<string, string> = {
  LIQUIDATING: "Waiting for the customer's fixed deposit to be liquidated into their BankOne account.",
  DEBITING: "The liquidated money is being debited from the customer's BankOne account into the GL.",
  PAYING: "The GL has the money. The Flutterwave transfer to the customer's bank is being sent, or retried.",
  CONFIRMING: "Flutterwave accepted the transfer. Waiting for it to say the customer was paid.",
  PAID: "Flutterwave confirmed the customer was paid.",
  NEEDS_ATTENTION: "Something stopped it that a person has to look at. Nothing is lost: the plan was already reduced and the customer's money is safe. Fix the cause (for example, top up the Flutterwave balance), then retry.",
};

const TONE: Record<string, string> = {
  NEEDS_ATTENTION: "bg-red-100 text-red-700",
  LIQUIDATING: "bg-blue-100 text-blue-700",
  DEBITING: "bg-blue-100 text-blue-700",
  PAYING: "bg-amber-100 text-amber-800",
  CONFIRMING: "bg-amber-100 text-amber-800",
  PAID: "bg-green-100 text-green-700",
};

const PLAN: Record<string, string> = { SMART_LOCK: "Smart Lock", TARGET_SAVINGS: "Target Lock", SAVE_SMALL_SMALL: "SmallVest" };

const Chip = ({ status }: { status: string }) => (
  <span title={MEANING[status]} className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE[status] ?? TONE.PAYING}`}>
    {LABEL[status] ?? status}
  </span>
);

const naira = (n: number | null | undefined) => (n == null ? "-" : `₦${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`);
const when = (v: string | null | undefined) => (v ? new Date(v).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "-");
const duration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  return h < 48 ? `${h} h ${minutes % 60} min` : `${Math.floor(h / 24)} days`;
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1 border-b pb-2">
    <span className="text-[11px] uppercase tracking-wide text-gray-400">{label}</span>
    <span className="text-sm text-gray-800 break-words">{value ?? "-"}</span>
  </div>
);

/** One step of the journey: done, in progress (this is where it is), or not reached. */
const Step = ({ label, state, detail }: { label: string; state: "done" | "now" | "todo"; detail?: string }) => (
  <li className="flex items-start gap-3">
    <span
      className={`mt-0.5 inline-block size-3 shrink-0 rounded-full ${state === "done" ? "bg-green-500" : state === "now" ? "bg-amber-500" : "bg-gray-200"}`}
      aria-hidden
    />
    <span className="text-sm">
      <span className={state === "todo" ? "text-gray-400" : "font-medium text-gray-800"}>{label}</span>
      {detail && <span className="ml-2 text-xs text-gray-500">{detail}</span>}
    </span>
  </li>
);

const stepState = (status: string, step: 0 | 1 | 2 | 3): "done" | "now" | "todo" => {
  // how far it has got: 0 liquidating, 1 debiting, 2 paying (transfer being sent), 3 confirming (accepted, waiting to be paid), 4 paid
  const at = status === "LIQUIDATING" ? 0 : status === "DEBITING" ? 1 : status === "PAYING" ? 2 : status === "CONFIRMING" ? 3 : status === "PAID" ? 4 : -1;
  if (at === -1) return "todo"; // needs attention: where it stopped is in the facts below
  return at > step ? "done" : at === step ? "now" : "todo";
};

const WithdrawalPayouts = () => {
  const p = usePayouts();
  const payout = p.selected;

  const columns: ColumnDef<PayoutRow>[] = [
    { header: "Started", accessorKey: "createdOn", cell: ({ row }) => <span className="text-xs whitespace-nowrap">{when(row.original.createdOn)}</span> },
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
          <div className="text-gray-500">{PLAN[row.original.planType] ?? row.original.planType}</div>
        </div>
      ),
    },
    { header: "Status", accessorKey: "status", cell: ({ row }) => <Chip status={row.original.status} /> },
    {
      header: "Customer is paid",
      accessorKey: "sendAmount",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-semibold">{naira(row.original.sendAmount ?? row.original.netAmount)}</div>
          {row.original.transferFee != null && row.original.transferFee > 0 && (
            <div className="text-gray-500">after a {naira(row.original.transferFee)} fee</div>
          )}
        </div>
      ),
    },
    {
      header: "At this step",
      accessorKey: "minutesInStage",
      cell: ({ row }) =>
        row.original.status === "PAID" ? (
          <span className="text-xs text-gray-400">-</span>
        ) : (
          <span className={`text-xs whitespace-nowrap ${row.original.minutesInStage > 120 ? "font-semibold text-red-600" : ""}`}>
            {duration(row.original.minutesInStage)}
          </span>
        ),
    },
    {
      header: "Last problem",
      accessorKey: "lastError",
      cell: ({ row }) => (
        <span className="block max-w-[260px] truncate text-xs text-gray-700" title={row.original.lastError ?? ""}>
          {row.original.lastError ?? "-"}
        </span>
      ),
    },
    {
      header: "",
      id: "view",
      cell: ({ row }) => (
        <button onClick={() => p.setSelected(row.original)} className="text-xs text-[#7C2EBF] font-semibold">
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
                label={`${t.label}${p.list?.counts ? ` (${p.list.counts[t.value] ?? 0})` : ""}`}
                value={t.value}
                active={p.filter === t.value}
                onClick={p.changeFilter as never}
              />
            ))}
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-2 py-4 border-b">
            <input
              value={p.searchInput}
              onChange={(e) => p.setSearchInput(e.target.value)}
              placeholder="Search payout code, Flutterwave reference, customer or plan"
              className="border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
            />
            <Button name="Refresh" color="lightpurple" onClick={() => p.refetchList()} />
          </div>
          {p.filter !== "ALL" && <p className="px-3 pt-3 text-xs text-gray-500">{MEANING[p.filter]}</p>}
          <DataTable
            data={p.list?.content ?? []}
            columns={columns}
            loading={p.listLoading}
            error={p.listError}
            useApiPagination={true}
            totalPages={p.list?.totalPages || 1}
            currentPage={p.currentPage}
            onPageChange={(n) => p.setCurrentPage(n)}
            setPageSize={p.setPageSize}
            pageSize={p.pageSize}
          />
        </div>

        <Dialog open={!!payout} onOpenChange={(open) => !open && p.setSelected(null)}>
          <DialogContent className="bg-white max-w-3xl max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{payout ? `Withdrawal ${payout.code}` : "Withdrawal"}</DialogTitle>
            </DialogHeader>
            {payout && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <Chip status={payout.status} />
                  <p className="text-xs text-gray-600">{MEANING[payout.status]}</p>
                </div>

                {payout.lastError && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                    <span className="text-[11px] uppercase tracking-wide text-red-400 block mb-1">Last problem</span>
                    {payout.lastError}
                  </div>
                )}

                <section>
                  <h3 className="text-sm font-semibold mb-2">Journey</h3>
                  <ol className="space-y-2">
                    <Step label="Fixed deposit liquidated" state={stepState(payout.status, 0)} detail={`${naira(payout.liquidatedAmount)} of ${naira(payout.principal)}`} />
                    <Step label="Debited into the GL" state={stepState(payout.status, 1)} detail={`${naira(payout.debitedAmount)} of ${naira(payout.principal)}`} />
                    <Step
                      label="Transfer sent by Flutterwave"
                      state={stepState(payout.status, 2)}
                      detail={payout.payReference ? `ref ${payout.payReference} · attempt ${payout.payAttempts}` : undefined}
                    />
                    <Step label="Customer paid" state={stepState(payout.status, 3)} />
                  </ol>
                  {payout.status === "NEEDS_ATTENTION" && (
                    <p className="mt-2 text-xs text-gray-500">It stopped at the first step above that is not green.</p>
                  )}
                </section>

                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  <Row label="Customer" value={`${payout.customerName || "-"}${payout.customerEmail ? ` · ${payout.customerEmail}` : ""}`} />
                  <Row label="Plan" value={`${payout.planName ?? "-"} · ${PLAN[payout.planType] ?? payout.planType}`} />
                  <Row label="Taken out of the plan" value={naira(payout.principal)} />
                  <Row label="After tax and penalty" value={naira(payout.netAmount)} />
                  <Row label="Bank transfer fee charged to the customer" value={payout.transferFee == null ? "-" : `${naira(payout.transferFee)}${payout.feeSource ? ` (${payout.feeSource === "FLUTTERWAVE" ? "Flutterwave's figure" : "from the fee table"})` : ""}`} />
                  <Row label="Customer's bank is sent" value={naira(payout.sendAmount ?? payout.netAmount)} />
                  <Row
                    label="Fee Flutterwave reported"
                    value={
                      payout.actualFee == null
                        ? "-"
                        : `${naira(payout.actualFee)}${payout.transferFee != null && payout.actualFee !== payout.transferFee ? " · differs from what the customer was charged" : ""}`
                    }
                  />
                  <Row label="Debit tries that failed" value={payout.debitFailures} />
                  <Row label="Sent back through by staff" value={`${payout.retries} time${payout.retries === 1 ? "" : "s"}`} />
                  <Row label="Started" value={when(payout.createdOn)} />
                  <Row label="At this step since" value={`${when(payout.stageSince)} (${duration(payout.minutesInStage)})`} />
                  <Row label="Next try" value={when(payout.nextAttemptAt)} />
                </div>

                {payout.status === "NEEDS_ATTENTION" && (
                  <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
                    <h3 className="text-sm font-semibold text-amber-900">Send it back through</h3>
                    <p className="mt-1 text-xs text-amber-900">
                      Fix the cause first (for example, top up the Flutterwave balance or check the customer&apos;s bank account), then retry. It carries on from the
                      step it stopped at with a fresh round of attempts. It never pays twice: a transfer that was already started is asked about first, never resent
                      blindly.
                    </p>
                    {p.list?.canRetry ? (
                      <div className="mt-3">
                        <Button name="Retry this withdrawal" color="purple" loading={p.retry.isPending} onClick={() => p.retry.mutate(payout.id)} />
                      </div>
                    ) : (
                      <p className="mt-2 text-xs font-semibold text-amber-900">Only a super admin can send a withdrawal back through.</p>
                    )}
                  </section>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </article>
    </Container>
  );
};

export default WithdrawalPayouts;
