import { useState } from "react";
import { Badge, Card, Loading, Pager, PrimaryButton, Row, Table, Tile, inputClass, money, text, useAction, useAdminRoles, useLedgerService, useLoad, when } from "./common";

/** Is the money safe? One screen answering it: balances, tampering, drift, reconciliation, bank cover. */
export function Overview() {
  const ledger = useLedgerService();
  const { isAdmin } = useAdminRoles();
  const status = useLoad(() => ledger.status());
  const check = useLoad(() => ledger.check());
  const integrity = useLoad(() => ledger.verifyIntegrity());
  const safe = useLoad(() => ledger.safeguarding());
  const inFlight = useLoad(() => ledger.inFlight());
  const history = useLoad(() => ledger.historyCheck(7));
  const [vPage, setVPage] = useState(1);
  const violations = useLoad(() => ledger.violations("OPEN", vPage), [vPage]);
  const [note, setNote] = useState<Record<string, string>>({});
  const { busy, run } = useAction();

  const s = status.data as Row | null;
  const differences = check.data ?? [];
  const problems = ((integrity.data as Row | null)?.problems as Row[] | undefined) ?? [];
  const bank = safe.data as Row | null;
  const bankTone = bank?.status === "COVERED" ? "good" : bank?.status === "SHORTFALL" ? "bad" : "warn";
  const reloadAll = () => { status.reload(); check.reload(); integrity.reload(); safe.reload(); inFlight.reload(); history.reload(); violations.reload(); };

  return (
    <>
      <Card
        title="Ledger status"
        action={<PrimaryButton tone="light" onClick={reloadAll}>Refresh</PrimaryButton>}
      >
        <Loading loading={status.loading} error={status.error}>
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <Badge tone={s?.mode === "AUTHORITATIVE" ? "good" : "warn"}>
              {s?.mode === "AUTHORITATIVE" ? "Ledger is the source of truth" : "Shadow mode (the ledger records, balances still live on the accounts)"}
            </Badge>
            {s?.changedOn ? <span className="text-gray-500">switched {when(s.changedOn)} by {text(s.changedBy)}</span> : null}
          </div>
          {((s?.setupWarnings as string[] | undefined) ?? []).length > 0 && (
            <ul className="mt-3 space-y-1">
              {(s?.setupWarnings as string[]).map((w) => (
                <li key={w} className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded px-3 py-2">{w}</li>
              ))}
            </ul>
          )}
        </Loading>
      </Card>

      <div className="flex flex-wrap gap-3 mb-4">
        <Tile label="Balances off the ledger" value={check.loading ? "…" : differences.length} tone={differences.length ? "bad" : "good"} hint="Accounts whose stored balance differs from their ledger lines" />
        <Tile label="Tampering found" value={integrity.loading ? "…" : problems.length} tone={problems.length ? "bad" : "good"} hint="Edited, missing or removed ledger lines" />
        <Tile label="Open violations" value={text(s?.openViolations ?? "…")} tone={Number(s?.openViolations) ? "bad" : "good"} hint="Balances changed without the ledger" />
        <Tile label="Open reconciliation items" value={text(s?.openReconciliationItems ?? "…")} tone={Number(s?.openReconciliationItems) ? "warn" : "good"} hint="Bank differences nobody has resolved" />
        <Tile label="Payouts waiting for the bank" value={inFlight.loading ? "…" : (inFlight.data ?? []).length} tone={(inFlight.data ?? []).length ? "warn" : "good"} />
        <Tile label="Bank cover" value={text(bank?.status ?? "…")} tone={bankTone} hint={bank ? `${money(bank.heldInBank)} in bank vs ${money(bank.owedToCustomers)} owed` : undefined} />
      </div>

      {differences.length > 0 && (
        <Card title="Accounts that do not match their ledger lines">
          <Table
            headers={["Account type", "Account", "Stored balance", "Ledger says", "Difference"]}
            rows={differences.map((d) => [d.accountType as string, <code key="i">{text(d.accountId)}</code>, money(d.actualBalance), money(d.ledgerTotal), <span key="d" className="text-red-600">{money(d.difference)}</span>])}
          />
        </Card>
      )}

      {problems.length > 0 && (
        <Card title="Ledger integrity problems">
          <Table headers={["Kind", "Where", "Detail"]} rows={problems.map((p) => [text(p.kind), text(p.where), text(p.detail)])} />
        </Card>
      )}

      <Card title="Open violations">
        <Loading loading={violations.loading} error={violations.error}>
          <Table
            empty="No open violations"
            headers={["When", "Account", "Kind", "Stored", "Ledger", "Outcome", "Resolve"]}
            rows={(violations.data as unknown as { content: Row[] } | null)?.content?.map((v) => [
              when(v.createdOn),
              <span key="a">{text(v.accountType)}<br /><code>{text(v.accountId)}</code></span>,
              text(v.kind), money(v.storedBalance), money(v.ledgerBalance), text(v.action),
              isAdmin ? (
                <div key="r" className="flex gap-2">
                  <input className={inputClass} placeholder="What you did about it" value={note[String(v.id)] ?? ""} onChange={(e) => setNote({ ...note, [String(v.id)]: e.target.value })} />
                  <PrimaryButton disabled={busy || (note[String(v.id)] ?? "").trim().length < 10} onClick={() => run(() => ledger.resolveViolation(String(v.id), note[String(v.id)]), violations.reload)}>Resolve</PrimaryButton>
                </div>
              ) : "-",
            ]) ?? []}
          />
          <Pager page={vPage} totalPages={((violations.data as unknown as { totalPages: number } | null)?.totalPages) ?? 1} onPage={setVPage} />
        </Loading>
      </Card>

      <Card title="Payouts waiting for the bank">
        <Loading loading={inFlight.loading} error={inFlight.error}>
          <Table
            empty="Every payout has been confirmed"
            headers={["Reference", "Amount held", "Since", "Customer"]}
            rows={(inFlight.data ?? []).map((p) => [text(p.reference), money(p.amountHeld), when(p.since), <code key="u">{text(p.userId)}</code>])}
          />
        </Loading>
      </Card>

      <Card title="Ledger against customer history (last 7 days)">
        <Loading loading={history.loading} error={history.error}>
          <Table
            empty="The ledger and the transaction history agree"
            headers={["Difference", "Reference", "What"]}
            rows={(history.data ?? []).map((h) => [text(h.kind), text(h.reference), text(h.what)])}
          />
        </Loading>
      </Card>
    </>
  );
}
