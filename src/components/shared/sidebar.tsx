import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { EnvironmentBadge } from "@/components/shared/environment-badge";
import { SIDEBAR_WIDTH, isItemActive, useNavGroups } from "@/components/shared/nav-config";
import { useTheme } from "@/hooks/use-theme";

type Props = {
  /** wide, with labels; otherwise the narrow icon rail */
  expanded: boolean;
  /** a wide screen: the sidebar takes its own space. On a phone it floats over the page when expanded. */
  isDesktop: boolean;
  onToggle: () => void;
  /** called after a link is tapped (the layout closes the phone drawer) */
  onNavigate: () => void;
};

/** The brand mark used when the sidebar is the narrow rail. */
const LogoMark = () => (
  <span
    aria-hidden
    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand/60 font-display text-lg font-bold text-white shadow-[var(--glow-brand)]"
  >
    V
  </span>
);

export const Sidebar: React.FC<Props> = ({ expanded, isDesktop, onToggle, onNavigate }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const groups = useNavGroups();
  const { theme } = useTheme();

  const logout = () => {
    navigate("/auth");
    sessionStorage.clear();
  };

  const ToggleIcon = expanded ? PanelLeftClose : PanelLeftOpen;
  const toggleLabel = isDesktop
    ? expanded
      ? "Collapse sidebar"
      : "Expand sidebar"
    : expanded
      ? "Close menu"
      : "Open menu";

  return (
    <aside
      aria-label="Main navigation"
      style={{ width: expanded ? SIDEBAR_WIDTH.expanded : SIDEBAR_WIDTH.rail }}
      className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-deck transition-[width] duration-300 ease-out"
    >
      {/* brand + collapse */}
      <div className={`flex h-16 shrink-0 items-center ${expanded ? "justify-between px-4" : "justify-center"}`}>
        {expanded ? (
          <span className="flex min-w-0 items-center gap-2">
            {/* the logo file has light lettering; the light theme gets the dark-lettered one */}
            <img
              src={theme === "light" ? "/vesture-logo-dark.png" : "/vesture-logo.png"}
              alt="Vesture"
              className="h-7 w-auto"
            />
            <EnvironmentBadge />
          </span>
        ) : (
          <button type="button" onClick={onToggle} aria-label={toggleLabel} title={toggleLabel} className="rounded-xl">
            <LogoMark />
          </button>
        )}
        {expanded && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={toggleLabel}
            title={toggleLabel}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-fg3 transition-colors hover:bg-panel-hi hover:text-fg"
          >
            <ToggleIcon size={18} />
          </button>
        )}
      </div>

      {/* links */}
      <nav className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3">
        {groups.map((group, groupIndex) => (
          <div key={group.label} className={groupIndex === 0 ? "" : "mt-4"}>
            {expanded ? (
              <p className="v-eyebrow px-3 pb-1.5">{group.label}</p>
            ) : (
              groupIndex > 0 && <div className="mx-3 mb-3 h-px bg-line" />
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isItemActive(item, pathname);
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.path}
                      onClick={onNavigate}
                      title={expanded ? undefined : item.title}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex h-10 items-center gap-3 rounded-xl text-[13px] font-medium transition-colors ${
                        expanded ? "px-3" : "justify-center"
                      } ${
                        active
                          ? "bg-brand/15 text-fg shadow-[inset_0_0_0_1px_rgb(var(--brand-rgb)/0.3)]"
                          : "text-fg2 hover:bg-panel-hi hover:text-fg"
                      }`}
                    >
                      {active && (
                        <span
                          aria-hidden
                          className="absolute -left-3 top-2 bottom-2 w-[3px] rounded-r-full bg-brand shadow-[0_0_12px_rgb(var(--brand-rgb)/0.9)]"
                        />
                      )}
                      <Icon size={18} className={`shrink-0 ${active ? "text-brand" : ""}`} strokeWidth={active ? 2.2 : 1.9} />
                      {expanded && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* log out */}
      <div className="shrink-0 border-t border-line p-3">
        <button
          type="button"
          onClick={logout}
          title={expanded ? undefined : "Log out"}
          className={`flex h-10 w-full items-center gap-3 rounded-xl text-[13px] font-medium text-fg2 transition-colors hover:bg-danger/10 hover:text-danger ${
            expanded ? "px-3" : "justify-center"
          }`}
        >
          <LogOut size={18} className="shrink-0" strokeWidth={1.9} />
          {expanded && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
};
