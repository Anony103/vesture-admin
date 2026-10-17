import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { SESSION_STORAGE_KEY } from "@/constants";
import { LedgerService, errorText } from "@/services/ledger-service";

export type Row = Record<string, unknown>;

export const money = (v: unknown) =>
  `₦${Number(v ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const when = (v: unknown) => (v ? new Date(String(v)).toLocaleString() : "-");

export const text = (v: unknown) => (v === null || v === undefined || v === "" ? "-" : String(v));

export function useLedgerService() {
  return useMemo(() => new LedgerService(sessionStorage.getItem(SESSION_STORAGE_KEY) ?? ""), []);
}

type Roles = { isSuperAdmin: boolean; isAdmin: boolean; username?: string };
let rolesRequest: Promise<Roles> | null = null;

/** What the signed-in admin may do, as the server reports it (the server still enforces every action). */
export function useAdminRoles(): Roles {
  const ledger = useLedgerService();
  const [roles, setRoles] = useState<Roles>({ isSuperAdmin: false, isAdmin: false });
  useEffect(() => {
    rolesRequest ??= ledger.status().then((r) => {
      const you = (r.data.you ?? {}) as { superAdmin?: boolean; admin?: boolean; username?: string };
      return { isSuperAdmin: !!you.superAdmin, isAdmin: !!you.admin, username: you.username };
    });
    rolesRequest.then(setRoles).catch(() => { rolesRequest = null; });
  }, [ledger]);
  return roles;
}

/** Loads something from the ledger and lets the screen reload it. */
export function useLoad<T>(load: () => Promise<{ data: T }>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(() => {
    setLoading(true);
    setError(null);
    load()
      .then((r) => setData(r.data))
      .catch((e) => setError(errorText(e)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(run, [run]);
  return { data, loading, error, reload: run };
}

/** Runs an action, shows the server's message either way, and calls onDone on success. */
export function useAction() {
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<{ message?: string }>, onDone?: () => void) => {
    setBusy(true);
    try {
      const result = await action();
      toast.success(result?.message || "Done");
      onDone?.();
    } catch (e) {
      toast.error(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

export function Card({ title, children, action }: { title?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="bg-white rounded-md p-5 mb-4">
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="text-sm font-semibold text-gray-800">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Tile({ label, value, tone = "neutral", hint }: { label: string; value: ReactNode; tone?: "neutral" | "good" | "bad" | "warn"; hint?: string }) {
  const color = { neutral: "text-gray-900", good: "text-green-700", bad: "text-red-600", warn: "text-amber-600" }[tone];
  return (
    <div className="bg-white rounded-md p-4 min-w-[150px] flex-1">
      <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-xl font-semibold mt-1 ${color}`}>{value}</p>
      {hint && <p className="text-[11px] text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "bad" | "warn" }) {
  const color = { neutral: "bg-gray-100 text-gray-700", good: "bg-green-100 text-green-700", bad: "bg-red-100 text-red-700", warn: "bg-amber-100 text-amber-700" }[tone];
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${color}`}>{children}</span>;
}

export function Table({ headers, rows, empty = "Nothing to show" }: { headers: string[]; rows: ReactNode[][]; empty?: string }) {
  if (rows.length === 0) return <p className="text-xs text-gray-500 py-3">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            {headers.map((h, i) => (
              <th key={`${h}-${i}`} className="py-2 pr-4 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0 align-top">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pager({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center gap-3 justify-end mt-3 text-xs">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="px-3 py-1 rounded border disabled:opacity-40">Previous</button>
      <span>Page {page} of {totalPages}</span>
      <button disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="px-3 py-1 rounded border disabled:opacity-40">Next</button>
    </div>
  );
}

export const inputClass = "bg-white text-gray-900 border border-gray-300 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#7C2EBF] w-full";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs text-gray-600">
      <span className="block mb-1">{label}</span>
      {children}
    </label>
  );
}

export function PrimaryButton({ children, onClick, disabled, tone = "purple", type = "button" }: { children: ReactNode; onClick?: () => void; disabled?: boolean; tone?: "purple" | "light" | "danger"; type?: "button" | "submit" }) {
  const color = { purple: "bg-[#7C2EBF] text-white", light: "bg-[#E2CEF3] text-[#7C2EBF]", danger: "bg-red-600 text-white" }[tone];
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`text-xs py-2 px-4 rounded-md disabled:opacity-50 ${color}`}>
      {children}
    </button>
  );
}

export function Loading({ loading, error, children }: { loading: boolean; error: string | null; children: ReactNode }) {
  if (loading) return <p className="text-xs text-gray-500 py-6">Loading…</p>;
  if (error) return <p className="text-xs text-red-600 py-6">{error}</p>;
  return <>{children}</>;
}
