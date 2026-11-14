import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "react-toastify";
import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import { Tabs } from "@/components/shared/tabs";
import Button from "../components/shared/button";
import { StatCard, StatGrid } from "@/components/shared/stat-card";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_PAYROLL_PLANS } from "@/constants/query-keys";
import { PayrollPlansService } from "@/services/payroll-plans-service";
import { PayrollPlanRow, PayrollView } from "@/types/payroll-plan-type";
import { exportToExcel } from "@/utils/exportAsExcel";

const TABS: { label: string; value: PayrollView }[] = [
  { label: "Waiting for ₦50,000", value: "PENDING" },
  { label: "All plans needing money", value: "ALL" },
];

const MEANING: Record<PayrollView, string> = {
  PENDING:
    "Requests that have not yet received the activation amount (₦50,000; for a purchase, its initial payment). The BankOne account is opened and the plan booked when a plan gets there.",
  ALL: "Every public-sector plan that still needs money: pending requests, and active plans that are still being paid in.",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING_FUNDING: "Pending",
  PENDING: "Pending",
  FUNDING_GL: "Activating",
  GL_CREDITED: "Activating",
  ACTIVE: "Active",
};

const naira = (n: number | null | undefined) => (n == null ? "-" : `₦${Number(n).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`);

/** The names the credit-entry upload is filled in with (it also accepts the stored codes). */
const INVESTMENT_TYPE_NAME: Record<string, string> = { SAVE_SMALL_SMALL: "SMALLVEST", TARGET_SAVINGS: "TARGET_LOCK" };

const PayrollPlans = () => {
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new PayrollPlansService(token), [token]);
  const [view, setView] = useState<PayrollView>("PENDING");
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const list = useQuery({
    queryKey: [GET_PAYROLL_PLANS, view],
    queryFn: async () => (await service.list(view))?.data ?? [],
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const all = list.data ?? [];
    if (!term) return all;
    return all.filter((r) =>
      [r.customerName, r.bvn, r.staffId, r.planName, r.product].some((v) => (v ?? "").toLowerCase().includes(term)),
    );
  }, [list.data, search]);

  const toDeduct = rows.reduce((sum, r) => sum + (r.expected ?? 0), 0);
  const customers = new Set(rows.map((r) => r.bvn ?? r.planId)).size;

  /** The credit-entry upload's own layout, so the finance team can fill in what was actually deducted and upload it after payroll. */
  const download = () => {
    if (!rows.length) {
      toast.error("There is nothing to download");
      return;
    }
    exportToExcel<PayrollPlanRow>({
      data: rows,
      fileName: `expected-contributions-${new Date().toISOString().slice(0, 10)}.xlsx`,
      sheetName: "Credit entries",
      columns: [
        { header: "Name", key: "customerName" },
        { header: "Unique Id", key: (r) => r.bvn ?? "" },
        { header: "Amount", key: "expected" },
        { header: "Investment Type", key: (r) => INVESTMENT_TYPE_NAME[r.savingsType] ?? r.savingsType },
        { header: "Period", key: "period" },
      ],
    });
  };

  const columns: ColumnDef<PayrollPlanRow>[] = [
    {
      header: "Customer",
      accessorKey: "customerName",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-semibold">{row.original.customerName || "-"}</div>
          <div className="text-gray-500">{row.original.staffId ?? row.original.phoneNumber ?? ""}</div>
        </div>
      ),
    },
    { header: "BVN", accessorKey: "bvn", cell: ({ row }) => <span className="text-xs font-mono">{row.original.bvn ?? "-"}</span> },
    {
      header: "Plan",
      accessorKey: "planName",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-semibold">{row.original.planName ?? "-"}</div>
          <div className="text-gray-500">{row.original.product}</div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => <span className="text-xs">{STATUS_LABEL[row.original.status] ?? row.original.status}</span>,
    },
    {
      header: "Received",
      accessorKey: "received",
      cell: ({ row }) => (
        <div className="text-xs">
          <div className="font-semibold">{naira(row.original.received)}</div>
          {row.original.target != null && <div className="text-gray-500">of {naira(row.original.target)}</div>}
        </div>
      ),
    },
    {
      header: "To activate",
      accessorKey: "neededToActivate",
      cell: ({ row }) => (
        <span className="text-xs whitespace-nowrap">
          {row.original.neededToActivate == null ? "-" : `${naira(row.original.neededToActivate)} to go`}
        </span>
      ),
    },
    {
      header: "Deduct next",
      accessorKey: "expected",
      cell: ({ row }) => <span className="text-xs font-semibold whitespace-nowrap">{naira(row.original.expected)}</span>,
    },
  ];

  return (
    <Container>
      <article className="mt-6 min-h-screen space-y-4">
        <StatGrid>
          <StatCard label="Plans" value={rows.length} tone="brand" />
          <StatCard label="Customers" value={customers} tone="neutral" />
          <StatCard label="To deduct next" value={naira(toDeduct)} tone="mint" hint="the total of the Deduct next column" />
        </StatGrid>
        <div className="bg-white rounded-md pb-2">
          <div className="px-4 pt-4">
            <Tabs tabs={TABS} value={view} onChange={setView as never} />
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-4 py-4 border-b">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, BVN, staff ID or plan"
              className="border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
            />
            <Button name="Refresh" color="lightpurple" onClick={() => list.refetch()} />
            <Button name="Download expected contributions" color="purple" onClick={download} />
          </div>
          <p className="px-4 pt-3 text-xs text-gray-500">
            {MEANING[view]} The download uses the credit-entry upload's columns: fill in what was actually deducted and upload it after payroll runs.
          </p>
          <DataTable data={rows} columns={columns} loading={list.isLoading} error={list.error as Error | null} pageSize={pageSize} setPageSize={setPageSize} />
        </div>
      </article>
    </Container>
  );
};

export default PayrollPlans;
