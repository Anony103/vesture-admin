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
  KycBvnInfo,
  KycDetail,
  KycDocumentMeta,
  KycFilter,
  KycListItem,
  KycReviewAction,
  KycStepName,
  KycStepStatus,
} from "@/types/kyc-type";

const TABS: { label: string; value: KycFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Under review", value: "UNDER_REVIEW" },
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
  UNDER_REVIEW: "bg-amber-100 text-amber-800",
  REJECTED: "bg-red-100 text-red-700",
  APPROVED: "bg-green-100 text-green-700",
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
          {doc.type === "LIVENESS_SELFIE" ? "Live selfie" : doc.type === "UTILITY_BILL" ? "Utility bill" : "ID document"}
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
        {a.reviewedBy && (
          <p className="text-gray-600">
            Reviewed by {a.reviewedBy} on {when(a.reviewedOn)}{a.reviewReason ? `: ${a.reviewReason}` : ""}
          </p>
        )}
        {details.length > 0 && (
          <p className="text-gray-400">{details.map(([k, v]) => `${k}: ${String(v)}`).join(" · ")}</p>
        )}
      </td>
      <td className="py-2 text-xs whitespace-nowrap text-gray-500">{when(a.updatedOn)}</td>
    </tr>
  );
};

const shortTitle = (step: string) => STEPS.find((x) => x.step === step)?.label ?? step;

