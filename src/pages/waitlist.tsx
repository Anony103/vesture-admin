import { ColumnDef } from "@tanstack/react-table";
import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import Button from "../components/shared/button";
import useWaitlist from "@/hooks/use-waitlist";
import { WaitlistEntry } from "@/types/waitlist-type";

const INTEREST_LABELS: Record<string, string> = {
  SMALLVEST: "SmallVest",
  TARGET_LOCK: "Target Lock",
  SMART_LOCK: "Smart Lock",
  BNPL: "Buy Now Pay Later",
  OTHER: "Something else",
};

const interestText = (codes: string[]) => codes.map((c) => INTEREST_LABELS[c] ?? c).join(", ");

const when = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "-";

/** A cell for a spreadsheet: quoted, and a leading = + - @ or control character defused so Excel cannot run it as a formula. */
const cell = (value: string | null | undefined) => {
  let text = (value ?? "").replace(/\r?\n/g, " ");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const toCsv = (rows: WaitlistEntry[]) =>
  [
    ["Joined", "Email", "Phone", "Wants to see", "Note"].join(","),
    ...rows.map((r) => [cell(r.createdOn), cell(r.email), cell(r.phone), cell(interestText(r.interests)), cell(r.note)].join(",")),
  ].join("\n");

const download = (rows: WaitlistEntry[]) => {
  // the BOM makes Excel read the file as UTF-8
  const url = URL.createObjectURL(new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `waitlist-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const Waitlist = () => {
  const w = useWaitlist();

  const columns: ColumnDef<WaitlistEntry>[] = [
    { header: "Joined", accessorKey: "createdOn", cell: ({ row }) => <span className="text-xs whitespace-nowrap">{when(row.original.createdOn)}</span> },
    { header: "Email", accessorKey: "email", cell: ({ row }) => <span className="text-xs">{row.original.email}</span> },
    { header: "Phone", accessorKey: "phone", cell: ({ row }) => <span className="text-xs whitespace-nowrap">{row.original.phone}</span> },
    {
      header: "Wants to see",
      id: "interests",
      cell: ({ row }) => (
        <span className="block max-w-[260px] text-xs text-gray-700">{row.original.interests.length ? interestText(row.original.interests) : "-"}</span>
      ),
    },
    {
      header: "Note",
      accessorKey: "note",
      cell: ({ row }) => (
        <span className="block max-w-[320px] truncate text-xs text-gray-700" title={row.original.note ?? ""}>
          {row.original.note ?? "-"}
        </span>
      ),
    },
  ];

  const downloadAll = async () => {
    const rows = await w.fetchAll();
    if (rows) download(rows);
  };

  return (
    <Container>
      <article className="mt-6 min-h-screen">
        <div className="bg-white rounded-md pb-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-4 py-4 border-b">
            <div className="md:mr-4">
              <p className="text-[11px] uppercase tracking-wide text-gray-400">On the waitlist</p>
              <p className="text-2xl font-semibold text-gray-900">{w.list ? w.list.total.toLocaleString("en-NG") : "-"}</p>
            </div>
            <input
              value={w.searchInput}
              onChange={(e) => w.setSearchInput(e.target.value)}
              placeholder="Search email, phone or note"
              className="border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
            />
            <Button name="Refresh" color="lightpurple" onClick={() => w.refetchList()} />
            <Button name={w.exporting ? "Preparing..." : "Download CSV"} color="purple" onClick={downloadAll} />
          </div>
          {w.exportError && <p className="px-4 pt-3 text-xs text-red-600">{w.exportError}</p>}
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
      </article>
    </Container>
  );
};

export default Waitlist;
