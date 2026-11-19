import { ColumnDef } from "@tanstack/react-table";
import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import Button from "../components/shared/button";
import useWaitlist from "@/hooks/use-waitlist";
import useAppAccess from "@/hooks/use-app-access";
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
    ["Joined", "Name", "Email", "Phone", "Wants to see", "Note", "Agreed to updates", "Invited"].join(","),
    ...rows.map((r) =>
      [cell(r.createdOn), cell(r.fullName), cell(r.email), cell(r.phone), cell(interestText(r.interests)), cell(r.note), cell(r.consentAt ? when(r.consentAt) : ""), cell(r.invited ? "Yes" : "")].join(","),
    ),
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
  // only a super admin may decide who is let in (the server enforces it too)
  const { allowed: canInvite } = useAppAccess();

  const columns: ColumnDef<WaitlistEntry>[] = [
    { header: "Joined", accessorKey: "createdOn", cell: ({ row }) => <span className="text-xs whitespace-nowrap">{when(row.original.createdOn)}</span> },
    { header: "Name", accessorKey: "fullName", cell: ({ row }) => <span className="text-xs">{row.original.fullName ?? "-"}</span> },
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
      header: "Agreed to updates",
      accessorKey: "consentAt",
      cell: ({ row }) => <span className="text-xs whitespace-nowrap">{row.original.consentAt ? when(row.original.consentAt) : "-"}</span>,
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

  if (canInvite) {
    columns.push({
      header: "Invite",
      id: "invite",
      cell: ({ row }) => {
        const entry = row.original;
        const busy = w.busyId === entry.id;
        return (
          <span className="flex items-center gap-2 whitespace-nowrap text-xs">
            {entry.invited && <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700">Invited</span>}
            <button
              type="button"
              disabled={busy}
              className="font-medium text-[#7C2EBF] hover:underline disabled:opacity-50"
              onClick={() => w.invite(entry.id)}
            >
              {busy ? "Working..." : entry.invited ? "Send again" : "Invite"}
            </button>
            {entry.invited && (
              <button
                type="button"
                disabled={busy}
                className="text-gray-500 hover:text-red-600 hover:underline disabled:opacity-50"
                onClick={() => {
                  if (window.confirm(`Withdraw the invite for ${entry.fullName ?? entry.email}? They will lose web access and their link will stop working.`)) {
                    w.withdrawInvite(entry.id);
                  }
                }}
              >
                Withdraw
              </button>
            )}
          </span>
        );
      },
    });
  }

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
              placeholder="Search name, email, phone or note"
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