// What the reviewer decides with: the reason is required and kept with their name; on a rejection it is also what the customer is told.
const ReviewForm = ({
  step,
  busy,
  hasBill = false,
  onApprove,
  onReject,
}: {
  step: KycStepName;
  busy: boolean;
  // An address that came with a utility bill is approved only with the address the reviewer read on it.
  hasBill?: boolean;
  onApprove: (reason: string, addressOnBill?: string) => Promise<boolean>;
  onReject: (reason: string) => Promise<boolean>;
}) => {
  const [reason, setReason] = useState("");
  const [addressOnBill, setAddressOnBill] = useState("");
  const ready = reason.trim().length >= 10;
  const billReady = !hasBill || addressOnBill.trim().length >= 5;
  const approve = async () => {
    if (await onApprove(reason.trim(), hasBill ? addressOnBill.trim() : undefined)) {
      setReason("");
      setAddressOnBill("");
    }
  };
  const reject = async () => {
    if (await onReject(reason.trim())) setReason("");
  };
  return (
    <div className="border border-amber-200 bg-amber-50 rounded-md p-3 space-y-2">
      <p className="text-xs font-semibold text-amber-900">Your decision: {shortTitle(step)}</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Why? (required, at least 10 characters). It is recorded with your name. If you reject, the customer is shown this reason and can upload again."
        className="w-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
      />
      {hasBill && (
        <p className="text-[11px] text-amber-900">
          Check on the bill: it carries the customer&apos;s name, the address matches the typed one, and its date is within the last {BILL_MAX_AGE_DAYS} days.
        </p>
      )}
      {hasBill && (
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-amber-900" htmlFor="address-on-bill">
            Address as printed on the utility bill (needed to approve)
          </label>
          <input
            id="address-on-bill"
            value={addressOnBill}
            onChange={(e) => setAddressOnBill(e.target.value)}
            maxLength={500}
            placeholder="Copy the address from the bill that you compared with the typed one"
            className="w-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={approve}
          disabled={!ready || !billReady || busy}
          className="text-xs bg-green-600 text-white rounded-md px-3 py-1.5 disabled:opacity-40"
        >
          {busy ? "Saving..." : "Approve - mark as verified"}
        </button>
        <button
          onClick={reject}
          disabled={!ready || busy}
          className="text-xs bg-red-600 text-white rounded-md px-3 py-1.5 disabled:opacity-40"
        >
          {busy ? "Saving..." : "Reject - customer uploads again"}
        </button>
      </div>
    </div>
  );
};

// A step that ran out of attempts before manual review existed: clearing it needs a reason too.
const ResetForm = ({ busy, onReset }: { busy: boolean; onReset: (reason: string) => Promise<boolean> }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-[#7C2EBF] font-semibold">
        Reset attempts
      </button>
    );
  }
  return (
    <div className="border rounded-md p-3 space-y-2">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        maxLength={1000}
        placeholder="Why are you resetting this? (required, at least 10 characters)"
        className="w-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
      />
      <div className="flex gap-2">
        <button
          onClick={async () => {
            if (await onReset(reason.trim())) {
              setOpen(false);
              setReason("");
            }
          }}
          disabled={reason.trim().length < 10 || busy}
          className="text-xs bg-[#7C2EBF] text-white rounded-md px-3 py-1.5 disabled:opacity-40"
        >
          {busy ? "Resetting..." : "Reset attempts"}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-500">
          Cancel
        </button>
      </div>
    </div>
  );
};

type Fact = { label: string; onRecord: string; onAccount?: string; bad?: boolean };

// A bill may be no older than this (the server enforces it; this only highlights it for the reviewer).
const BILL_MAX_AGE_DAYS = 90;
const billAgeDays = (isoDate: string): number | null => {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
};

// What the provider read next to what the customer's account says, so a reviewer can see at a glance what did not line up.
const factsFor = (step: KycStepName, s: Record<string, unknown>, detail: KycDetail): Fact[] => {
  const str = (v: unknown) => (v === undefined || v === null || v === "" ? "" : String(v));
  const accountName = [detail.customer.firstName, detail.customer.middleName, detail.customer.lastName].filter(Boolean).join(" ") || detail.customer.name;
  const facts: Fact[] = [];
  if (step === "DOCUMENT") {
    facts.push({ label: "Name", onRecord: str(s.nameOnDocument), onAccount: accountName, bad: s.nameMatchesAccount === false || s.nameReadFromDocument === false });
    facts.push({ label: "Date of birth", onRecord: str(s.dateOfBirthOnDocument), onAccount: str(detail.customer.dateOfBirth) });
    facts.push({ label: "Expiry date", onRecord: str(s.expirationDate) });
    facts.push({ label: "Face matches selfie", onRecord: s.faceMatch === undefined ? "" : s.faceMatch ? "Yes" : "No", bad: s.faceMatch === false });
  } else if (step === "NIN") {
    facts.push({ label: "Name", onRecord: str(s.nameOnNin), onAccount: accountName, bad: s.nameMatchesBvn === false || s.nameReadFromNin === false });
    facts.push({ label: "Date of birth", onRecord: str(s.dateOfBirthOnNin), onAccount: str(detail.customer.dateOfBirth), bad: s.dateOfBirthMatches === false });
    facts.push({ label: "Face matches selfie", onRecord: s.faceMatch === undefined ? "" : s.faceMatch ? "Yes" : "No", bad: s.faceMatch === false });
  } else if (step === "ADDRESS") {
    facts.push({ label: "Address typed", onRecord: str(s.address), onAccount: str(detail.customer.address) });
    facts.push({ label: "Field check", onRecord: str(s.addressStatus) });
    if (typeof s.utilityBillDocumentId !== "string") {
      facts.push({ label: "Utility bill", onRecord: "none was sent with this attempt" });
    } else {
      const age = billAgeDays(str(s.billDate));
      facts.push({ label: "Utility bill type", onRecord: str(s.billType).replace("_", " ").toLowerCase() });
      if (str(s.billDate)) {
        // sent by an older app version; the current forms do not ask for it
        facts.push({
          label: "Bill date (typed by the customer)",
          onRecord: age === null ? str(s.billDate) : `${str(s.billDate)} (${age} day${age === 1 ? "" : "s"} old)`,
          bad: age === null || age > BILL_MAX_AGE_DAYS || age < 0,
        });
      } else {
        facts.push({ label: "Bill date", onRecord: `not asked: read the date on the bill, it must be within the last ${BILL_MAX_AGE_DAYS} days` });
      }
      if (typeof s.addressOnBill === "string") {
        facts.push({ label: "Address on the bill (as read by the reviewer)", onRecord: str(s.addressOnBill) });
      }
    }
  } else {
    facts.push({ label: "Actions asked", onRecord: str(s.actions) });
    facts.push({ label: "Took (ms)", onRecord: str(s.durationMs) });
  }
  return facts;
};

const StepDetail = ({ step, detail, k }: { step: KycStepName; detail: KycDetail; k: ReturnType<typeof useKyc> }) => {
  const attempt = [...detail.attempts].reverse().find((a) => a.step === step);
  if (!attempt) return <p className="text-xs text-gray-500 p-3">Nothing submitted for this step yet.</p>;
  const summary = parseSummary(attempt.summary);
  const facts = factsFor(step, summary, detail);
  const doc: KycDocumentMeta | undefined = detail.documents.find((d) => d.id === attempt.documentId);
  const selfie = [...detail.documents].reverse().find((d) => d.type === "LIVENESS_SELFIE");
  const reviews = detail.reviews.filter((r) => r.step === step);
  const waiting = attempt.status === "UNDER_REVIEW" || (attempt.status === "FAILED" && step !== "LIVENESS");
  const stepState = detail.steps.find((s) => s.step === step);
  const busy = k.actionLoading === `review-${step}`;
  const unread = facts.some((f) => f.label === "Name" && !f.onRecord);
  return (
    <div className="bg-gray-50 border-t p-3 space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Chip status={attempt.status} />
          <span className="text-[11px] text-gray-500">Attempt {attempt.attempt ?? "-"} · {when(attempt.updatedOn)}</span>
        </div>
        {attempt.failureReason && (
          <p className="text-xs text-red-700">Automatic check: {attempt.failureReason}</p>
        )}
        {unread && (
          <p className="text-xs text-amber-800">
            The provider returned no name for this {step === "NIN" ? "NIN" : "document"}. That is why it could not be matched automatically, so the name has to be
            checked by eye against the image below.
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[11px] uppercase text-gray-400">
              <th className="pb-1 pr-3">Detail</th>
              <th className="pb-1 pr-3">Read by the provider</th>
              <th className="pb-1">On the customer&apos;s account</th>
            </tr>
          </thead>
          <tbody>
            {facts.map((f) => (
              <tr key={f.label} className="border-t">
                <td className="py-1.5 pr-3 text-gray-500">{f.label}</td>
                <td className={`py-1.5 pr-3 ${f.bad || !f.onRecord ? "text-red-600 font-medium" : "text-gray-800"}`}>{f.onRecord || "not returned"}</td>
                <td className="py-1.5 text-gray-800">{f.onAccount ?? "-"}</td>
              </tr>
            ))}
            {attempt.confidence != null && (
              <tr className="border-t">
                <td className="py-1.5 pr-3 text-gray-500">Face confidence</td>
                <td className="py-1.5 pr-3 text-gray-800">{Math.round(attempt.confidence * 10) / 10}</td>
                <td />
              </tr>
            )}
            {attempt.idNumber && (
              <tr className="border-t">
                <td className="py-1.5 pr-3 text-gray-500">NIN</td>
                <td className="py-1.5 pr-3 text-gray-800">{attempt.idNumber}</td>
                <td />
              </tr>
            )}
            {typeof summary.fieldsReturned === "string" && (
              <tr className="border-t">
                <td className="py-1.5 pr-3 text-gray-500">Fields the provider sent</td>
                <td className="py-1.5 pr-3 text-gray-600" colSpan={2}>{summary.fieldsReturned || "none"}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(doc || (selfie && (step === "NIN" || step === "DOCUMENT" || step === "LIVENESS"))) && (
        <div className="grid sm:grid-cols-2 gap-3">
          {doc && <KycImage service={k.service} doc={doc} />}
          {selfie && selfie.id !== doc?.id && (step === "NIN" || step === "DOCUMENT") && <KycImage service={k.service} doc={selfie} />}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Decisions on this step</p>
          {reviews.map((r) => (
            <p key={r.id} className="text-xs text-gray-700">
              <Chip status={r.decision} /> {r.adminName || r.adminEmail} ({r.adminRole?.replace("ROLE_", "").toLowerCase()}) · {when(r.createdOn)} - {r.reason}
              {r.addressOnBill ? ` (address on the bill: ${r.addressOnBill})` : ""}
            </p>
          ))}
        </div>
      )}

      {waiting && step !== "LIVENESS" && (
        <ReviewForm
          step={step}
          busy={busy}
          hasBill={step === "ADDRESS" && typeof summary.utilityBillDocumentId === "string"}
          onApprove={(reason, addressOnBill) => k.review(step, "APPROVE", reason, addressOnBill)}
          onReject={(reason) => k.review(step, "REJECT", reason)}
        />
      )}
      {!waiting && stepState && stepState.attemptsLeft < 5 && stepState.status !== "VERIFIED" && stepState.status !== "UNDER_REVIEW" && (
        <ResetForm busy={k.actionLoading === `reset-${step}`} onReset={(reason) => k.resetAttempts(step, reason)} />
      )}
    </div>
  );
};

const BvnCard = ({ bvn, k }: { bvn: KycBvnInfo; k: ReturnType<typeof useKyc> }) => {
  const [shown, setShown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // A new customer must never inherit the previous customer's revealed number.
  useEffect(() => setShown(null), [k.selectedId]);
  if (!bvn.present) {
    return <p className="text-xs text-gray-500">No BVN on this customer&apos;s account.</p>;
  }
  const reveal = async () => {
    setLoading(true);
    setShown(await k.revealBvn());
    setLoading(false);
  };
  return (
    <div className="border rounded-md p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-mono">{shown ?? bvn.masked}</span>
        {shown ? (
          <button onClick={() => setShown(null)} className="text-xs text-[#7C2EBF] font-semibold">Hide</button>
        ) : (
          <button onClick={reveal} disabled={loading} className="text-xs text-[#7C2EBF] font-semibold disabled:opacity-50">
            {loading ? "Loading..." : "Reveal"}
          </button>
        )}
        {bvn.sandbox && <Chip status="RESET" text="Sandbox record" />}
        <span className="text-[11px] text-gray-400">Revealing the full number is recorded in the audit log.</span>
      </div>
      {bvn.recorded ? (
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
          <DetailRow label="Name on BVN" value={bvn.name} />
          <DetailRow label="Name on account" value={bvn.accountName} />
          <DetailRow
            label="Name match"
            value={<Chip status={(bvn.nameMatchPercent ?? 0) >= 80 ? "VERIFIED" : "FAILED"} text={`${bvn.nameMatchPercent ?? 0}%`} />}
          />
          <DetailRow label="Date of birth on BVN" value={<>{bvn.dateOfBirth ?? "-"} {bvn.dateOfBirthMatches === false && <Chip status="FAILED" text="differs" />}</>} />
          <DetailRow label="Phone on BVN" value={bvn.phone} />
          <DetailRow label="Gender" value={bvn.gender} />
          <DetailRow label="Checked" value={when(bvn.verifiedAt)} />
          <DetailRow label="Times looked up" value={bvn.lookupCount} />
        </div>
      ) : (
        <p className="text-xs text-gray-500">No saved BVN lookup for this number (the customer signed up before BVN records were kept).</p>
      )}
      {bvn.lookups && bvn.lookups.length > 0 && (
        <div className="overflow-x-auto">
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Lookups</p>
          <table className="w-full text-left text-xs">
            <tbody>
              {bvn.lookups.map((l, i) => (
                <tr key={i} className="border-t">
                  <td className="py-1 pr-3 whitespace-nowrap text-gray-500">{when(l.createdAt)}</td>
                  <td className="py-1 pr-3">{l.source}</td>
                  <td className="py-1 pr-3">{l.sector ?? "-"}</td>
                  <td className="py-1 text-gray-400">{l.detail ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ReviewHistory = ({ reviews }: { reviews: KycReviewAction[] }) =>
  reviews.length === 0 ? (
    <p className="text-xs text-gray-500">No manual decisions yet.</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-[11px] uppercase text-gray-400">
            <th className="pb-1 pr-3">When</th>
            <th className="pb-1 pr-3">Step</th>
            <th className="pb-1 pr-3">Decision</th>
            <th className="pb-1 pr-3">Reason</th>
            <th className="pb-1">By</th>
          </tr>
        </thead>
        <tbody>
          {[...reviews].reverse().map((r) => (
            <tr key={r.id} className="border-t align-top">
              <td className="py-1.5 pr-3 whitespace-nowrap text-gray-500">{when(r.createdOn)}</td>
              <td className="py-1.5 pr-3 whitespace-nowrap">{shortTitle(r.step)}{r.attempt ? ` #${r.attempt}` : ""}</td>
              <td className="py-1.5 pr-3"><Chip status={r.decision} /></td>
              <td className="py-1.5 pr-3 text-gray-800">
                {r.reason}
                {r.addressOnBill && <span className="block text-[11px] text-gray-500">Address on the bill: {r.addressOnBill}</span>}
              </td>
              <td className="py-1.5 text-gray-600">
                {r.adminName || r.adminEmail}
                <br />
                <span className="text-[11px] text-gray-400">{r.adminEmail} · {r.adminRole?.replace("ROLE_", "").toLowerCase()} · {r.ipAddress ?? "-"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
    {
      header: "Waiting for review",
      id: "waiting",
      cell: ({ row }) =>
        row.original.reviewWaitingSince ? (
          <span className="text-xs font-semibold text-amber-700">
            since {when(row.original.reviewWaitingSince)}
            {row.original.addressBillUploaded && <span className="ml-1 rounded-full bg-[#F6EBFE] px-1.5 py-0.5 text-[10px] text-[#7C2EBF]">utility bill</span>}
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

  const [openStep, setOpenStep] = useState<KycStepName | null>(null);
  // Opening another customer starts with every step closed.
  useEffect(() => setOpenStep(null), [k.selectedId]);

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
                  <DetailRow label="Date of birth" value={detail.customer.dateOfBirth} />
                  <DetailRow label="Sector" value={[detail.customer.sector, detail.customer.ippisNo].filter(Boolean).join(" · ")} />
                  <DetailRow label="NIN" value={detail.ninMasked} />
                  <DetailRow label="Next step" value={detail.nextStep ?? "All steps done"} />
                </div>

                <section>
                  <h3 className="text-sm font-semibold mb-2">Steps</h3>
                  <p className="text-[11px] text-gray-400 mb-2">Click a step to see exactly what was read and decide it.</p>
                  <div className="border rounded-md divide-y">
                    {detail.steps.map((s) => (
                      <div key={s.step}>
                        <button
                          onClick={() => setOpenStep(openStep === s.step ? null : s.step)}
                          className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-gray-50"
                          aria-expanded={openStep === s.step}
                        >
                          <div>
                            <p className="text-sm font-medium">{STEPS.find((x) => x.step === s.step)?.label}</p>
                            <p className="text-[11px] text-gray-500">{s.message ?? "Not started"}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Chip status={s.status} />
                            <span className="text-xs text-gray-400">{openStep === s.step ? "Hide" : "Details"}</span>
                          </div>
                        </button>
                        {openStep === s.step && <StepDetail step={s.step} detail={detail} k={k} />}
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold mb-2">BVN</h3>
                  <BvnCard bvn={detail.bvn} k={k} />
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
                  <h3 className="text-sm font-semibold mb-2">Review decisions</h3>
                  <ReviewHistory reviews={detail.reviews} />
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
