import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Container } from "../components/shared/container";
import { DataTable } from "../components/shared/data-table";
import TabItem from "@/components/tabItem";
import Button from "../components/shared/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useKyc from "@/hooks/use-kyc";
import { KycService } from "@/services/kyc-service";
import {
  KycAttempt,
  KycDocumentMeta,
  KycFilter,
  KycListItem,
  KycStepName,
  KycStepStatus,
} from "@/types/kyc-type";

const TABS: { label: string; value: KycFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Needs attention", value: "NEEDS_ATTENTION" },
  { label: "Address pending", value: "ADDRESS_PENDING" },
  { label: "BankOne pending", value: "BANKONE_PENDING" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Complete", value: "COMPLETE" },
];

const STEPS: { step: KycStepName; short: string; label: string }[] = [
  { step: "LIVENESS", short: "L", label: "Liveness selfie" },
  { step: "NIN", short: "N", label: "NIN" },
  { step: "DOCUMENT", short: "D", label: "ID document" },
  { step: "ADDRESS", short: "A", label: "Address" },
];

const TONE: Record<string, string> = {
  VERIFIED: "bg-green-100 text-green-700",
  PENDING: "bg-[#F6EBFE] text-[#7C2EBF]",
  SUBMITTED: "bg-[#F6EBFE] text-[#7C2EBF]",
  FAILED: "bg-red-100 text-red-700",
  ERROR: "bg-red-100 text-red-700",
  RESET: "bg-amber-100 text-amber-700",
  NOT_STARTED: "bg-gray-100 text-gray-500",
};

const Chip = ({ status, text, title }: { status: string; text?: string; title?: string }) => (
  <span
    title={title ?? status}
    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE[status] ?? TONE.NOT_STARTED}`}
  >
    {text ?? status.replace("_", " ")}
  </span>
);

const when = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "-";

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1 border-b pb-2">
    <span className="text-[11px] uppercase tracking-wide text-gray-400">{label}</span>
    <span className="text-sm text-gray-800 break-words">{value ?? "-"}</span>
  </div>
);

const parseSummary = (text: string | null): Record<string, unknown> => {
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

// An ID photo is personal data and every view is put on record by the server, so it is only fetched on a click.
const KycImage = ({ service, doc }: { service: KycService; doc: KycDocumentMeta }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const show = async () => {
    setLoading(true);
    setFailed(false);
    try {
      setUrl(URL.createObjectURL(await service.getDocumentImage(doc.id)));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-md p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">
          {doc.type === "LIVENESS_SELFIE" ? "Live selfie" : "ID document"}
        </span>
        <span className="text-[11px] text-gray-400">{when(doc.createdOn)}</span>
      </div>
      {url ? (
        <img src={url} alt={doc.type} className="max-h-64 w-full object-contain rounded bg-gray-50" />
      ) : (
        <button
          onClick={show}
          disabled={loading}
          className="text-xs bg-[#E2CEF3] text-[#7C2EBF] rounded-md py-2 disabled:opacity-50"
        >
          {loading ? "Loading..." : "View image"}
        </button>
      )}
      {failed && <p className="text-[11px] text-red-600">Could not load the image.</p>}
      <p className="text-[11px] text-gray-400">
        {Math.round((doc.sizeBytes ?? 0) / 1024)} KB · Cloudinary:{" "}
        {doc.cloudinaryStatus === "UPLOADED" ? "copied" : (doc.cloudinaryStatus ?? "-").toLowerCase()}
      </p>
    </div>
  );
};

const AttemptRow = ({ a }: { a: KycAttempt }) => {
  const summary = parseSummary(a.summary);
  const details = Object.entries(summary).filter(([, v]) => v !== null && v !== "" && typeof v !== "object");
  return (
    <tr className="border-t align-top">
      <td className="py-2 pr-3 text-xs whitespace-nowrap">{a.step.replace("BANKONE_", "BankOne ").replace("_", " ")}</td>
      <td className="py-2 pr-3"><Chip status={a.status} /></td>
      <td className="py-2 pr-3 text-xs">{a.attempt ?? "-"}</td>
      <td className="py-2 pr-3 text-xs">
        {a.failureReason && <p className="text-red-600">{a.failureReason}</p>}
        {a.idNumber && <p>NIN {a.idNumber}</p>}
        {a.confidence != null && <p>Face confidence {a.confidence}</p>}
        {a.jobId && <p>Job {a.jobId}</p>}
        {a.providerReference && <p className="text-gray-400">Ref {a.providerReference}</p>}
        {a.autoRetries ? <p className="text-gray-400">Retried {a.autoRetries}×</p> : null}
        {details.length > 0 && (
          <p className="text-gray-400">{details.map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}</p>
        )}
      </td>
      <td className="py-2 text-xs whitespace-nowrap text-gray-500">{when(a.updatedOn)}</td>
    </tr>
  );
};

const Kyc = () => {
  const k = useKyc();
  const detail = k.detail;

  const columns: ColumnDef<KycListItem>[] = [
    {
      header: "Customer",
      accessorKey: "name",
      cell: ({ row }) => (
        <button onClick={() => k.setSelectedId(row.original.id)} className="text-left">
          <p className="font-medium text-[#7C2EBF] hover:underline">{row.original.name || "-"}</p>
          <p className="text-[11px] text-gray-500">{row.original.email}</p>
        </button>
      ),
    },
    { header: "BankOne account", accessorKey: "bankOneAccountNumber", cell: ({ row }) => row.original.bankOneAccountNumber ?? "-" },
    {
      header: "Tier",
      accessorKey: "tier",
      cell: ({ row }) => <Chip status={row.original.tier === 3 ? "VERIFIED" : row.original.tier === 2 ? "PENDING" : "NOT_STARTED"} text={`Tier ${row.original.tier}`} />,
    },
    {
      header: "Steps",
      id: "steps",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {STEPS.map((s) => (
            <Chip key={s.step} status={row.original.steps[s.step]} text={s.short} title={`${s.label}: ${row.original.steps[s.step]}`} />
          ))}
        </div>
      ),
    },
    {
      header: "BankOne",
      id: "bankone",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Chip status={row.original.bankOne.tier2} text="T2" title={`Tier 2: ${row.original.bankOne.tier2}`} />
          <Chip status={row.original.bankOne.tier3} text="T3" title={`Tier 3: ${row.original.bankOne.tier3}`} />
        </div>
      ),
    },
    {
      header: "Attention",
      id: "attention",
      cell: ({ row }) =>
        row.original.attention.length ? (
          <span title={row.original.attention.join("\n")} className="text-xs font-semibold text-red-600">
            {row.original.attention.length} issue{row.original.attention.length === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        ),
    },
    { header: "Last activity", accessorKey: "lastActivity", cell: ({ row }) => <span className="text-xs">{when(row.original.lastActivity)}</span> },
    {
      header: "",
      id: "view",
      cell: ({ row }) => (
        <button onClick={() => k.setSelectedId(row.original.id)} className="text-xs text-[#7C2EBF] font-semibold">
          View
        </button>
      ),
    },
  ];

  const canReset = (status: KycStepStatus, attemptsLeft: number) => attemptsLeft < 5 || status === "FAILED" || status === "ERROR";

  return (
    <Container>
      <article className="mt-6 min-h-screen">
        <div className="bg-white rounded-md pb-2">
          <div className="flex flex-row flex-wrap gap-x-5 md:gap-x-8 text-xs text-[#6D6C6C] pt-6 px-2">
            {TABS.map((t) => (
              <TabItem
                key={t.value}
                label={`${t.label}${k.list?.counts ? ` (${k.list.counts[t.value] ?? 0})` : ""}`}
                value={t.value}
                active={k.filter === t.value}
                onClick={k.changeFilter as never}
              />
            ))}
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-2 py-4 border-b">
            <input
              value={k.searchInput}
              onChange={(e) => k.setSearchInput(e.target.value)}
              placeholder="Search name, email, phone or account number"
              className="border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
            />
            <Button name="Refresh" color="lightpurple" onClick={() => k.refetchList()} />
          </div>
          <DataTable
            data={k.list?.content ?? []}
            columns={columns}
            loading={k.listLoading}
            error={k.listError}
            useApiPagination={true}
            totalPages={k.list?.totalPages || 1}
            currentPage={k.currentPage}
            onPageChange={(p) => k.setCurrentPage(p)}
            setPageSize={k.setPageSize}
            pageSize={k.pageSize}
          />
        </div>

        <Dialog open={!!k.selectedId} onOpenChange={(open) => !open && k.setSelectedId(null)}>
          <DialogContent className="bg-white max-w-3xl max-h-[88vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>KYC — {detail?.customer?.name || "Customer"}</DialogTitle>
            </DialogHeader>
            {k.detailLoading && <p className="text-sm text-gray-500">Loading...</p>}
            {detail && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
                  <DetailRow label="Email" value={detail.customer.email} />
                  <DetailRow label="Phone" value={detail.customer.phone} />
                  <DetailRow label="BankOne account" value={detail.customer.bankOneAccountNumber} />
                  <DetailRow label="Account tier" value={<Chip status={detail.tier === 3 ? "VERIFIED" : detail.tier === 2 ? "PENDING" : "NOT_STARTED"} text={`Tier ${detail.tier}`} />} />
                  <DetailRow label="NIN" value={detail.ninMasked} />
                  <DetailRow label="Next step" value={detail.nextStep ?? "All steps done"} />
                </div>

                <section>
                  <h3 className="text-sm font-semibold mb-2">Steps</h3>
                  <div className="border rounded-md divide-y">
                    {detail.steps.map((s) => (
                      <div key={s.step} className="flex items-center justify-between gap-3 p-3">
                        <div>
                          <p className="text-sm font-medium">{STEPS.find((x) => x.step === s.step)?.label}</p>
                          <p className="text-[11px] text-gray-500">
                            {s.message ?? "Not started"} · {s.attemptsLeft} attempt{s.attemptsLeft === 1 ? "" : "s"} left
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Chip status={s.status} />
                          {canReset(s.status, s.attemptsLeft) && (
                            <button
                              onClick={() => k.resetAttempts(s.step)}
                              disabled={k.actionLoading !== null}
                              className="text-xs text-[#7C2EBF] font-semibold disabled:opacity-50"
                            >
                              {k.actionLoading === `reset-${s.step}` ? "Resetting..." : "Reset attempts"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold mb-2">BankOne upgrade</h3>
                  <div className="flex flex-wrap gap-3">
                    {([2, 3] as const).map((tier) => {
                      const status = (tier === 2 ? detail.bankOne.tier2 : detail.bankOne.tier3) as KycStepStatus;
                      // The upgrade follows a verified ID (tier 2) or a verified address (tier 3); before that there is nothing to retry.
                      const unlockedBy = tier === 2 ? "DOCUMENT" : "ADDRESS";
                      const ready = detail.steps.find((s) => s.step === unlockedBy)?.status === "VERIFIED";
                      return (
                        <div key={tier} className="border rounded-md p-3 flex items-center gap-3">
                          <span className="text-sm">Tier {tier}</span>
                          <Chip status={status} />
                          {status !== "VERIFIED" && !ready && (
                            <span className="text-[11px] text-gray-400">
                              Waiting for {tier === 2 ? "the ID" : "the address"} to be verified
                            </span>
                          )}
                          {status !== "VERIFIED" && ready && (
                            <button
                              onClick={() => k.retryBankOne(tier)}
                              disabled={k.actionLoading !== null}
                              className="text-xs bg-[#7C2EBF] text-white rounded-md px-3 py-1.5 disabled:opacity-50"
                            >
                              {k.actionLoading === `bankone-${tier}` ? "Retrying..." : "Retry now"}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold mb-2">Images on record</h3>
                  {detail.documents.length === 0 ? (
                    <p className="text-xs text-gray-500">None yet.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {detail.documents.map((d) => (
                        <KycImage key={d.id} service={k.service} doc={d} />
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 mt-2">Each time an image is opened it is recorded in the audit log.</p>
                </section>

                <section>
                  <h3 className="text-sm font-semibold mb-2">Every attempt</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[11px] uppercase text-gray-400">
                          <th className="pb-1 pr-3">Step</th>
                          <th className="pb-1 pr-3">Status</th>
                          <th className="pb-1 pr-3">#</th>
                          <th className="pb-1 pr-3">Details</th>
                          <th className="pb-1">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...detail.attempts].reverse().map((a) => (
                          <AttemptRow key={a.id} a={a} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </article>
    </Container>
  );
};

export default Kyc;
