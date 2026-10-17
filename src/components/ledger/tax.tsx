import { useState } from "react";
import { Badge, Card, Field, Loading, PrimaryButton, Row, Table, Tile, inputClass, money, text, useAction, useAdminRoles, useLedgerService, useLoad } from "./common";
import { errorText } from "@/services/ledger-service";
import { toast } from "react-toastify";

export function Tax() {
  const ledger = useLedgerService();
  const { isSuperAdmin } = useAdminRoles();
  const summary = useLoad(() => ledger.taxSummary());
  const months = useLoad(() => ledger.taxMonths());
  const [month, setMonth] = useState<string | null>(null);
  const schedule = useLoad(() => (month ? ledger.taxSchedule(month) : Promise.resolve({ data: null as unknown as Row })), [month]);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const { busy, run } = useAction();

  const s = summary.data as Row | null;
  const sched = schedule.data as Row | null;
  const download = async (m: string) => {
    try {
      const blob = await ledger.taxScheduleCsv(m);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tax-schedule-${m}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(errorText(e));
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-4">
        <Tile label="Withheld from customers" value={money(s?.collected)} />
        <Tile label="Handed over" value={money(s?.remitted)} tone="good" />
        <Tile label="Still to hand over" value={money(s?.outstanding)} tone={Number(s?.outstanding) > 0 ? "warn" : "good"} />
      </div>

      <Card title="Tax by month">
        <Loading loading={months.loading} error={months.error}>
          <Table
            empty="No tax has been withheld yet"
            headers={["Month", "Withheld", "Handed over", "Unpaid", "Due on", "", ""]}
            rows={(months.data ?? []).map((m) => [
              text(m.month), money(m.withheld), money(m.remitted), money(m.unpaid), text(m.dueOn),
              m.overdue ? <Badge key="o" tone="bad">Overdue</Badge> : Number(m.unpaid) > 0 ? <Badge key="o" tone="warn">Due</Badge> : <Badge key="o" tone="good">Paid</Badge>,
              <div key="a" className="flex gap-2">
                <PrimaryButton tone="light" onClick={() => setMonth(String(m.month))}>See customers</PrimaryButton>
                <PrimaryButton tone="light" onClick={() => download(String(m.month))}>Download CSV</PrimaryButton>
              </div>,
            ])}
          />
          <p className="text-[11px] text-gray-500 mt-2">Payments are applied to the oldest month first.</p>
        </Loading>
      </Card>

      {month && (
        <Card title={`Tax withheld in ${month}, by customer`} action={<PrimaryButton tone="light" onClick={() => setMonth(null)}>Close</PrimaryButton>}>
          <Loading loading={schedule.loading} error={schedule.error}>
            {sched && (
              <>
                <p className="text-xs mb-2">Total <b>{money(sched.total)}</b> · due on {text(sched.dueOn)}</p>
                <Table
                  empty="No tax was withheld that month"
                  headers={["Customer", "Email", "Tax withheld", "Withdrawals"]}
                  rows={((sched.customers as Row[]) ?? []).map((c) => [text(c.name), text(c.email), money(c.taxWithheld), text(c.withdrawals)])}
                />
              </>
            )}
          </Loading>
        </Card>
      )}

      {isSuperAdmin && (
        <Card title="Record tax handed over">
          <div className="grid md:grid-cols-4 gap-3 items-end">
            <Field label="Amount (₦)"><input className={inputClass} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
            <Field label="Payment reference (receipt or transfer no.)"><input className={inputClass} value={reference} onChange={(e) => setReference(e.target.value)} /></Field>
            <Field label="Note"><input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
            <PrimaryButton disabled={busy || !(Number(amount) > 0) || reference.trim().length < 3} onClick={() => run(() => ledger.remitTax(Number(amount), reference.trim(), note), () => { setAmount(""); setReference(""); setNote(""); summary.reload(); months.reload(); })}>Record</PrimaryButton>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">This only records a payment you have already made to the tax authority. It does not send money.</p>
        </Card>
      )}

      <Card title="Remittances recorded">
        <Table
          empty="Nothing has been handed over yet"
          headers={["Date", "Reference", "Amount", "Note"]}
          rows={((s?.remittances as Row[] | undefined) ?? []).map((r) => [text(r.date), text(r.reference), money(r.amount), text(r.description)])}
        />
      </Card>
    </>
  );
}
