import { useState } from "react";
import { Badge, Card, Field, Loading, Pager, PrimaryButton, Row, Table, inputClass, money, text, useAction, useAdminRoles, useLedgerService, useLoad, when } from "./common";

const ACCOUNT_TYPES = ["WALLET", "PLAN_SSS", "PLAN_TARGET", "PLAN_SMART_LOCK", "PLAN_INTEREST", "BNPL_PAID"];
const tone = (s: string) => (s === "APPROVED" ? "good" : s === "REJECTED" ? "bad" : "warn");

/** Corrections to a balance or an undone event. Nothing moves until a different super admin approves. */
export function Adjustments() {
  const ledger = useLedgerService();
  const { isSuperAdmin, isAdmin, username } = useAdminRoles();
  const [kind, setKind] = useState<"adjust" | "reverse">("adjust");
  const [accountType, setAccountType] = useState("WALLET");
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("BOTH");
  const [journalKey, setJournalKey] = useState("");
  const [reason, setReason] = useState("");
  const [filter, setFilter] = useState("PENDING");
  const [page, setPage] = useState(1);
  const list = useLoad(() => ledger.adjustments(filter, page), [filter, page]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { busy, run } = useAction();

  const submit = () => {
    const body: Record<string, unknown> = { reason };
    if (kind === "reverse") body.journalKey = journalKey.trim();
    else Object.assign(body, { accountType, accountId: accountId.trim(), amount: Number(amount), mode });
    run(() => ledger.requestAdjustment(body), () => { setReason(""); setAmount(""); setJournalKey(""); setAccountId(""); setFilter("PENDING"); list.reload(); });
  };
  const valid = reason.trim().length >= 10 && (kind === "reverse" ? journalKey.trim().length > 3 : accountId.trim().length > 3 && Number(amount) !== 0 && !Number.isNaN(Number(amount)));

  return (
    <>
      {isAdmin && (
        <Card title="Request a correction">
          <p className="text-xs text-gray-600 mb-3">
            A correction never takes effect on its own. A <b>super admin other than the person who asked</b> has to approve it,
            and above ₦100,000 two different super admins do. Use a plus amount to add money to the account and a minus amount to take it away.
          </p>
          <div className="flex gap-4 mb-3 text-xs">
            <label className="flex items-center gap-1"><input type="radio" checked={kind === "adjust"} onChange={() => setKind("adjust")} /> Change a balance</label>
            <label className="flex items-center gap-1"><input type="radio" checked={kind === "reverse"} onChange={() => setKind("reverse")} /> Undo a past event</label>
          </div>
          {kind === "adjust" ? (
            <div className="grid md:grid-cols-4 gap-3">
              <Field label="Account type"><select className={inputClass} value={accountType} onChange={(e) => setAccountType(e.target.value)}>{ACCOUNT_TYPES.map((a) => <option key={a}>{a}</option>)}</select></Field>
              <Field label="Account id"><input className={inputClass} value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="customer id or plan id" /></Field>
              <Field label="Amount (₦, minus to remove)"><input className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" /></Field>
              <Field label="What to change"><select className={inputClass} value={mode} onChange={(e) => setMode(e.target.value)}><option value="BOTH">Ledger and the stored balance</option><option value="LEDGER_ONLY">Ledger only</option></select></Field>
            </div>
          ) : (
            <Field label="Ledger event to undo (the journal key, e.g. WH:12345 or PWD:2026…)"><input className={inputClass} value={journalKey} onChange={(e) => setJournalKey(e.target.value)} /></Field>
          )}
          <div className="mt-3"><Field label="Why (at least 10 characters — include the support ticket or evidence)"><textarea className={inputClass} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} /></Field></div>
          <div className="mt-3"><PrimaryButton disabled={busy || !valid} onClick={submit}>Submit for approval</PrimaryButton></div>
        </Card>
      )}

      <Card
        title="Corrections"
        action={
          <select className="bg-white text-gray-900 border rounded text-xs px-2 py-1" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
            <option value="PENDING">Waiting for approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="">All</option>
          </select>
        }
      >
        <Loading loading={list.loading} error={list.error}>
          <Table
            empty="Nothing here"
            headers={["Requested", "What", "Amount", "Why", "Asked by", "Approvals", "Status", ""]}
            rows={(list.data as unknown as { content: Row[] } | null)?.content?.map((a) => {
              const mine = a.requestedBy === username || a.firstApprover === username;
              return [
                when(a.requestedAt),
                a.kind === "REVERSE_JOURNAL" ? <span key="w">Undo <code>{text(a.journalKey)}</code></span> : <span key="w">{text(a.accountType)}<br /><code>{text(a.accountId)}</code><br /><span className="text-gray-500">{text(a.mode)}</span></span>,
                money(a.amount),
                text(a.reason),
                text(a.requestedBy),
                `${a.firstApprover ? 1 : 0} of ${text(a.approvalsNeeded)}`,
                <Badge key="s" tone={tone(String(a.status))}>{text(a.status)}</Badge>,
                a.status === "PENDING" && isSuperAdmin ? (
                  <div key="x" className="flex flex-col gap-2 min-w-[200px]">
                    <input className={inputClass} placeholder="Note (optional)" value={notes[String(a.id)] ?? ""} onChange={(e) => setNotes({ ...notes, [String(a.id)]: e.target.value })} />
                    <div className="flex gap-2">
                      <PrimaryButton disabled={busy || mine} onClick={() => run(() => ledger.approveAdjustment(String(a.id), notes[String(a.id)] ?? ""), list.reload)}>Approve</PrimaryButton>
                      <PrimaryButton tone="danger" disabled={busy} onClick={() => run(() => ledger.rejectAdjustment(String(a.id), notes[String(a.id)] ?? ""), list.reload)}>Reject</PrimaryButton>
                    </div>
                    {mine && <span className="text-[11px] text-gray-500">You asked for or already approved this, so someone else has to.</span>}
                  </div>
                ) : a.decisionNote ? <span key="x" className="text-gray-500">{text(a.decidedBy)}: {text(a.decisionNote)}</span> : "",
              ];
            }) ?? []}
          />
          <Pager page={page} totalPages={((list.data as unknown as { totalPages: number } | null)?.totalPages) ?? 1} onPage={setPage} />
        </Loading>
      </Card>
    </>
  );
}
