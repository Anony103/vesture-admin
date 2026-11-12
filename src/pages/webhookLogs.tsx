import { ColumnDef } from "@tanstack/react-table";
import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import { Tabs } from "@/components/shared/tabs";
import Button from "../components/shared/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useWebhookLogs from "@/hooks/use-webhook-logs";
import { WebhookAppFilter, WebhookFilter, WebhookLogItem } from "@/types/webhook-type";

const TABS: { label: string; value: WebhookFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Credited", value: "CREDITED" },
  { label: "Refused", value: "REFUSED" },
  { label: "Retry", value: "RETRY" },
  { label: "Duplicate", value: "DUPLICATE" },
  { label: "Ignored", value: "IGNORED" },
  { label: "Error", value: "ERROR" },
];

const APPS: { label: string; value: WebhookAppFilter }[] = [
  { label: "All apps", value: "ALL" },
  { label: "Vesture", value: "VESTURE" },
  { label: "Travel", value: "TRAVEL" },
  { label: "Rent+", value: "RENT_PLUS" },
  { label: "Other", value: "OTHER" },
];

const APP_SHORT: Record<string, string> = { VESTURE: "Vesture", TRAVEL: "Travel", RENT_PLUS: "Rent+", OTHER: "Other" };

const APP_LONG: Record<string, string> = {
  VESTURE: "Vesture (its own tx_ref prefix)",
  TRAVEL: "Travel (shares the Flutterwave account)",
  RENT_PLUS: "Rent+ (shares the Flutterwave account)",
  OTHER: "Other: the tx_ref matches no known app. If this is Rent+ or Travel, its tx_ref prefix needs to be added to the server settings.",
};

const MEANING: Record<string, string> = {
  CREDITED: "Money was added to the customer's wallet or plan.",
  DUPLICATE: "Flutterwave sent a transfer we had already credited, so nothing moved.",
  IGNORED: "Not money for a Vesture customer (a card payment, a failed charge, a payout event, or another app's payment on the shared Flutterwave account), so nothing to credit.",
  REFUSED: "Rejected and not credited: wrong secret hash, no such transaction at Flutterwave, details that differ, or no customer with that email.",
  RETRY: "We could not confirm it with Flutterwave right now, so we answered with an error and Flutterwave will send it again.",
  ERROR: "Something failed inside our server while handling it.",
};

const TONE: Record<string, string> = {
  CREDITED: "bg-green-100 text-green-700",
  DUPLICATE: "bg-gray-100 text-gray-600",
  IGNORED: "bg-gray-100 text-gray-600",
  REFUSED: "bg-red-100 text-red-700",
  RETRY: "bg-amber-100 text-amber-800",
  ERROR: "bg-red-100 text-red-700",
};

