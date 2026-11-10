import { useEffect, useState } from "react";
import Button from "./shared/button";
import useDepositFunding from "@/hooks/use-deposit-funding";
import { DepositFundingMethod } from "@/types/deposit-funding-type";

const OPTIONS: { value: DepositFundingMethod; title: string; text: string }[] = [
  {
    value: "TRANSFER",
    title: "Bank transfer to the customer's account number",
    text: "The way it has always worked. The customer sends money to their own account number; when the fee is charged to customers they are asked to send the plan amount plus the fee.",
  },
  {
    value: "CHECKOUT",
    title: "Flutterwave payment page only",
    text: "The customer pays on Flutterwave's page (bank transfer only). Flutterwave adds its fee on top, so the plan is credited the full amount.",
  },
  {
    value: "BOTH",
    title: "Let the customer choose",
    text: "Both options are shown: the account number, and a Pay on Flutterwave button.",
  },
];

const DepositFundingPanel = () => {
  const { funding, allowed, isLoading, save } = useDepositFunding();
  const [method, setMethod] = useState<DepositFundingMethod>("TRANSFER");

  // follow what is saved (when the page first loads, and after a save)
  useEffect(() => {
    if (funding) setMethod(funding.method);
  }, [funding]);

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!allowed || !funding) {
    return (
      <div>
        <h2 className="text-sm font-semibold">Deposit funding is not available to you</h2>
        <p className="mt-1 text-xs text-gray-600">Only a super admin can change how customers fund their plans.</p>
      </div>
    );
  }

  const changed = method !== funding.method;
  const needsFlutterwave = method !== "TRANSFER" && !funding.checkoutReady;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Deposit funding</h1>
      <p className="text-xs text-gray-600">
        Chooses how customers pay when they fund a SmallVest or Target Lock by bank transfer. A change takes effect on web and the server within a few
        seconds; the mobile app picks it up the next time it is opened. Smart Lock and wallet funding keep using the account number.
      </p>

      <div className="space-y-2" role="radiogroup" aria-label="Deposit funding method">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 ${method === option.value ? "border-purple-500 bg-purple-50" : "border-gray-200"}`}
          >
            <input type="radio" name="deposit-funding" className="mt-1" checked={method === option.value} onChange={() => setMethod(option.value)} />
            <span>
              <span className="block text-sm font-semibold">{option.title}</span>
              <span className="mt-0.5 block text-xs text-gray-600">{option.text}</span>
            </span>
          </label>
        ))}
      </div>

      {needsFlutterwave && (
        <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">
          Flutterwave&apos;s payment page is not set up on this server (its secret key or FLUTTERWAVE_CHECKOUT_REDIRECT_URL is missing), so it cannot be offered and customers would only see the account number.
          {method === "CHECKOUT" ? " The server will refuse to save this choice." : ""}
        </p>
      )}
      {funding.updatedBy && (
        <p className="text-xs text-gray-500">
          Last changed by {funding.updatedBy}
          {funding.updatedOn ? ` on ${new Date(funding.updatedOn).toLocaleString()}` : ""}.
        </p>
      )}

      <div className={changed ? "" : "opacity-50 pointer-events-none"}>
        <Button name="Save" color="purple" loading={save.isPending} onClick={() => save.mutate(method)} />
      </div>
    </div>
  );
};

export default DepositFundingPanel;
