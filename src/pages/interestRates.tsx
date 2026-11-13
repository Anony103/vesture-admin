import { Tabs } from "@/components/shared/tabs";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { AlertTriangle, BellRing, Plus } from "lucide-react";
import { Container } from "../components/shared/container";
// import { useState } from "react";
import { DataTable } from "../components/shared/data-table";
// import { AssetDataTable } from "../components/shared/data-table-assets";
import { ColumnDef } from "@tanstack/react-table";
// import { AssetType } from "../types/table-type";
// import { ActionIcon } from "../components/svg-icons/action-icon";
// import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
// import { DataTable } from "@/components/shared/data-table";
// import { formatWithCommas } from "@/utils/formatNumbers";
import { RateHistoryType, RateRequestType, RateType } from "@/types/table-type";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_ALL_RATES, GET_RATE_HISTORY, GET_RATE_REQUESTS } from "@/constants/query-keys";
import { ManageRatesService } from "@/services/manage-rates-service";
import useMangeInterestRates from "@/hooks/use-manage-interest-rates";

const PRODUCT_NAMES: Record<string, string> = {
  SmartLock: "Smart Lock",
  SSS: "SmallVest",
  BNPL: "Buy Now Pay Later",
  TargetSavings: "Target Lock",
};

// An active rate is the one new plans are given; an inactive one is kept on record but not used. The two must not look alike.
const StatusPill = ({ active }: { active: boolean }) =>
  active ? (
    <span className="v-chip v-chip-ok">
      <span className="size-1.5 rounded-full bg-current" />
      Active
    </span>
  ) : (
    <span className="v-chip">
      <span className="size-1.5 rounded-full border border-current" />
      Inactive
    </span>
  );

// Everything else in an inactive rate's row is dimmed.
const Dim = ({ active, children }: { active: boolean; children: React.ReactNode }) => (
  <span className={`inline-block w-full ${active ? "" : "text-fg3"}`}>{children}</span>
);

const rate = (v: number | null | undefined) => (v === null || v === undefined ? "-" : `${Number(v).toFixed(2)}%`);

const when = (v: string) => (v ? new Date(v).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "-");

const describeChange = (h: RateHistoryType): string => {
  switch (h.action) {
    case "CREATED":
      return `Created at ${rate(h.newRate)}${h.newActive ? "" : " (inactive)"}`;
    case "RATE_CHANGED":
      return `Rate ${rate(h.oldRate)} → ${rate(h.newRate)}`;
    case "ACTIVATED":
      return `Switched on (rate ${rate(h.newRate)})`;
    case "DEACTIVATED":
      return `Switched off (rate ${rate(h.newRate)})`;
    default: {
      const parts: string[] = [];
      if (h.oldRate !== h.newRate) parts.push(`Rate ${rate(h.oldRate)} → ${rate(h.newRate)}`);
      if (h.oldActive !== h.newActive) parts.push(h.newActive ? "switched on" : "switched off");
      if (h.previousTenorLabel) parts.push(`range ${h.previousTenorLabel} → ${h.tenorLabel}`);
      return parts.join(", ") || "Updated";
    }
  }
};

const REQUEST_TONE: Record<string, string> = {
  PENDING: "v-chip-warn",
  APPROVED: "v-chip-ok",
  REJECTED: "v-chip-bad",
  CANCELLED: "",
};

/** One rate in a request, shown as a figure the reviewer can scan: the percentage, then the tenor it applies to. */
const tenorText = (i: RateRequestType["items"][number]) =>
  i.minTenorDays != null && i.maxTenorDays != null ? `${i.minTenorDays}-${i.maxTenorDays} days` : "any tenor";

