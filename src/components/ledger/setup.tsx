import { useState } from "react";
import { Badge, Card, Field, Loading, PrimaryButton, Row, Table, Tile, inputClass, money, text, useAction, useAdminRoles, useLedgerService, useLoad, when } from "./common";

/** One-off and month-end jobs: opening balances, switching the ledger on, bank balances, closing a month. */
export function Setup() {
  const ledger = useLedgerService();
  const { isSuperAdmin, isAdmin } = useAdminRoles();
  const status = useLoad(() => ledger.status());
  const audit = useLoad(() => ledger.openingAudit());
  const safe = useLoad(() => ledger.safeguarding());
  const periods = useLoad(() => ledger.periods());
  const [ack, setAck] = useState(false);
  const [auditNote, setAuditNote] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBalance, setBankBalance] = useState("");
  const [bankNote, setBankNote] = useState("");
  const [period, setPeriod] = useState("");
  const { busy, run } = useAction();

  const s = status.data as Row | null;
  const findings = audit.data ?? [];
  const authoritative = s?.mode === "AUTHORITATIVE";
  const bank = safe.data as Row | null;
  const reloadAll = () => { status.reload(); audit.reload(); safe.reload(); periods.reload(); };

  return (
    <>
      <Card title="Step 1 — Check balances before the ledger starts">
        <p className="text-xs text-gray-600 mb-3">
          Opening balances records every balance as it is today as the starting truth. A balance that does not match that customer&apos;s own history
          (an edited balance, an old account, money from before history was kept) would become official, so look at this list first.
        </p>
        <Loading loading={audit.loading} error={audit.error}>
          <Table
            empty="Every wallet balance is explained by its transaction history"
            headers={["Customer", "Stored balance", "History explains", "Unexplained"]}
            rows={findings.map((f) => [<span key="c">{text(f.email)}<br /><code>{text(f.userId)}</code></span>, money(f.storedBalance), money(f.explainedByHistory), <span key="u" className="text-red-600">{money(f.unexplained)}</span>])}
          />
        </Loading>
      </Card>

      {isSuperAdmin && (
        <Card title="Step 2 — Record opening balances">
          {findings.length > 0 && (
            <div className="mb-3 space-y-2">
              <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /><span>I have looked at the {findings.length} balance(s) above and accept them as the starting point.</span></label>
              <Field label="What you checked, and why they are accepted (at least 10 characters — saved in the audit log)"><textarea className={inputClass} rows={2} value={auditNote} onChange={(e) => setAuditNote(e.target.value)} /></Field>
            </div>
          )}
          <PrimaryButton disabled={busy || (findings.length > 0 && (!ack || auditNote.trim().length < 10))} onClick={() => run(() => ledger.openBalances(ack, auditNote), reloadAll)}>Record opening balances</PrimaryButton>
          <p className="text-[11px] text-gray-500 mt-2">Safe to repeat: an account that already has an opening line is left alone.</p>
        </Card>
      )}

      {isSuperAdmin && (
        <Card title="Step 3 — Make the ledger the source of truth">
          <p className="text-xs mb-3">Now: <Badge tone={authoritative ? "good" : "warn"}>{authoritative ? "The ledger is the source of truth" : "Shadow mode"}</Badge></p>
          <p className="text-xs text-gray-600 mb-3">
            After switching, every balance is read from the ledger before money moves, the ledger refuses overdrafts, and changes that do not match it are refused.
            It is refused unless every balance already matches its ledger lines. You can switch back.
          </p>
          <div className="flex gap-3">
            {!authoritative ? (
              <PrimaryButton disabled={busy} onClick={() => { if (window.confirm("Make the ledger the source of truth?")) run(() => ledger.cutover(), reloadAll); }}>Switch to the ledger</PrimaryButton>
            ) : (
              <PrimaryButton tone="danger" disabled={busy} onClick={() => { if (window.confirm("Go back to shadow mode?")) run(() => ledger.rollback(), reloadAll); }}>Go back to shadow mode</PrimaryButton>
            )}
          </div>
        </Card>
      )}

      <Card title="Is there enough in the bank?">
        <Loading loading={safe.loading} error={safe.error}>
          <div className="flex flex-wrap gap-3 mb-3">
            <Tile label="Owed to customers" value={money(bank?.owedToCustomers)} hint="Wallets, plans, interest, payouts waiting, tax not yet handed over" />
            <Tile label="Recorded in bank" value={money(bank?.heldInBank)} />
            <Tile label="Surplus / shortfall" value={money(bank?.surplusOrShortfall)} tone={Number(bank?.surplusOrShortfall) >= 0 ? "good" : "bad"} hint={text(bank?.status)} />
          </div>
          <Table
            empty="No bank balance has been recorded yet"
            headers={["Bank account", "Balance", "As of", "Recorded by"]}
            rows={((bank?.bankAccounts as Row[] | undefined) ?? []).map((a) => [text(a.accountName), money(a.balance), when(a.asOf), text(a.recordedBy)])}
          />
          {isAdmin && (
            <div className="grid md:grid-cols-4 gap-3 items-end mt-4">
              <Field label="Bank / settlement account"><input className={inputClass} value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Providus settlement" /></Field>
              <Field label="Balance on the bank's own statement (₦)"><input className={inputClass} inputMode="decimal" value={bankBalance} onChange={(e) => setBankBalance(e.target.value)} /></Field>
              <Field label="Note"><input className={inputClass} value={bankNote} onChange={(e) => setBankNote(e.target.value)} /></Field>
              <PrimaryButton disabled={busy || !bankName.trim() || !(Number(bankBalance) >= 0) || bankBalance === ""} onClick={() => run(() => ledger.recordBankBalance(bankName.trim(), Number(bankBalance), bankNote), () => { setBankBalance(""); safe.reload(); })}>Record balance</PrimaryButton>
            </div>
          )}
          <p className="text-[11px] text-gray-500 mt-2">Bank figures are typed in from the bank&apos;s own statement. A figure older than 36 hours is reported as out of date.</p>
        </Loading>
      </Card>

      <Card title="Month-end close">
        <Loading loading={periods.loading} error={periods.error}>
          <Table
            empty="No month has been closed yet"
            headers={["Month", "Closed by", "Closed on", "Owed to customers", "Tax outstanding", "Ledger lines"]}
            rows={(periods.data ?? []).map((p) => [text(p.period), text(p.closedBy), when(p.closedOn), money(p.customerLiabilities), money(p.taxOutstanding), text(p.lineCount)])}
          />
          {isSuperAdmin && (
            <div className="flex gap-3 items-end mt-4">
              <Field label="Month to close (YYYY-MM)"><input className={inputClass} value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="2026-09" /></Field>
              <PrimaryButton disabled={busy || !/^\d{4}-\d{2}$/.test(period)} onClick={() => run(() => ledger.closePeriod(period), () => { setPeriod(""); periods.reload(); })}>Close month</PrimaryButton>
            </div>
          )}
          <p className="text-[11px] text-gray-500 mt-2">Closing seals the month. It is refused if a balance is off, the trial balance is not zero, or a violation is open.</p>
        </Loading>
      </Card>
    </>
  );
}
