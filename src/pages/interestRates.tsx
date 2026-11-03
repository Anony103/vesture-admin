import { Container } from "../components/shared/container";
// import { useState } from "react";
import { DataTable } from "../components/shared/data-table";
// import { AssetDataTable } from "../components/shared/data-table-assets";
import { ColumnDef } from "@tanstack/react-table";
// import { AssetType } from "../types/table-type";
// import { ActionIcon } from "../components/svg-icons/action-icon";
// import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
// import { DataTable } from "@/components/shared/data-table";
// import { formatWithCommas } from "@/utils/formatNumbers";
import { RateHistoryType, RateType } from "@/types/table-type";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SESSION_STORAGE_KEY } from "@/constants";
import { GET_RATE_HISTORY } from "@/constants/query-keys";
import { ManageRatesService } from "@/services/manage-rates-service";
import useMangeInterestRates from "@/hooks/use-manage-interest-rates";

const PRODUCT_NAMES: Record<string, string> = {
  SmartLock: "Smart Lock",
  SSS: "Save Small Small",
  BNPL: "Buy Now Pay Later",
  TargetSavings: "Target Savings",
};

// An active rate is the one new plans are given; an inactive one is kept on record but not used. The two must not look alike.
const StatusPill = ({ active }: { active: boolean }) =>
  active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
      <span className="size-1.5 rounded-full bg-green-600" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
      <span className="size-1.5 rounded-full border border-gray-400" />
      Inactive
    </span>
  );

// Everything else in an inactive rate's row is dimmed.
const Dim = ({ active, children }: { active: boolean; children: React.ReactNode }) => (
  <span className={`inline-block w-full ${active ? "" : "text-gray-400"}`}>{children}</span>
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

const InterestRates = () => {
  const [tab, setTab] = useState<"rates" | "history">("rates");
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
          <span className="block text-[11px] text-gray-400">
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
      cell: ({ row }) => <Dim active={row.original.active}>{((row.original.annualRate as number) ?? 0).toFixed(2)}%</Dim>,
    },
    {
      accessorKey: "active",
      header: () => <span>Status</span>,
      cell: ({ row }) => <StatusPill active={!!row.original.active} />,
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
        <div className="flex justify-between">
          <div className="flex gap-2 text-sm">
            {(["rates", "history"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-md px-4 py-2 ${tab === t ? "bg-[#7C2EBF] text-white" : "bg-white text-gray-600"}`}
              >
                {t === "rates" ? "Rates" : "History"}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              navigate("createRates");
            }}
            className=" text-xs flex bg-[#7C2EBF] py-3 px-4 text-white rounded-md"
          >
            Create Interest Rates
          </button>
        </div>
        {tab === "rates" && (
          <p className="mt-3 text-xs text-gray-500">
            <span className="font-semibold text-green-700">Active</span> rates are the ones new plans are given.{" "}
            <span className="font-semibold text-gray-500">Inactive</span> rates (dimmed) are kept on record but are not used.
          </p>
        )}
        {tab === "history" && (
          <div className="bg-white rounded-lg mt-2 pb-2">
            <p className="px-4 pt-4 text-xs text-gray-500">Every change to a rate: who made it, when, and what it was before and after. History starts from when this was switched on.</p>
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
