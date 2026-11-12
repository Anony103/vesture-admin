import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import Button from "../components/shared/button";
import useDepositFees from "@/hooks/use-deposit-fees";
import { DepositFeeDay, DepositFeeReport } from "@/types/deposit-fee-type";

const naira = (n: number | null | undefined) => `₦${Number(n ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const day = (v: string) => new Date(`${v}T00:00:00`).toLocaleDateString("en-NG", { dateStyle: "medium" });

const Tile = ({ label, value, note, strong }: { label: string; value: string; note: string; strong?: boolean }) => (
  <div className={`rounded-md border p-4 ${strong ? "border-[#7C2EBF] bg-[#F6EBFE]" : "border-gray-200"}`}>
    <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    <p className="mt-1 text-[11px] leading-4 text-gray-500">{note}</p>
  </div>
);

/** The report as a CSV the finance team can open in a spreadsheet: one row a day, then the total. */
const toCsv = (report: DepositFeeReport) => {
  const head = ["Date", "Deposits", "Credited", "Flutterwave fee", "Paid by customer on top", "Taken from customer credit", "Borne by Vesture"];
  const line = (label: string, r: DepositFeeDay | DepositFeeReport["total"]) =>
    [label, r.deposits, r.credited, r.flutterwaveFee, r.paidByCustomerOnTop, r.chargedToCustomer, r.borneByVesture].join(",");
  return [head.join(","), ...report.days.map((d) => line(d.date, d)), line("Total", report.total)].join("\n");
};

const download = (report: DepositFeeReport) => {
  const url = URL.createObjectURL(new Blob([toCsv(report)], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `deposit-fees-${report.from}-to-${report.to}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const DepositFees = () => {
  const f = useDepositFees();
  const [pageSize, setPageSize] = useState(31);
  const total = f.report?.total;

  const columns: ColumnDef<DepositFeeDay>[] = [
    { header: "Date", accessorKey: "date", cell: ({ row }) => <span className="text-xs whitespace-nowrap">{day(row.original.date)}</span> },
    { header: "Deposits", accessorKey: "deposits", cell: ({ row }) => <span className="text-xs">{row.original.deposits}</span> },
    { header: "Credited", accessorKey: "credited", cell: ({ row }) => <span className="text-xs">{naira(row.original.credited)}</span> },
    { header: "Flutterwave fee", accessorKey: "flutterwaveFee", cell: ({ row }) => <span className="text-xs">{naira(row.original.flutterwaveFee)}</span> },
    {
      header: "Paid by customer on top",
      accessorKey: "paidByCustomerOnTop",
      cell: ({ row }) => <span className="text-xs">{naira(row.original.paidByCustomerOnTop)}</span>,
    },
    {
      header: "Taken from credit",
      accessorKey: "chargedToCustomer",
      cell: ({ row }) => <span className="text-xs">{naira(row.original.chargedToCustomer)}</span>,
    },
    {
      header: "Borne by Vesture",
      accessorKey: "borneByVesture",
      cell: ({ row }) => (
        <span className={`text-xs ${row.original.borneByVesture > 0 ? "font-semibold text-red-600" : ""}`}>{naira(row.original.borneByVesture)}</span>
      ),
    },
  ];

  return (
    <Container>
      <article className="mt-6 min-h-screen">
        <div className="bg-white rounded-md pb-4">
          <div className="px-4 pt-6">
            <h1 className="text-lg font-bold">Deposit fees</h1>
            <p className="mt-1 text-xs text-gray-600">
              What Flutterwave charged on deposits that came through it, and how much of that Vesture paid. Deposits received before fees were recorded are not
              counted. The settlement Flutterwave pays Vesture for a period is the credited amount less what Vesture bore and less what was taken from customers.
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-end gap-3 px-4 py-4 border-b">
            <label className="text-xs text-gray-600">
              From
              <input
                type="date"
                value={f.from}
                max={f.to}
                onChange={(e) => f.setFrom(e.target.value)}
                className="mt-1 block border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
              />
            </label>
            <label className="text-xs text-gray-600">
              To
              <input
                type="date"
                value={f.to}
                min={f.from}
                onChange={(e) => f.setTo(e.target.value)}
                className="mt-1 block border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
              />
            </label>
            <Button name="Refresh" color="lightpurple" onClick={() => f.refetch()} />
            {f.report && <Button name="Download CSV" color="purple" onClick={() => download(f.report as DepositFeeReport)} />}
          </div>
          {(f.problem || f.serverMessage) && <p className="px-4 pt-3 text-xs text-red-600">{f.problem ?? f.serverMessage}</p>}

          {total && (
            <div className="grid gap-3 px-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
              <Tile label="Deposits" value={String(total.deposits)} note="Flutterwave deposits credited in this period." />
              <Tile label="Credited" value={naira(total.credited)} note="What customers' wallets and plans were credited." />
              <Tile label="Flutterwave fees" value={naira(total.flutterwaveFee)} note="Flutterwave's whole fee on those deposits." />
              <Tile
                label="Paid by customers on top"
                value={naira(total.paidByCustomerOnTop)}
                note="Customers who paid the fee on top of what was credited (Flutterwave's payment page). Costs Vesture nothing."
              />
              <Tile
                label="Taken from customers' credit"
                value={naira(total.chargedToCustomer)}
                note="Taken out of the credit for transfers to a customer's account number, when customers cover the fee."
              />
              <Tile
                strong
                label="Borne by Vesture"
                value={naira(total.borneByVesture)}
                note="Came out of Vesture's settlement: this is how much the GL needs topping up by for the period."
              />
            </div>
          )}

          <div className="pt-4">
            <DataTable
              data={f.report?.days ?? []}
              columns={columns}
              loading={f.loading}
              error={f.problem ? null : f.error}
              setPageSize={setPageSize}
              pageSize={pageSize}
            />
          </div>
        </div>
      </article>
    </Container>
  );
};

export default DepositFees;
