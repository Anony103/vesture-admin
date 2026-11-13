import { ENVIRONMENT, ENVIRONMENT_STYLES } from "@/constants/environment";

/**
 * Says which backend this admin is connected to (TEST, DEVELOPMENT or STAGING), so a non-live copy is never mistaken for the real thing.
 * The live admin shows nothing: no badge is the normal state there.
 */
export const EnvironmentBadge = ({ className = "" }: { className?: string }) =>
  ENVIRONMENT.kind === "LIVE" ? null : (
  <span
    title={`Connected to ${ENVIRONMENT.host || "an unknown backend"}`}
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold leading-none tracking-[0.08em] ${ENVIRONMENT_STYLES[ENVIRONMENT.kind]} ${className}`}
  >
    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
    {ENVIRONMENT.label}
  </span>
);
