import { useState } from "react";
import { Badge, Card, Field, Loading, Pager, PrimaryButton, Row, Table, Tile, inputClass, money, text, useAction, useAdminRoles, useLedgerService, useLoad, when } from "./common";
import { errorText } from "@/services/ledger-service";
import { toast } from "react-toastify";

export function Reconciliation() {
  const ledger = useLedgerService();
  const { isAdmin } = useAdminRoles();
  const [file, setFile] = useState<File | null>(null);
  const [provider, setProvider] = useState("generic");
  const [refCol, setRefCol] = useState("");
  const [amtCol, setAmtCol] = useState("");
  const [result, setResult] = useState<Row | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("OPEN");
  const [iPage, setIPage] = useState(1);
  const [rPage, setRPage] = useState(1);
  const runs = useLoad(() => ledger.reconRuns(rPage), [rPage]);
  const items = useLoad(() => ledger.reconItems(status, iPage), [status, iPage]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { busy, run } = useAction();

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const r = await ledger.reconcile(file, provider, refCol, amtCol);
      setResult(r.data);
      toast.success(r.message);
      runs.reload();
      items.reload();
    } catch (e) {
      setResult(null);
      toast.error(errorText(e));
    } finally {
      setUploading(false);
    }
  };

  const list = (key: string) => ((result?.[key] as Row[] | undefined) ?? []);
  return (
    <>
      <Card title="Check a bank or provider statement">
        <p className="text-xs text-gray-600 mb-3">
          Upload the CSV statement from Flutterwave, Providus or the bank. Every row is matched to the ledger by reference and amount;
          anything that does not match is kept as an item below until someone resolves it.
        </p>
        <div className="grid md:grid-cols-4 gap-3 items-end">
          <Field label="Statement file (.csv)">
            <input type="file" accept=".csv,text/csv" className={inputClass} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </Field>
          <Field label="Whose statement">
            <select className={inputClass} value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="generic">Generic / other bank</option>
              <option value="flutterwave">Flutterwave</option>
              <option value="providus">Providus</option>
            </select>
          </Field>
          <Field label="Reference column (only if not detected)">
            <input className={inputClass} value={refCol} onChange={(e) => setRefCol(e.target.value)} placeholder="e.g. Txn Ref No" />
          </Field>
          <Field label="Amount column (only if not detected)">
            <input className={inputClass} value={amtCol} onChange={(e) => setAmtCol(e.target.value)} placeholder="e.g. Net Value" />
          </Field>
        </div>
        <div className="mt-3"><PrimaryButton disabled={!file || uploading} onClick={upload}>{uploading ? "Checking…" : "Check statement"}</PrimaryButton></div>

        {result && (
          <div className="mt-5">
            <div className="flex flex-wrap gap-3 mb-3">
              <Tile label="Statement rows" value={text(result.bankRows)} />
              <Tile label="Matched" value={text(result.matched)} tone="good" />
              <Tile label="Amount differs" value={list("amountMismatches").length} tone={list("amountMismatches").length ? "bad" : "good"} />
              <Tile label="In bank, not in ledger" value={list("inBankNotInLedger").length} tone={list("inBankNotInLedger").length ? "bad" : "good"} />
              <Tile label="In ledger, not in bank" value={list("inLedgerNotInBank").length} tone={list("inLedgerNotInBank").length ? "warn" : "good"} />
            </div>
            <p className="mb-3">{result.clean ? <Badge tone="good">The statement matches the ledger</Badge> : <Badge tone="bad">The statement has differences — they are listed below and saved as items</Badge>}</p>
            {list("amountMismatches").length > 0 && <Table headers={["Reference", "Bank", "Ledger", "Difference"]} rows={list("amountMismatches").map((m) => [text(m.reference), money(m.amount), money(m.ledgerAmount), <span key="d" className="text-red-600">{money(m.difference)}</span>])} />}
            {list("inBankNotInLedger").length > 0 && <div className="mt-3"><p className="text-xs font-medium mb-1">In the bank statement, missing from the ledger</p><Table headers={["Reference", "Amount", "Type"]} rows={list("inBankNotInLedger").map((m) => [text(m.reference), money(m.amount), text(m.type)])} /></div>}
            {list("inLedgerNotInBank").length > 0 && <div className="mt-3"><p className="text-xs font-medium mb-1">In the ledger, missing from the bank statement</p><Table headers={["Reference", "Amount", "Type", "Ledger date"]} rows={list("inLedgerNotInBank").map((m) => [text(m.reference), money(m.amount), text(m.type), when(m.ledgerDate)])} /></div>}
          </div>
        )}
      </Card>

      <Card
        title="Unresolved differences"
        action={
          <select className="bg-white text-gray-900 border rounded text-xs px-2 py-1" value={status} onChange={(e) => { setStatus(e.target.value); setIPage(1); }}>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
            <option value="WRITTEN_OFF">Written off</option>
          </select>
        }
      >
        <Loading loading={items.loading} error={items.error}>
          <Table
            empty="No items"
            headers={["Seen", "Kind", "Direction", "Reference", "Bank", "Ledger", "Times seen", status === "OPEN" ? "Resolve" : "Resolution"]}
            rows={(items.data as unknown as { content: Row[] } | null)?.content?.map((i) => [
              when(i.createdOn), text(i.kind), text(i.direction), text(i.reference), money(i.bankAmount), money(i.ledgerAmount), text(i.timesSeen),
              status === "OPEN" ? (
                isAdmin ? (
                  <div key="r" className="flex flex-col gap-2 min-w-[240px]">
                    <input className={inputClass} placeholder="What you found (at least 10 characters)" value={notes[String(i.id)] ?? ""} onChange={(e) => setNotes({ ...notes, [String(i.id)]: e.target.value })} />
                    <div className="flex gap-2">
                      <PrimaryButton disabled={busy || (notes[String(i.id)] ?? "").trim().length < 10} onClick={() => run(() => ledger.resolveReconItem(String(i.id), "RESOLVED", notes[String(i.id)]), () => { items.reload(); })}>Resolved</PrimaryButton>
                      <PrimaryButton tone="danger" disabled={busy || (notes[String(i.id)] ?? "").trim().length < 10} onClick={() => run(() => ledger.resolveReconItem(String(i.id), "WRITTEN_OFF", notes[String(i.id)]), () => { items.reload(); })}>Write off</PrimaryButton>
                    </div>
                  </div>
                ) : "-"
              ) : <span key="n">{text(i.resolvedBy)} · {when(i.resolvedOn)}<br />{text(i.resolutionNote)}</span>,
            ]) ?? []}
          />
          <Pager page={iPage} totalPages={((items.data as unknown as { totalPages: number } | null)?.totalPages) ?? 1} onPage={setIPage} />
        </Loading>
      </Card>

      <Card title="Past statement checks">
        <Loading loading={runs.loading} error={runs.error}>
          <Table
            empty="No statements checked yet"
            headers={["When", "File", "Whose", "By", "Rows", "Matched", "Differences", "Bank received", "Bank paid out"]}
            rows={(runs.data as unknown as { content: Row[] } | null)?.content?.map((r) => [
              when(r.createdOn), text(r.fileName), text(r.provider), text(r.runBy), text(r.bankRows), text(r.matched),
              Number(r.mismatches) + Number(r.bankOnly) + Number(r.ledgerOnly), money(r.bankReceived), money(r.bankPaidOut),
            ]) ?? []}
          />
          <Pager page={rPage} totalPages={((runs.data as unknown as { totalPages: number } | null)?.totalPages) ?? 1} onPage={setRPage} />
        </Loading>
      </Card>
    </>
  );
}
