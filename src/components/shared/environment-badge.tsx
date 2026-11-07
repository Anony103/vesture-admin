import { ENVIRONMENT, ENVIRONMENT_STYLES } from "@/constants/environment";

/** Says which backend this admin is connected to (LOCAL, STAGING or LIVE). */
export const EnvironmentBadge = ({ className = "" }: { className?: string }) => (
  <span
    title={`Connected to ${ENVIRONMENT.host || "an unknown backend"}`}
    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide ${ENVIRONMENT_STYLES[ENVIRONMENT.kind]} ${className}`}
  >
    {ENVIRONMENT.label}
  </span>
);
