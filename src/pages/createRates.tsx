import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import Backbutton from "../components/shared/backbutton";
import { Container } from "../components/shared/container";
import { SESSION_STORAGE_KEY } from "@/constants";
import { ManageRatesService } from "@/services/manage-rates-service";

const PRODUCTS = [
  { value: "SmartLock", label: "Smart Lock", tenors: true },
  { value: "TargetSavings", label: "Target Lock", tenors: true },
  { value: "SSS", label: "SmallVest", tenors: false },
  { value: "BNPL", label: "Buy Now Pay Later", tenors: false },
];

// The durations a customer can pick on the web (3, 6, 9 or 12 months), which are exactly 90, 180, 270 and 365 days.
const DURATIONS = [
  { label: "3 months", from: 90, to: 90 },
  { label: "6 months", from: 180, to: 180 },
  { label: "9 months", from: 270, to: 270 },
  { label: "12 months", from: 365, to: 365 },
];

type Row = { label?: string; min: string; max: string; rate: string };
const emptyRow = (): Row => ({ min: "", max: "", rate: "" });

// The four lengths customers can pick, as ranges of days with no gaps between them: 1-90 days is the 3-month rate, 91-180 the 6-month rate, 181-270 the
// 9-month rate and 271-365 the 12-month rate. A length outside every range has no rate and cannot be bought. Only the rate is left to type.
const DEFAULT_RANGES = [
  { label: "3 months", min: "1", max: "90" },
  { label: "6 months", min: "91", max: "180" },
  { label: "9 months", min: "181", max: "270" },
  { label: "12 months", min: "271", max: "365" },
];
const defaultRows = (): Row[] => DEFAULT_RANGES.map((d) => ({ ...d, rate: "" }));

const input =
  "w-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]";

const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

