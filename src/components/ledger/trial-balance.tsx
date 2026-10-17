import { useState } from "react";
import { Badge, Card, Loading, Pager, PrimaryButton, Row, Table, Tile, Field, inputClass, money, text, useLedgerService, useLoad, when } from "./common";

const ACCOUNT_TYPES = ["WALLET", "PLAN_SSS", "PLAN_TARGET", "PLAN_SMART_LOCK", "PLAN_INTEREST", "BNPL_PAID"];

const EXPLAIN: Record<string, string> = {
  WALLET: "Customer wallets",
  PLAN_SSS: "SmallVest principal",
  PLAN_TARGET: "Target Lock principal",
  PLAN_SMART_LOCK: "Smart Lock principal",
  PLAN_INTEREST: "Interest held in plans",
  BNPL_PAID: "Paid toward BNPL purchases",
  BANK_SETTLEMENT: "Money received from banks (house)",
  BANK_PAYOUT: "Payouts confirmed by the bank (house)",
  PAYOUT_IN_FLIGHT: "Payouts waiting for the bank (house)",
  TAX_PAYABLE: "Tax withheld, not yet remitted (house)",
  TAX_REMITTED: "Tax handed over (house)",
  PENALTY_INCOME: "Early-withdrawal penalties (house)",
  INTEREST_EXPENSE: "Interest credited to customers (house)",
  ADMIN_CREDIT: "Admin credit entries (house)",
  ADMIN_ADJUSTMENT: "Approved corrections (house)",
  OPENING_BALANCE: "Balances brought in when the ledger started (house)",
};

export function TrialBalance() {
  const ledger = useLedgerService();
  const trial = useLoad(() => ledger.trialBalance());
  const [type, setType] = useState("WALLET");
  const [id, setId] = useState("");
  const [lookup, setLookup] = useState<{ type: string; id: string } | null>(null);
  const [page, setPage] = useState(1);
  const statement = useLoad(
    () => (lookup ? ledger.statement(lookup.type, lookup.id, page) : Promise.resolve({ data: null as unknown as Row })),
    [lookup, page],
  );

  const t = trial.data as Row | null;
  const accounts = (t?.accounts as Record<string, Row> | undefined) ?? {};
  const s = statement.data as Row | null;
  return (
    <>
      <Card title="Trial balance" action={<PrimaryButton tone="light" onClick={trial.reload}>Refresh</PrimaryButton>}>
        <Loading loading={trial.loading} error={trial.error}>
          <div className="flex flex-wrap gap-3 mb-4">
            <Tile label="Grand total" value={money(t?.total)} tone={t?.balanced ? "good" : "bad"} hint={t?.balanced ? "Balanced: every credit has a matching debit" : "NOT balanced — investigate now"} />
            <Tile label="Ledger lines" value={Number(t?.lines ?? 0).toLocaleString()} />
          </div>
          <Table
            headers={["Account", "What it is", "Balance", "Lines"]}
            rows={Object.entries(accounts).map(([name, row]) => [
              <code key="n">{name}</code>,
              EXPLAIN[name] ?? "",
              money(row.balance),
              Number(row.lines).toLocaleString(),
            ])}
          />
          <p className="text-[11px] text-gray-500 mt-3">{text(t?.note)}</p>
        </Loading>
      </Card>

      <Card title="Look up one account">
        <div className="grid md:grid-cols-4 gap-3 items-end">
          <Field label="Account type">
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
              {ACCOUNT_TYPES.map((a) => <option key={a} value={a}>{a} — {EXPLAIN[a]}</option>)}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Account id (customer id for a wallet, plan id otherwise)">
              <input className={inputClass} value={id} onChange={(e) => setId(e.target.value.trim())} placeholder="e.g. 7b29c1e5-…" />
            </Field>
          </div>
          <PrimaryButton disabled={!id} onClick={() => { setPage(1); setLookup({ type, id }); }}>Show statement</PrimaryButton>
        </div>
        {lookup && (
          <div className="mt-4">
            <Loading loading={statement.loading} error={statement.error}>
              {s && (
                <>
                  <p className="text-xs mb-2">Ledger balance <Badge tone="good">{money(s.ledgerBalance)}</Badge></p>
                  <Table
                    empty="No ledger lines for this account"
                    headers={["Date", "Event", "Description", "Reference", "Amount", "Balance after"]}
                    rows={((s.items as Row[]) ?? []).map((i) => [
                      when(i.date), text(i.type), text(i.description), text(i.reference),
                      <span key="a" className={Number(i.amount) < 0 ? "text-red-600" : "text-green-700"}>{money(i.amount)}</span>,
                      money(i.balanceAfter),
                    ])}
                  />
                  <Pager page={page} totalPages={Math.max(1, Math.ceil(Number(s.total ?? 0) / Number(s.size ?? 25)))} onPage={setPage} />
                </>
              )}
            </Loading>
          </div>
        )}
      </Card>
    </>
  );
}