const Chip = ({ outcome }: { outcome: string }) => (
  <span
    title={MEANING[outcome]}
    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE[outcome] ?? TONE.IGNORED}`}
  >
    {outcome}
  </span>
);

const HASH_TEXT: Record<string, string> = {
  OK: "Matched",
  MISSING_HEADER: "No header sent",
  MISMATCH: "Did not match",
  SERVER_HASH_UNSET: "Not set on our server",
  NOT_APPLICABLE: "-",
};

const SOURCE_SHORT: Record<string, string> = {
  WEBHOOK: "Webhook",
  CATCH_UP: "Catch-up job",
  STAGING_TEST: "Staging test",
};

const SOURCE_LONG: Record<string, string> = {
  WEBHOOK: "Flutterwave called our webhook",
  CATCH_UP: "Catch-up job (found by asking Flutterwave)",
  STAGING_TEST: "Staging test funding (a super admin simulated this transfer; no real money moved)",
};

const when = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "medium" }) : "-";

const money = (amount: number | null, currency: string | null) =>
  amount == null ? "-" : `${currency === "NGN" || !currency ? "₦" : `${currency} `}${Number(amount).toLocaleString("en-NG")}`;

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1 border-b pb-2">
    <span className="text-[11px] uppercase tracking-wide text-gray-400">{label}</span>
    <span className="text-sm text-gray-800 break-words">{value ?? "-"}</span>
  </div>
);

const pretty = (raw: string | null | undefined) => {
  if (!raw) return "";
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
};

const WebhookLogs = () => {
  const w = useWebhookLogs();
  const detail = w.detail;

  const columns: ColumnDef<WebhookLogItem>[] = [
    {
      header: "Received",
      accessorKey: "createdOn",
      cell: ({ row }) => <span className="text-xs whitespace-nowrap">{when(row.original.createdOn)}</span>,
    },
    {
      header: "App",
      accessorKey: "app",
      cell: ({ row }) => (
        <span
          title={APP_LONG[row.original.app]}
          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            row.original.app === "VESTURE" ? "bg-purple-100 text-purple-700" : row.original.app === "OTHER" ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-700"
          }`}
        >
          {APP_SHORT[row.original.app] ?? row.original.app}
        </span>
      ),
    },
    { header: "Outcome", accessorKey: "outcome", cell: ({ row }) => <Chip outcome={row.original.outcome} /> },
    {
      header: "Source",
      accessorKey: "source",
      cell: ({ row }) => (
        <span className="text-xs">{SOURCE_SHORT[row.original.source] ?? row.original.source}</span>
      ),
    },
    { header: "Event", accessorKey: "event", cell: ({ row }) => <span className="text-xs">{row.original.event ?? "-"}</span> },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: ({ row }) => <span className="text-xs font-semibold">{money(row.original.amount, row.original.currency)}</span>,
    },
    {
      header: "Customer",
      accessorKey: "customerEmail",
      cell: ({ row }) => <span className="text-xs">{row.original.customerEmail ?? "-"}</span>,
    },
    {
      header: "Flutterwave ref",
      accessorKey: "flwRef",
      cell: ({ row }) => <span className="text-[11px] font-mono break-all">{row.original.flwRef ?? "-"}</span>,
    },
    {
      header: "Why",
      accessorKey: "reason",
      cell: ({ row }) => (
        <span className="block max-w-[320px] truncate text-xs text-gray-700" title={row.original.reason ?? ""}>
          {row.original.reason ?? "-"}
        </span>
      ),
    },
    {
      header: "",
      id: "view",
      cell: ({ row }) => (
        <button onClick={() => w.setSelectedId(row.original.id)} className="text-xs text-[#7C2EBF] font-semibold">
          View
        </button>
      ),
    },
  ];

  return (
    <Container>
      <article className="mt-6 min-h-screen">
        <div className="bg-white rounded-md pb-2">
          <div className="px-4 pt-4">
            <Tabs
              tabs={TABS.map((t) => ({
                value: t.value,
                label: t.label,
                count: w.list?.counts ? (w.list.counts[t.value] ?? 0) : undefined,
              }))}
              value={w.filter}
              onChange={w.changeFilter as never}
            />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-4 py-4 border-b">
            <input
              value={w.searchInput}
              onChange={(e) => w.setSearchInput(e.target.value)}
              placeholder="Search Flutterwave ref, tx ref, customer email or reason"
              className="border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
            />
            <select
              value={w.app}
              onChange={(e) => w.changeApp(e.target.value)}
              aria-label="App"
              className="border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
            >
              {APPS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                  {w.list?.appCounts ? ` (${w.list.appCounts[a.value] ?? 0})` : ""}
                </option>
              ))}
            </select>
            <Button name="Refresh" color="lightpurple" onClick={() => w.refetchList()} />
          </div>
          {w.app === "OTHER" && <p className="px-3 pt-3 text-xs text-gray-500">{APP_LONG.OTHER}</p>}
          {w.filter !== "ALL" && <p className="px-3 pt-3 text-xs text-gray-500">{MEANING[w.filter]}</p>}
          <DataTable
            data={w.list?.content ?? []}
            columns={columns}
            loading={w.listLoading}
            error={w.listError}
            useApiPagination={true}
            totalPages={w.list?.totalPages || 1}
            currentPage={w.currentPage}
            onPageChange={(p) => w.setCurrentPage(p)}
            setPageSize={w.setPageSize}
            pageSize={w.pageSize}
          />
        </div>

        <Dialog open={!!w.selectedId} onOpenChange={(open) => !open && w.setSelectedId(null)}>
          <DialogContent className="bg-white max-w-3xl max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Webhook call</DialogTitle>
            </DialogHeader>
            {w.detailLoading && <p className="text-sm text-gray-500">Loading...</p>}
            {detail && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <Chip outcome={detail.outcome} />
                  <p className="text-xs text-gray-600">{MEANING[detail.outcome]}</p>
                </div>
                <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-800">
                  <span className="text-[11px] uppercase tracking-wide text-gray-400 block mb-1">Why</span>
                  {detail.reason ?? "-"}
                </div>
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  <Row label="Received" value={when(detail.createdOn)} />
                  <Row label="Source" value={SOURCE_LONG[detail.source] ?? detail.source} />
                  <Row label="App" value={APP_LONG[detail.app] ?? detail.app} />
                  <Row label="Event" value={detail.event} />
                  <Row label="Amount" value={money(detail.amount, detail.currency)} />
                  <Row label="Flutterwave status" value={detail.providerStatus} />
                  <Row label="Payment type" value={detail.paymentType} />
                  <Row label="Customer email (masked)" value={detail.customerEmail} />
                  <Row label="Secret hash" value={HASH_TEXT[detail.hashResult] ?? detail.hashResult} />
                  <Row label="Flutterwave ref (flw_ref)" value={detail.flwRef} />
                  <Row label="Transaction ref (tx_ref)" value={detail.txRef} />
                  <Row label="Flutterwave transaction id" value={detail.providerTransactionId} />
                  <Row label="We answered" value={detail.httpStatus == null ? "-" : `HTTP ${detail.httpStatus}`} />
                </div>
                <section>
                  <h3 className="text-sm font-semibold mb-2">Raw body as received</h3>
                  {detail.rawBody ? (
                    <pre className="max-h-80 overflow-auto rounded-md bg-gray-900 p-3 text-[11px] leading-relaxed text-gray-100">
                      {pretty(detail.rawBody)}
                    </pre>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {detail.source === "CATCH_UP"
                        ? "None: this transfer was read from Flutterwave's list, not sent to us."
                        : "Not kept."}
                    </p>
                  )}
                  {detail.hashResult !== "OK" && detail.hashResult !== "NOT_APPLICABLE" && (
                    <p className="mt-1 text-[11px] text-gray-500">
                      The secret hash did not pass, so only the first 2,000 characters of the body are kept.
                    </p>
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

export default WebhookLogs;