const CreateRates = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "";
  const service = useMemo(() => new ManageRatesService(token), [token]);

  const [savingsType, setSavingsType] = useState("SmartLock");
  const [mode, setMode] = useState<"ANY" | "RANGES">("RANGES");
  const [anyRate, setAnyRate] = useState("");
  const [rows, setRows] = useState<Row[]>(defaultRows());
  const [saving, setSaving] = useState(false);

  const product = PRODUCTS.find((p) => p.value === savingsType) ?? PRODUCTS[0];

  // A new rate always starts empty: no value is carried over from the rates that are active now. For ranges the four durations are already there; only the rates are typed.
  useEffect(() => {
    setAnyRate("");
    setRows(defaultRows());
    if (!product.tenors) setMode("ANY");
  }, [savingsType, mode, product.tenors]);

  const setRow = (i: number, patch: Partial<Row>) => setRows((prev) => prev.map((r, k) => (k === i ? { ...r, ...patch } : r)));

  const complete = rows.every((r) => !Number.isNaN(num(r.min)) && !Number.isNaN(num(r.max)) && !Number.isNaN(num(r.rate)));

  // Plain-language problems with the rows, so they are seen before the server is asked.
  const problem = useMemo(() => {
    if (mode === "ANY") {
      const rate = num(anyRate);
      return Number.isNaN(rate) ? "Enter the rate." : rate < 0 || rate > 100 ? "The rate must be between 0 and 100." : "";
    }
    if (!complete) return "Fill in the first day, the last day and the rate of every range.";
    for (let i = 0; i < rows.length; i++) {
      const [min, max, rate] = [num(rows[i].min), num(rows[i].max), num(rows[i].rate)];
      if (min < 1) return `Range ${i + 1} must start at day 1 or later.`;
      if (min > max) return `Range ${i + 1}: the first day cannot be after the last day.`;
      if (rate < 0 || rate > 100) return `Range ${i + 1}: the rate must be between 0 and 100.`;
      for (let k = 0; k < i; k++) {
        if (min <= num(rows[k].max) && num(rows[k].min) <= max) return `Ranges ${k + 1} and ${i + 1} overlap.`;
      }
    }
    return "";
  }, [mode, anyRate, rows, complete]);

  // Which standard durations the ranges cover. A duration with no rate cannot be bought by a customer.
  const coverage = useMemo(() => {
    // Coverage depends on the days only; a rate that has not been typed yet does not make a duration "not covered".
    const valid = mode === "RANGES" ? rows.map((r) => ({ min: num(r.min), max: num(r.max), rate: num(r.rate) })).filter((r) => !Number.isNaN(r.min) && !Number.isNaN(r.max)) : [];
    return DURATIONS.map((d) => {
      if (mode === "ANY") return { ...d, covered: true, text: "covered" };
      const hits = new Set<number>();
      let all = valid.length > 0;
      for (let day = d.from; day <= d.to; day++) {
        const hit = valid.findIndex((r) => r.min <= day && day <= r.max);
        if (hit < 0) all = false;
        else hits.add(hit);
      }
      const rates = [...hits].map((h) => valid[h].rate).filter((r) => !Number.isNaN(r)).map((r) => `${r}%`).join(" / ");
      return { ...d, covered: all, text: all ? (rates ? `covered (${rates})` : "covered") : "not covered" };
    });
  }, [mode, rows]);

  const submit = async () => {
    if (problem) {
      toast.error(problem);
      return;
    }
    setSaving(true);
    try {
      const body = await service.submitRequest({
        savingsType,
        mode,
        items:
          mode === "ANY"
            ? [{ annualRate: num(anyRate) }]
            : rows.map((r) => ({ minTenorDays: num(r.min), maxTenorDays: num(r.max), annualRate: num(r.rate) })),
      });
      toast.success(body?.message ?? "Submitted for approval");
      navigate("/interestRates", { state: { tab: "requests" } });
    } catch (error) {
      toast.error(error instanceof AxiosError ? error.response?.data?.message || "Could not submit the rates" : "Could not submit the rates");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <div className="flex flex-col gap-4 min-h-screen">
        <div className="flex justify-between items-center">
          <Backbutton />
          <div></div>
        </div>
        <div className="bg-white rounded-md w-[100%] p-4 space-y-5">
          <h1 className="font-bold text-lg">Interest Rates</h1>

          <p className="text-xs text-gray-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            What you save here is sent for approval. Nothing changes for customers until someone else approves it. When it is approved, it replaces the rates that are
            active now for this product, so enter the full set.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" htmlFor="rate-product">Investment Type</label>
              <select id="rate-product" value={savingsType} onChange={(e) => setSavingsType(e.target.value)} className={input}>
                {PRODUCTS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            {product.tenors && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold" htmlFor="rate-mode">Applies to</label>
                <select id="rate-mode" value={mode} onChange={(e) => setMode(e.target.value as "ANY" | "RANGES")} className={input}>
                  <option value="ANY">Any tenor (one rate for every length)</option>
                  <option value="RANGES">Ranges of days (a rate for each range)</option>
                </select>
              </div>
            )}
          </div>

          {mode === "ANY" ? (
            <div className="flex flex-col gap-1 md:w-1/2">
              <label className="text-xs font-semibold" htmlFor="rate-any">Annual Rate (%)</label>
              <input id="rate-any" type="number" min={0} max={100} step="0.01" value={anyRate} onChange={(e) => setAnyRate(e.target.value)} className={input} placeholder="e.g., 18" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="hidden md:grid grid-cols-[6rem_1fr_1fr_1fr_auto] gap-3 text-xs font-semibold">
                <span>Duration</span>
                <span>From (days)</span>
                <span>To (days)</span>
                <span>Annual Rate (%)</span>
                <span className="w-16" />
              </div>
              {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[6rem_1fr_1fr_1fr_auto] gap-3 items-center">
                  <span className="text-sm font-semibold text-gray-700">{r.label ?? "Other"}</span>
                  <input aria-label={`Range ${i + 1} from (days)`} type="number" min={1} value={r.min} onChange={(e) => setRow(i, { min: e.target.value })} className={input} placeholder="From, e.g., 85" />
                  <input aria-label={`Range ${i + 1} to (days)`} type="number" min={1} value={r.max} onChange={(e) => setRow(i, { max: e.target.value })} className={input} placeholder="To, e.g., 95" />
                  <input aria-label={`Range ${i + 1} rate (%)`} type="number" min={0} max={100} step="0.01" value={r.rate} onChange={(e) => setRow(i, { rate: e.target.value })} className={input} placeholder="Rate %" />
                  <button
                    type="button"
                    onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((_, k) => k !== i) : prev))}
                    disabled={rows.length === 1}
                    className="w-16 text-xs text-red-600 disabled:opacity-30"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setRows((prev) => [...prev, emptyRow()])} className="text-xs font-semibold text-[#7C2EBF]">
                + Add another range
              </button>
              <p className="text-[11px] text-gray-500">
                A plan gets the rate of the range its length in days falls in (both ends included). The web offers 90, 180, 270 and 365 days: 1 to 90 days is the 3-month
                rate, 91 to 180 the 6-month rate, 181 to 270 the 9-month rate and 271 to 365 the 12-month rate. Ranges must not overlap.
              </p>
              <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs font-semibold text-amber-900">
                Note: payout can only happen at 90, 180, 270 and 365 days.
              </p>

              <div className="border rounded-md p-3 space-y-1">
                <p className="text-xs font-semibold">What customers can choose</p>
                {coverage.map((c) => (
                  <p key={c.label} className={`text-xs ${c.covered ? "text-green-700" : "text-amber-700"}`}>
                    {c.covered ? "✓" : "⚠"} {c.label} ({c.from === c.to ? c.from : `${c.from}-${c.to}`} days): {c.text}
                  </p>
                ))}
                {coverage.some((c) => !c.covered) && (
                  <p className="text-[11px] text-gray-500">
                    A duration that is not covered has no rate, so customers cannot start a plan of that length. You can still save if that is what you want.
                  </p>
                )}
              </div>
            </div>
          )}

          {problem && <p className="text-xs text-red-600">{problem}</p>}

          <button
            type="button"
            onClick={submit}
            disabled={saving || !!problem}
            className="text-xs bg-[#7C2EBF] text-white rounded-md px-5 py-3 disabled:opacity-40"
          >
            {saving ? "Submitting..." : "Submit for approval"}
          </button>
        </div>
      </div>
    </Container>
  );
};

export default CreateRates;