/** A banner that something needs attention. */
const Notice = ({ tone, children }: { tone: "warn" | "bad"; children: React.ReactNode }) => (
  <div
    role="status"
    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
      tone === "warn" ? "border-gold/30 bg-gold/10" : "border-danger/30 bg-danger/10"
    }`}
  >
    {tone === "warn" ? <BellRing size={17} className="mt-0.5 shrink-0 text-gold" /> : <AlertTriangle size={17} className="mt-0.5 shrink-0 text-danger" />}
    <p className="text-fg">{children}</p>
  </div>
);

// The signed-in admin's email (the login's username), only used to tell them "you asked for this" before the server has to say so.
const myEmail = (token: string): string => {
  try {
    return String(JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).sub ?? "").toLowerCase();
  } catch {
    return "";
  }
};

type Acting = { kind: "approve" | "reject" | "cancel" | "switchoff"; id: string; label: string } | null;

const InterestRates = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"rates" | "requests" | "history">(
    (location.state as { tab?: "rates" | "requests" | "history" } | null)?.tab ?? "rates"
  );
  const [requestFilter, setRequestFilter] = useState<"PENDING" | "">("PENDING");
  const [acting, setActing] = useState<Acting>(null);
  const [reason, setReason] = useState("");
  const [working, setWorking] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(10);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const {
    data: history,
    isLoading: historyLoading,
    error: historyError,
  } = useQuery({
    queryKey: [GET_RATE_HISTORY, historyPage, historyPageSize],
    enabled: tab === "history",
    queryFn: async () => {
      const response = await new ManageRatesService(token).getRateHistory(historyPageSize, historyPage);
      setHistoryTotalPages(response?.data?.totalPages || 1);
      return (response?.data?.content ?? []) as RateHistoryType[];
    },
  });

  const manage = useMemo(() => new ManageRatesService(token), [token]);
  const me = myEmail(token);
  const { data: requestData, refetch: refetchRequests, isLoading: requestsLoading } = useQuery({
    queryKey: [GET_RATE_REQUESTS, requestFilter],
    queryFn: async () => (await manage.getRequests(requestFilter, 1, 50))?.data as {
      content: RateRequestType[];
      pendingCount: number;
      allowSelfApproval: boolean;
    },
  });
  const pendingCount = requestData?.pendingCount ?? 0;
  const allowSelfApproval = requestData?.allowSelfApproval ?? false;

  // A product with both an any-tenor rate and ranges active is a leftover from before the one-set rule; a newly approved set replaces both.
  const [liveAll, setLiveAll] = useState<RateType[]>([]);
  useEffect(() => {
    manage
      .getAllRatesList()
      .then((r) => setLiveAll((r?.data ?? []) as RateType[]))
      .catch(() => setLiveAll([]));
  }, [manage, requestData]);
  const mixed = useMemo(() => {
    const names: string[] = [];
    for (const type of Array.from(new Set(liveAll.map((r) => r.savingsType)))) {
      const active = liveAll.filter((r) => r.savingsType === type && r.active);
      const bands = active.some((r) => r.minTenorDays != null && r.maxTenorDays != null);
      const any = active.some((r) => (r.minTenorDays == null || r.maxTenorDays == null) && !r.durationDays);
      if (bands && any) names.push(PRODUCT_NAMES[type] ?? type);
    }
    return names;
  }, [liveAll]);

  const activeRates = liveAll.filter((r) => r.active);
  const topRate = activeRates.reduce((best, r) => Math.max(best, Number(r.annualRate) || 0), 0);
  const productsCovered = new Set(activeRates.map((r) => r.savingsType)).size;

  const runDecision = async () => {
    if (!acting) return;
    setWorking(true);
    try {
      if (acting.kind === "switchoff") {
        await manage.switchOffRate(acting.id, reason.trim());
      } else {
        await manage.decideRequest(acting.id, acting.kind, reason.trim() || undefined);
      }
      toast.success(
        acting.kind === "approve" ? "Approved. The new rates are active."
          : acting.kind === "reject" ? "Rejected. Nothing changed."
          : acting.kind === "cancel" ? "Cancelled. Nothing changed."
          : "Rate switched off"
      );
      setActing(null);
      setReason("");
      void refetchRequests();
      queryClient.invalidateQueries({ queryKey: [GET_ALL_RATES] });
      queryClient.invalidateQueries({ queryKey: [GET_RATE_HISTORY] });
    } catch (error) {
      toast.error(error instanceof AxiosError ? error.response?.data?.message || "That did not work" : "That did not work");
    } finally {
      setWorking(false);
    }
  };
  const needsReason = acting?.kind === "reject" || acting?.kind === "switchoff";

  const historyColumns: ColumnDef<RateHistoryType>[] = [
    { accessorKey: "changedOn", header: "When", cell: ({ row }) => <span className="inline-block w-full text-xs">{when(row.original.changedOn)}</span> },
    {
      accessorKey: "savingsType",
      header: "Product",
      cell: ({ row }) => <span className="inline-block w-full">{PRODUCT_NAMES[row.original.savingsType] ?? row.original.savingsType}</span>,
    },
    {
      id: "tenor",
      header: "Tenor",
      cell: ({ row }) => <span className="inline-block w-full">{row.original.tenorLabel}</span>,
    },
    {
      id: "change",
      header: "Change",
      cell: ({ row }) => <span className="inline-block w-full">{describeChange(row.original)}</span>,
    },
    {
      id: "after",
      header: "Status after",
      cell: ({ row }) => <StatusPill active={!!row.original.newActive} />,
    },
    {
      id: "by",
      header: "Changed by",
      cell: ({ row }) => (
        <span className="inline-block w-full">
          {row.original.changedByName || row.original.changedByEmail || "-"}
          {row.original.requestedByName && (
            <span className="block text-[11px] text-fg3">approved · asked for by {row.original.requestedByName}</span>
          )}
          <span className="block text-[11px] text-fg3">
            {row.original.changedByRole?.replace("ROLE_", "").replace("_", " ").toLowerCase() ?? ""}
          </span>
        </span>
      ),
    },
  ];

  // useRoleAccess("manager");
  // const [customerType, setCustomerType] = useState("allcustomers");
  const {
    allRatesError,
    allRatesLoading,
    allRates,
    currentPage,
    setCurrentPage,
    totalPages,
    setPageSize,
    pageSize
  } = useMangeInterestRates();
  const navigate = useNavigate();

  // Utility function to format numbers with commas (if not already defined)
  // const formatWithCommas = (value: number) =>
  //   value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const columns: ColumnDef<RateType>[] = [
    {
      id: "number",
      header: "#",
      cell: ({ row }) => <Dim active={row.original.active}>{row.index + 1}</Dim>,
    },
    {
      accessorKey: "savingsType",
      header: "Name",
      cell: ({ row }) => <Dim active={row.original.active}>{PRODUCT_NAMES[row.original.savingsType] ?? row.original.savingsType ?? "N/A"}</Dim>,
    },
    {
      id: "tenor",
      header: () => <span>Tenor</span>,
      cell: ({ row }) => {
        const r = row.original;
        const text =
          r.minTenorDays != null && r.maxTenorDays != null
            ? `${r.minTenorDays} to ${r.maxTenorDays} days`
            : r.durationDays
              ? `Exactly ${r.durationDays} days`
              : "Any tenor";
        return <Dim active={r.active}>{text}</Dim>;
      },
    },
    {
      accessorKey: "annualRate",
      header: () => <span>Annual Rate</span>,
      cell: ({ row }) => <Dim active={row.original.active}><span className="v-mono font-semibold">{((row.original.annualRate as number) ?? 0).toFixed(2)}%</span></Dim>,
    },
    {
      accessorKey: "active",
      header: () => <span>Status</span>,
      cell: ({ row }) => <StatusPill active={!!row.original.active} />,
    },
   
    {
      id: "actions",
      header: () => <span></span>,
      cell: ({ row }) =>
        row.original.active ? (
          <button
            onClick={() => { setActing({ kind: "switchoff", id: row.original.id, label: `Switch off the ${PRODUCT_NAMES[row.original.savingsType] ?? row.original.savingsType} rate` }); setReason(""); }}
            className="text-xs font-semibold text-danger hover:underline"
          >
            Switch off
          </button>
        ) : null,
    },
    // {
    //   accessorKey: "createdBy",
    //   header: () => <span>Created By</span>,
    //   cell: ({ getValue }) => {
    //     const value = (getValue() as string) ?? "N/A";
    //     return <span className="inline-block w-full">{value}</span>;
    //   },
    // },
    {
      accessorKey: "createdOn",
      header: () => <span>Created On</span>,
      cell: ({ row, getValue }) => {
        const value = (getValue() as string) ?? "";
        return <Dim active={row.original.active}>{value ? new Date(value).toLocaleDateString() : "N/A"}</Dim>;
      },
    },
    {
      accessorKey: "updatedOn",
      header: () => <span>Updated On</span>,
      cell: ({ row, getValue }) => {
        const value = (getValue() as string) ?? "";
        return <Dim active={row.original.active}>{value ? new Date(value).toLocaleDateString() : "N/A"}</Dim>;
      },
    },
    // {
    //   accessorKey: "id",
    //   header: () => <span></span>,
    //   cell: () => {
    //     // const id = (getValue() as string) ?? "";
    //     return (
    //       <div className="dropdown dropdown-end">
    //         <div tabIndex={0} className="p-0 cursor-pointer">
    //           <ActionIcon />
    //         </div>
    //         <ul
    //           tabIndex={0}
    //           className="dropdown-content text-left bg-[#4F4F4F] rounded-md text-sm text-white z-[1] w-52 shadow"
    //         >
    //           {/* <li className="py-2 pl-3 cursor-pointer">
    //             <Link to={`details/${id}`}>View Details</Link>
    //           </li> */}
    //           <li className="border-t-[1px] cursor-pointer border-t-white py-2 pl-3">
    //             <a>Deactivate</a>
    //           </li>
    //         </ul>
    //       </div>
    //     );
    //   },
    // },
  ];

  return (
    <Container>
      <article className=" mt-6 min-h-screen">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            tabs={[
              { value: "rates", label: "Rates" },
              { value: "requests", label: "Requests", count: pendingCount > 0 ? pendingCount : undefined, attention: true },
              { value: "history", label: "History" },
            ]}
            value={tab}
            onChange={(value) => setTab(value as typeof tab)}
          />
          <button
            onClick={() => {
              navigate("createRates");
            }}
            className="v-btn v-btn-primary v-sheen"
          >
            <Plus size={15} /> Create Interest Rates
          </button>
        </div>
        {tab === "rates" && liveAll.length > 0 && (
          <StatGrid className="mt-4">
            <StatCard label="Active rates" tone="mint" value={activeRates.length} hint="Given to new plans" />
            <StatCard label="Inactive rates" tone="neutral" value={liveAll.length - activeRates.length} hint="Kept on record" />
            <StatCard label="Products covered" tone="sky" value={productsCovered} hint="With an active rate" />
            <StatCard label="Highest rate" tone="brand" value={`${topRate.toFixed(2)}%`} hint="Per year, among active" />
          </StatGrid>
        )}
        {tab === "rates" && pendingCount > 0 && (
          <div className="mt-4">
            <Notice tone="warn">
              {pendingCount} new rate set{pendingCount === 1 ? " is" : "s are"} waiting for approval.{" "}
              <button onClick={() => setTab("requests")} className="font-semibold text-brand underline">See requests</button>
            </Notice>
          </div>
        )}
        {tab === "rates" && mixed.length > 0 && (
          <div className="mt-4">
            <Notice tone="bad">
              {mixed.join(" and ")} {mixed.length === 1 ? "has" : "have"} both an any-tenor rate and ranges active. Only one kind should be active: when a new rate set is approved for
              {mixed.length === 1 ? " it" : " them"}, it replaces both.
            </Notice>
          </div>
        )}
        {tab === "requests" && (
          <div className="mt-3 space-y-3">
            <div className="v-seg" role="group" aria-label="Request filter">
              {([["PENDING", "Waiting for approval"], ["", "All requests"]] as const).map(([value, label]) => (
                <button key={label} type="button" aria-pressed={requestFilter === value} onClick={() => setRequestFilter(value)}>
                  {label}
                </button>
              ))}
            </div>
            {requestsLoading && <p className="text-xs text-fg3">Loading...</p>}
            {!requestsLoading && (requestData?.content ?? []).length === 0 && (
              <p className="glass p-5 text-sm text-fg2">{requestFilter === "PENDING" ? "Nothing is waiting for approval." : "No requests yet."}</p>
            )}
            {(requestData?.content ?? []).map((r) => {
              const mine = !!me && !!r.requestedByEmail && r.requestedByEmail.toLowerCase() === me;
              return (
                <div key={r.id} className="glass v-rise space-y-3 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-base font-semibold">{PRODUCT_NAMES[r.savingsType] ?? r.savingsType}</span>
                    <span className={`v-chip ${REQUEST_TONE[r.status] ?? ""}`}>{r.status === "PENDING" ? "Pending" : r.status.charAt(0) + r.status.slice(1).toLowerCase()}</span>
                    <span className="text-xs text-fg3">{r.mode === "ANY" ? "Any tenor" : `${r.items.length} range${r.items.length === 1 ? "" : "s"}`}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.items.map((i, index) => (
                      <span key={index} className="rounded-xl border border-brand/25 bg-brand/10 px-3 py-1.5">
                        <span className="v-mono font-semibold">{Number(i.annualRate).toFixed(2)}%</span>
                        <span className="ml-2 text-xs text-fg2">{tenorText(i)}</span>
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-fg3">
                    Asked for by {r.requestedByName || r.requestedByEmail} ({r.requestedByRole?.replace("ROLE_", "").replace("_", " ").toLowerCase()}) · {when(r.requestedOn)}
                  </p>
                  {r.status !== "PENDING" && (
                    <p className="text-[11px] text-fg2">
                      {r.status.charAt(0) + r.status.slice(1).toLowerCase()} by {r.decidedByName || r.decidedByEmail} · {when(r.decidedOn ?? "")}
                      {r.decisionReason ? ` - ${r.decisionReason}` : ""}
                    </p>
                  )}
                  {r.status === "PENDING" && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => { setActing({ kind: "approve", id: r.id, label: `Approve the new ${PRODUCT_NAMES[r.savingsType] ?? r.savingsType} rates` }); setReason(""); }}
                        disabled={mine && !allowSelfApproval}
                        className="v-btn v-btn-ok v-btn-sm"
                        title={mine && !allowSelfApproval ? "You asked for this, so someone else has to approve it" : ""}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => { setActing({ kind: "reject", id: r.id, label: `Reject the new ${PRODUCT_NAMES[r.savingsType] ?? r.savingsType} rates` }); setReason(""); }}
                        className="v-btn v-btn-danger v-btn-sm"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => { setActing({ kind: "cancel", id: r.id, label: "Cancel this request" }); setReason(""); }}
                        className="px-2 py-1.5 text-xs text-fg3 hover:text-fg"
                      >
                        Cancel request
                      </button>
                      {mine && !allowSelfApproval && <span className="text-[11px] text-gold">You asked for this, so someone else has to approve it.</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {acting && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(6,3,14,0.72)] px-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="v-rise w-full max-w-md space-y-4 rounded-2xl border border-line-hi bg-card p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
              <h2 className="font-display text-lg font-semibold">{acting.label}</h2>
              {acting.kind === "approve" && <p className="text-sm text-fg2">The rates that are active for this product now will be switched off, and this set becomes the active one.</p>}
              {acting.kind === "switchoff" && <p className="text-sm text-fg2">New plans will no longer be given this rate. Plans already created keep theirs. Only a Super Admin can do this.</p>}
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={needsReason ? "Reason (required, at least 10 characters)" : "A note (optional)"}
                className="v-field"
              />
              <div className="flex gap-2">
                <button
                  onClick={runDecision}
                  disabled={working || (needsReason && reason.trim().length < 10)}
                  className={`v-btn ${acting.kind === "approve" ? "v-btn-ok" : "v-btn-danger"}`}
                >
                  {working ? "Saving..." : acting.kind === "approve" ? "Approve" : acting.kind === "reject" ? "Reject" : acting.kind === "cancel" ? "Cancel the request" : "Switch off"}
                </button>
                <button onClick={() => setActing(null)} disabled={working} className="v-btn v-btn-ghost">Back</button>
              </div>
            </div>
          </div>
        )}
        {tab === "rates" && (
          <p className="mt-4 text-xs text-fg3">
            <span className="font-semibold text-mint">Active</span> rates are the ones new plans are given.{" "}
            <span className="font-semibold text-fg2">Inactive</span> rates (dimmed) are kept on record but are not used.
          </p>
        )}
        {tab === "history" && (
          <div className="bg-white rounded-lg mt-2 pb-2">
            <p className="px-4 pt-4 pb-3 text-xs text-fg3">Every change to a rate: who made it, when, and what it was before and after. History starts from when this was switched on.</p>
            <DataTable
              data={history ?? []}
              columns={historyColumns}
              loading={historyLoading}
              error={historyError as Error | null}
              useApiPagination={true}
              totalPages={historyTotalPages}
              currentPage={historyPage}
              onPageChange={(p) => setHistoryPage(p)}
              pageSize={historyPageSize}
              setPageSize={setHistoryPageSize}
            />
          </div>
        )}
        <div className={`bg-white rounded-lg mt-2 pb-2 ${tab === "rates" ? "" : "hidden"}`}>
          <div>
            <DataTable
              data={allRates}
              columns={columns}
              loading={allRatesLoading}
              error={allRatesError}
              useApiPagination={true}
              totalPages={totalPages || 1}
              currentPage={currentPage}
              onPageChange={(newPage) => setCurrentPage(newPage)}
              pageSize={pageSize}
              setPageSize = {setPageSize}
            />
          </div>
        </div>
        <div></div>
      </article>
    </Container>
  );
};

export default InterestRates;
