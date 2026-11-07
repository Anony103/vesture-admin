import { NavLink } from "react-router-dom";
import { Container } from "../components/shared/container";
import Button from "../components/shared/button";
import useStagingFunding, { useStagingFundingStatus } from "@/hooks/use-staging-funding";

const formatNaira = (value: number | null | undefined) =>
  value == null
    ? "-"
    : `₦${Number(value).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PLAN_NAMES: Record<string, string> = {
  SMART_LOCK: "Smart Lock",
  SAVE_SMALL_SMALL: "SmallVest",
  TARGET_SAVINGS: "Target Lock",
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1 border-b pb-2">
    <span className="text-[11px] uppercase tracking-wide text-gray-400">{label}</span>
    <span className="text-sm text-gray-800 break-words">{value || "-"}</span>
  </div>
);

const inputClass =
  "border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]";

const StagingFunding = () => {
  const status = useStagingFundingStatus();
  const f = useStagingFunding();

  if (status.isLoading) {
    return (
      <Container>
        <p className="mt-6 text-sm text-gray-500">Checking...</p>
      </Container>
    );
  }

  if (!status.enabled) {
    return (
      <Container>
        <article className="mt-6 rounded-md bg-white p-6">
          <h2 className="text-sm font-semibold">Test funding is not available here</h2>
          <p className="mt-1 text-xs text-gray-600">
            It exists on staging only, and only for a super admin.
          </p>
        </article>
      </Container>
    );
  }

  const plan = f.customer?.pendingTransfer ?? null;

  return (
    <Container>
      <article className="mt-6 min-h-screen space-y-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <b>Staging only.</b> This sends the customer a simulated Flutterwave transfer, so no real money moves. It goes through the
          same routine a real deposit does: the wallet (or a pending plan transfer of exactly that amount) is credited, a history row is
          written and the call appears in the{" "}
          <NavLink to="/webhookLogs" className="underline font-semibold">
            Webhook Log
          </NavLink>{" "}
          as a staging test. There is no fee.
        </div>

        <section className="rounded-md bg-white p-4 space-y-3">
          <h2 className="text-sm font-semibold">1. Find the customer</h2>
          <form
            className="flex flex-col md:flex-row gap-3 md:items-center"
            onSubmit={(e) => {
              e.preventDefault();
              f.findCustomer();
            }}
          >
            <input
              type="email"
              value={f.email}
              onChange={(e) => f.changeEmail(e.target.value)}
              placeholder="Customer's email (for example the Gmail they signed up with)"
              className={`${inputClass} md:w-[28rem]`}
            />
            <Button name="Find customer" color="lightpurple" type="submit" loading={f.finding} />
          </form>
          {f.lookupError && <p className="text-xs text-red-600">{f.lookupError}</p>}

          {f.customer && (
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-3 rounded-md bg-gray-50 p-3">
              <Row label="Customer" value={f.customer.fullName} />
              <Row label="Email" value={f.customer.email} />
              <Row label="Wallet balance" value={formatNaira(f.customer.walletBalance)} />
              <Row label="Virtual account number" value={f.customer.accountNumber} />
              <div className="md:col-span-2">
                <span className="text-[11px] uppercase tracking-wide text-gray-400 block mb-1">Pending plan transfer</span>
                {plan ? (
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-800">
                    <span>
                      {PLAN_NAMES[plan.savingsType] ?? plan.savingsType} waiting for {formatNaira(plan.expectedAmount)} (ref{" "}
                      {plan.referenceCode})
                    </span>
                    <button
                      type="button"
                      onClick={() => f.setAmount(String(plan.expectedAmount))}
                      className="text-xs text-[#7C2EBF] font-semibold"
                    >
                      Use this amount
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">None: any amount goes to the wallet.</span>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-md bg-white p-4 space-y-3">
          <h2 className="text-sm font-semibold">2. Fund</h2>
          <form
            className="flex flex-col md:flex-row gap-3 md:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              if (f.canFund) f.fund();
            }}
          >
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              Amount (₦){status.maxAmount != null ? `, up to ${formatNaira(status.maxAmount)}` : ""}
              <input
                type="number"
                min="0"
                step="0.01"
                value={f.amount}
                onChange={(e) => f.setAmount(e.target.value)}
                placeholder="100"
                className={`${inputClass} md:w-48`}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-600">
              Sender name (optional)
              <input
                value={f.senderName}
                onChange={(e) => f.setSenderName(e.target.value)}
                placeholder="Test Sender"
                className={`${inputClass} md:w-64`}
              />
            </label>
            <div className={f.canFund ? "" : "opacity-50 pointer-events-none"}>
              <Button name="Fund" color="purple" type="submit" loading={f.funding} />
            </div>
          </form>
          {!f.customer && <p className="text-xs text-gray-500">Find the customer first.</p>}
          {f.fundError && <p className="text-xs text-red-600">{f.fundError}</p>}
        </section>

        {f.result && (
          <section
            className={`rounded-md p-4 space-y-3 ${f.result.credited ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
          >
            <h2 className={`text-sm font-semibold ${f.result.credited ? "text-green-800" : "text-red-800"}`}>
              {f.result.credited ? "Funded" : "Not credited"}
            </h2>
            <p className="text-sm text-gray-800">{f.result.message}</p>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-3">
              <Row label="Outcome" value={f.result.outcome} />
              <Row
                label="Credited to"
                value={f.result.creditedTo === "PLAN" ? "The plan" : f.result.creditedTo === "WALLET" ? "The wallet" : "-"}
              />
              <Row label="Amount" value={formatNaira(f.result.amount)} />
              <Row label="Wallet balance now" value={formatNaira(f.result.newWalletBalance)} />
              <Row label="Reference (flw_ref)" value={f.result.flwRef} />
            </div>
          </section>
        )}
      </article>
    </Container>
  );
};

export default StagingFunding;
