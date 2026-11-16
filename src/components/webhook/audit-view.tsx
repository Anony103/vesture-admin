import { ReactNode } from "react";
import { CopyText } from "@/components/shared/copy-text";
import { WebhookLogItem } from "@/types/webhook-type";

/**
 * The webhook call written out for an auditor: who paid whom, the money step by step, what we did and why, and the references to look
 * it up by. Everything comes from the log row and from the raw body Flutterwave sent; nothing here is stored separately except what was
 * credited and the fee taken from it, which the server records when it credits.
 */

type Obj = Record<string, unknown>;

const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() !== "" ? v.trim() : null);
const num = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return null;
};

const naira = (value: number | null | undefined, currency?: string | null) =>
  value == null
    ? "-"
    : `${!currency || currency === "NGN" ? "₦" : `${currency} `}${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const cents = (v: number) => Math.round(v * 100);

const when = (value: string | null | undefined) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("en-NG", { dateStyle: "long", timeStyle: "medium" });
};

const HASH_MEANING: Record<string, string> = {
  OK: "Passed: the secret hash Flutterwave sent matches ours.",
  MISSING_HEADER: "Failed: the call carried no secret hash.",
  MISMATCH: "Failed: the secret hash did not match ours.",
  SERVER_HASH_UNSET: "Not checked: no secret hash is set on our server.",
  NOT_APPLICABLE: "Not applicable: this did not arrive as a webhook call, so there was no hash to check.",
};

const SOURCE_MEANING: Record<string, string> = {
  WEBHOOK: "Flutterwave called our webhook.",
  CATCH_UP: "Found by the catch-up job, which asks Flutterwave for transfers whose webhook never arrived.",
  STAGING_TEST: "Simulated by a super admin on staging. No real money moved.",
};

const OUTCOME_MEANING: Record<string, string> = {
  CREDITED: "Credited",
  DUPLICATE: "Not credited: already credited before",
  IGNORED: "Not credited: not money for a Vesture customer",
  REFUSED: "Not credited: refused",
  RETRY: "Not credited yet: Flutterwave will send it again",
  ERROR: "Not credited: failed inside our server",
};

const APP_MEANING: Record<string, string> = {
  VESTURE: "Vesture",
  TRAVEL: "Travel (shares the Flutterwave account)",
  RENT_PLUS: "Rent+ (shares the Flutterwave account)",
  OTHER: "Unknown: the tx_ref matches no known app",
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-2">
    <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
    {children}
  </section>
);

const Line = ({ label, field, value, strong }: { label: string; field?: string; value: ReactNode; strong?: boolean }) => (
  <div className="flex items-baseline justify-between gap-4 border-b py-1.5 text-sm last:border-b-0">
    <span className="text-gray-600">
      {label}
      {field && <span className="ml-1.5 text-[10px] text-gray-400">{field}</span>}
    </span>
    <span className={`text-right break-words ${strong ? "font-semibold text-gray-900" : "text-gray-800"}`}>{value ?? "-"}</span>
  </div>
);

export const AuditView = ({ detail }: { detail: WebhookLogItem }) => {
  let parsed: Obj | null = null;
  if (detail.rawBody) {
    try {
      parsed = obj(JSON.parse(detail.rawBody));
    } catch {
      parsed = null;
    }
  }
  const data = obj(parsed?.data);
  const customer = obj(data.customer);
  const meta = obj(parsed?.meta_data);

  const currency = str(data.currency) ?? detail.currency;
  const amount = num(data.amount) ?? detail.amount;
  const charged = num(data.charged_amount);
  const appFee = num(data.app_fee);
  const merchantFee = num(data.merchant_fee);
  const fee = appFee == null && merchantFee == null ? null : (appFee ?? 0) + (merchantFee ?? 0);
  const paidOnTop = amount != null && charged != null ? Math.max(charged - amount, 0) : null;
  const borneByVesture = fee != null ? Math.max(fee - (paidOnTop ?? 0), 0) : null;

  const sender = str(meta.originatorname);
  const senderBank = str(meta.bankname);
  const senderAccount = str(meta.originatoraccountnumber);
  const holder = str(customer.name);
  const virtualAccount = str(meta.virtualaccountnumber);
  const sentAt = when(str(data.created_at));

  const credited = detail.outcome === "CREDITED";
  const recorded = detail.creditedAmount != null;
  const takenFromCredit = detail.feeTakenFromCredit ?? 0;
  const target = detail.creditedTo === "PLAN" ? `plan${detail.creditedPlan ? ` "${detail.creditedPlan}"` : ""}` : detail.creditedTo === "WALLET" ? "wallet" : null;
  const addsUp = recorded && amount != null ? cents(amount) - cents(takenFromCredit) === cents(detail.creditedAmount as number) : null;

  // why there is no body to read from: a catch-up row never had one; a failed-hash call keeps only its first 2,000 characters
  const noBodyBecause = detail.rawBody
    ? "The body of the call was cut short (only the first 2,000 characters are kept when the secret hash fails), so only the fields of the log row are shown."
    : detail.source === "CATCH_UP"
      ? "This transfer was read from Flutterwave's list, so there was no webhook body; only the fields of the log row are shown."
      : "The body of the call was not kept, so only the fields of the log row are shown.";
  const reported = parsed
    ? `${sentAt ? `On ${sentAt}, ` : ""}Flutterwave reported ${str(data.status) ?? "a"} ${(str(data.payment_type) ?? "payment").replace("_", " ")} of ${naira(amount, currency)}${
        sender ? ` from ${sender}${senderBank ? ` (${senderBank})` : ""}` : ""
      }${virtualAccount ? ` into virtual account ${virtualAccount}` : ""}${holder ? `, held by ${holder}` : ""}.`
    : amount != null
      ? `Flutterwave reported a ${naira(amount, currency)} payment${detail.customerEmail ? ` for ${detail.customerEmail}` : ""}. ${noBodyBecause}`
      : noBodyBecause;

  let did: string;
  if (credited && recorded && target) {
    did = `We credited ${naira(detail.creditedAmount, currency)} to the customer's ${target}.${
      takenFromCredit > 0 ? ` Flutterwave's fee of ${naira(takenFromCredit, currency)} was taken from the amount sent, so the customer received ${naira(detail.creditedAmount, currency)} of the ${naira(amount, currency)} sent.` : ""
    }`;
  } else if (credited) {
    did = "We credited the customer. What was credited and the fee taken from it were not recorded for this call, because it was logged before that was kept.";
  } else {
    did = `${OUTCOME_MEANING[detail.outcome] ?? detail.outcome}${detail.reason ? ` (${detail.reason}).` : "."}`;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-purple-100 bg-purple-50/50 p-3 text-sm leading-relaxed text-gray-800">
        <p>{reported}</p>
        <p className="mt-2 font-medium">{did}</p>
      </div>

      {(amount != null || fee != null) && (
        <Section title="The money, step by step">
          <div className="rounded-md border px-3">
            <Line label="Amount sent to the account" field="amount" value={naira(amount, currency)} />
            {charged != null && <Line label="Amount Flutterwave charged" field="charged_amount" value={naira(charged, currency)} />}
            {fee != null && <Line label="Flutterwave's fee" field="app_fee + merchant_fee" value={naira(fee, currency)} />}
            {paidOnTop != null && <Line label="Paid by the customer on top of the amount" field="charged_amount − amount" value={naira(paidOnTop, currency)} />}
            {borneByVesture != null && <Line label="Fee Vesture would bear" field="fee − paid on top" value={naira(borneByVesture, currency)} />}
            {recorded && <Line label="Fee taken from the customer's credit" value={`− ${naira(takenFromCredit, currency)}`} />}
            {recorded && <Line label={`Credited to the customer's ${detail.creditedTo === "PLAN" ? "plan" : "wallet"}`} value={naira(detail.creditedAmount, currency)} strong />}
          </div>
          {addsUp === true && <p className="text-[11px] text-green-700">Checks out: the amount sent less the fee taken equals what was credited.</p>}
          {addsUp === false && <p className="text-[11px] text-red-700">Does not add up: the amount sent less the fee taken differs from what was credited. Look at this one.</p>}
          {credited && !recorded && <p className="text-[11px] text-gray-500">Credited amount: not recorded for this older call.</p>}
        </Section>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Section title="Who paid">
          <div className="rounded-md border px-3">
            <Line label="Sender" field="originatorname" value={sender} />
            <Line label="Sender's bank" field="bankname" value={senderBank} />
            <Line label="Sender's account" field="originatoraccountnumber" value={senderAccount} />
            <Line label="Payment type" field="payment_type" value={detail.paymentType} />
          </div>
        </Section>
        <Section title="Who received">
          <div className="rounded-md border px-3">
            <Line label="Customer" field="customer.name" value={holder} />
            <Line label="Email (masked)" field="customer.email" value={detail.customerEmail} />
            <Line label="Virtual account" field="virtualaccountnumber" value={virtualAccount} />
            <Line label="Credited to" value={credited ? (target ?? "not recorded") : "Nothing was credited"} />
          </div>
        </Section>
      </div>

      <Section title="What we decided, and why">
        <div className="rounded-md border px-3">
          <Line label="Outcome" value={OUTCOME_MEANING[detail.outcome] ?? detail.outcome} strong />
          <Line label="Reason" value={detail.reason} />
          <Line label="Our answer to Flutterwave" value={detail.httpStatus == null ? "-" : `HTTP ${detail.httpStatus}`} />
          <Line label="Secret hash check" value={HASH_MEANING[detail.hashResult] ?? detail.hashResult} />
          <Line label="App" value={APP_MEANING[detail.app] ?? detail.app} />
          <Line label="How we got it" value={SOURCE_MEANING[detail.source] ?? detail.source} />
          <Line label="Flutterwave's status" field="status" value={detail.providerStatus} />
        </div>
      </Section>

      <Section title="References to look it up by">
        <div className="rounded-md border px-3">
          <Line label="Received by us" value={when(detail.createdOn)} />
          <Line label="Flutterwave reference" field="flw_ref" value={<CopyText value={detail.flwRef} />} />
          <Line label="Transaction reference" field="tx_ref" value={<CopyText value={detail.txRef} />} />
          <Line label="Flutterwave transaction id" field="id" value={detail.providerTransactionId == null ? "-" : <CopyText value={String(detail.providerTransactionId)} />} />
          <Line label="Event" field="event" value={detail.event} />
          <Line label="Narration" field="narration" value={str(data.narration)} />
        </div>
      </Section>
    </div>
  );
};
