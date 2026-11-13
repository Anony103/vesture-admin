import { useRef } from "react";
import { Outlet } from "react-router";
import { Activity, Moon, ShieldCheck, Sun, Users } from "lucide-react";
import { EnvironmentBadge } from "@/components/shared/environment-badge";
import { useTheme } from "@/hooks/use-theme";

const POINTS = [
  { icon: Users, title: "Customers and KYC", text: "Review identity checks and manage every customer account." },
  { icon: Activity, title: "Money in motion", text: "Follow deposits, payouts and webhooks as they happen." },
  { icon: ShieldCheck, title: "Accountable by design", text: "Role-based access and an audit trail for every change." },
];

/** Rings that turn at different speeds, each with a glowing node riding it. Purely decorative. */
const RINGS = [
  { inset: "0%", seconds: 90, node: "var(--brand)" },
  { inset: "17%", seconds: 60, node: "var(--mint)" },
  { inset: "34%", seconds: 40, node: "rgb(var(--sky-rgb))" },
];

/** Sign-in pages: an animated brand panel on wide screens and the form beside it. */
export const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const logo = theme === "light" ? "/vesture-logo-dark.png" : "/vesture-logo.png";
  const formSide = useRef<HTMLElement>(null);

  // the light behind the form follows the pointer; set as CSS variables so nothing re-renders
  const follow = (event: React.PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - box.top}px`);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* brand panel (wide screens only) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-line bg-deck p-12 lg:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="v-blob -left-24 -top-24 h-[420px] w-[420px] bg-brand/35" style={{ animation: "v-drift-a 18s ease-in-out infinite" }} />
          <div className="v-blob -bottom-32 left-1/3 h-[380px] w-[380px] bg-mint/20" style={{ animation: "v-drift-b 22s ease-in-out infinite" }} />
          <div className="v-blob right-0 top-1/3 h-[300px] w-[300px] " style={{ animation: "v-drift-c 26s ease-in-out infinite", backgroundColor: "rgb(var(--sky-rgb) / 0.16)" }} />
          <div
            className="v-grid-pan absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse at 30% 30%, #000 20%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at 30% 30%, #000 20%, transparent 75%)",
            }}
          />
          {/* the orbit sits low and to the right, partly off the panel */}
          <div className="absolute -bottom-52 -right-52 h-[640px] w-[640px]">
            {RINGS.map((ring) => (
              <div
                key={ring.inset}
                className="v-orbit"
                style={{ inset: ring.inset, animation: `v-spin ${ring.seconds}s linear infinite`, ["--node" as string]: ring.node }}
              >
                <i />
              </div>
            ))}
            <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand/50 font-display text-2xl font-bold text-white shadow-[var(--glow-brand)]">
              V
            </span>
          </div>
        </div>

        <img src={logo} alt="Vesture" className="relative h-9 w-auto self-start" />

        <div className="relative max-w-md">
          <h2 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight">
            One control room for <span className="v-gradient-text">everything Vesture.</span>
          </h2>
          <ul className="mt-10 space-y-3">
            {POINTS.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className="v-rise glass group flex gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40"
                style={{ animationDelay: `${200 + index * 110}ms`, borderRadius: "1rem" }}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-brand/30 bg-brand/15 text-brand transition-transform duration-300 group-hover:scale-110">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="mt-0.5 block text-sm text-fg2">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-fg3">© {new Date().getFullYear()} Vesture. Authorised staff only.</p>
      </aside>

      {/* form side */}
      <main ref={formSide} onPointerMove={follow} className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-16">
        <div aria-hidden className="v-spot" />

        <div className="absolute right-5 top-5 z-10 flex items-center gap-2">
          <EnvironmentBadge />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-panel text-fg2 transition-colors hover:bg-panel-hi hover:text-fg"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        <div className="relative z-[1] w-full max-w-[420px]">
          {/* the brand panel is hidden on a phone, so the logo moves here */}
          <img src={logo} alt="Vesture" className="mb-8 h-8 w-auto lg:hidden" />
          <span className="v-chip v-chip-ok mb-5">
            <span className="v-live-dot" /> Staff sign-in
          </span>
          <div className="v-auth-card">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
