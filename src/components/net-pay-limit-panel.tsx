import { useEffect, useState } from "react";
import Button from "./shared/button";
import useNetPayLimit from "@/hooks/use-net-pay-limit";

const inputClass =
  "border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]";

const NetPayLimitPanel = () => {
  const { limit, allowed, isLoading, save } = useNetPayLimit();
  const [text, setText] = useState("30");

  // follow what is saved (when the page first loads, and after a save)
  useEffect(() => {
    if (limit) setText(String(limit.percent));
  }, [limit]);

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!allowed || !limit) {
    return (
      <div>
        <h2 className="text-sm font-semibold">The net-pay limit is not available to you</h2>
        <p className="mt-1 text-xs text-gray-600">Only a super admin can change the share of net pay customers may commit.</p>
      </div>
    );
  }

  const value = Number(text);
  const valid = text.trim() !== "" && Number.isFinite(value) && value >= 1 && value <= 100;
  const changed = valid && value !== limit.percent;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Net-pay limit</h1>
      <p className="text-xs text-gray-600">
        A public-sector customer may not commit more than this share of their net pay each month. It is checked when they start a
        SmallVest, Smart Lock, Target Lock or Buy-Now-Pay-Later plan: the amount (SmallVest), the monthly contribution (total ÷ months, for Smart
        Lock and Target Lock) or the monthly instalment. Net pay comes from the last staff upload. Private-sector and open-registration customers are not checked, nor is a
        customer whose staff record has no net pay.
      </p>
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        A change applies straight away, to every public-sector customer, and is written to the Audit Log. Plans that already exist are not
        affected.
      </div>
      <section className="rounded-md border border-gray-200 p-4 space-y-4">
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Share of net pay (1 to 100)
          <span className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              min={1}
              max={100}
              step="any"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={inputClass}
            />
            <span className="text-sm text-gray-700">%</span>
          </span>
        </label>
        {!valid && <p className="text-xs text-red-600">Enter a number from 1 to 100.</p>}
        {limit.updatedBy && (
          <p className="text-xs text-gray-500">
            Last changed by {limit.updatedBy}
            {limit.updatedOn ? ` on ${new Date(limit.updatedOn).toLocaleString()}` : ""}.
          </p>
        )}
        <div className={changed ? "" : "opacity-50 pointer-events-none"}>
          <Button name="Save" color="purple" loading={save.isPending} onClick={() => save.mutate(value)} />
        </div>
      </section>
    </div>
  );
};

export default NetPayLimitPanel;
