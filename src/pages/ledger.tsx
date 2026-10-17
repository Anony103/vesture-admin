import { useState } from "react";
import { Container } from "../components/shared/container";
import { Overview } from "../components/ledger/overview";
import { TrialBalance } from "../components/ledger/trial-balance";
import { Reconciliation } from "../components/ledger/reconciliation";
import { Adjustments } from "../components/ledger/adjustments";
import { Tax } from "../components/ledger/tax";
import { Setup } from "../components/ledger/setup";

const TABS = [
  { id: "overview", label: "Overview", view: <Overview /> },
  { id: "trial", label: "Trial balance & accounts", view: <TrialBalance /> },
  { id: "recon", label: "Bank reconciliation", view: <Reconciliation /> },
  { id: "adjust", label: "Corrections", view: <Adjustments /> },
  { id: "tax", label: "Tax", view: <Tax /> },
  { id: "setup", label: "Setup & month-end", view: <Setup /> },
];

/** The books: is every balance backed by the ledger, does the bank agree, and what has been corrected. */
const LedgerPage = () => {
  const [tab, setTab] = useState("overview");
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  return (
    <Container>
      <article className="mt-6 min-h-screen">
        <div className="flex flex-wrap gap-6 text-xs text-[#6D6C6C] bg-white rounded-md px-4 pt-4 mb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 ${tab === t.id ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {current.view}
      </article>
    </Container>
  );
};

export default LedgerPage;
