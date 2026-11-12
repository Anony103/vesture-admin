import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Moon, Search, Sun } from "lucide-react";
import { useIdleTimer } from "react-idle-timer";
import { toast } from "react-toastify";
import { Sidebar } from "../components/shared/sidebar";
import { Container } from "../components/shared/container";
import { SIDEBAR_WIDTH, isItemActive, useNavGroups } from "../components/shared/nav-config";
import { useUser } from "../hooks";
import { useTheme } from "@/hooks/use-theme";
import { useAppContext } from "@/context/AppContext";
import { EnvironmentBadge } from "@/components/shared/environment-badge";
import { ENVIRONMENT } from "@/constants/environment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DESKTOP_QUERY = "(min-width: 768px)";
const SIDEBAR_KEY = "vesture-admin-sidebar";

/** True on a wide screen. Falls back to wide when the browser cannot say. */
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" && window.matchMedia ? window.matchMedia(DESKTOP_QUERY).matches : true
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
};

const readCollapsed = (): boolean => {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === "collapsed";
  } catch {
    return false;
  }
};

export const MainLayout = () => {
  const { user } = useUser();
  const { searchTerm, handleSearchChange } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const groups = useNavGroups();
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  // On a wide screen the sidebar is wide unless the admin collapsed it (remembered). On a phone it is the narrow rail and
  // opens over the page when asked.
  const [desktopCollapsed, setDesktopCollapsed] = useState(readCollapsed);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const expanded = isDesktop ? !desktopCollapsed : phoneOpen;
  const overlay = !isDesktop && phoneOpen;

  const toggleSidebar = useCallback(() => {
    if (isDesktop) {
      setDesktopCollapsed((collapsed) => {
        try {
          localStorage.setItem(SIDEBAR_KEY, collapsed ? "expanded" : "collapsed");
        } catch {
          // storage blocked: the choice lasts for this visit only
        }
        return !collapsed;
      });
    } else {
      setPhoneOpen((open) => !open);
    }
  }, [isDesktop]);

  const closePhoneDrawer = useCallback(() => setPhoneOpen(false), []);

  // Escape closes the phone drawer; so does growing the window to desktop size
  useEffect(() => {
    if (!overlay) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPhoneOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlay]);
  useEffect(() => {
    if (isDesktop) setPhoneOpen(false);
  }, [isDesktop]);

  // the tab says which backend it is on, so several tabs can be told apart
  useEffect(() => {
    const base = document.title.replace(/^\[[^\]]*\]\s*/, "");
    document.title = `[${ENVIRONMENT.label}] ${base}`;
  }, []);

  useIdleTimer({
    timeout: 1000 * 60 * 5,
    onIdle: () => {
      toast.warn("Logged out due to inactivity");
      navigate("/auth");
      sessionStorage.clear();
    },
  });

  const current = groups
    .flatMap((group) => group.items.map((item) => ({ item, group: group.label })))
    .find(({ item }) => isItemActive(item, location.pathname));

  const logout = () => {
    navigate("/auth");
    sessionStorage.clear();
  };

  const username = user?.username ?? "";
  const initials = (username.trim().slice(0, 2) || "VA").toUpperCase();
  const sidebarWidth = isDesktop && expanded ? SIDEBAR_WIDTH.expanded : SIDEBAR_WIDTH.rail;

  return (
    <div className="min-h-screen">
      <Sidebar expanded={expanded} isDesktop={isDesktop} onToggle={toggleSidebar} onNavigate={closePhoneDrawer} />

      {/* the dim layer behind the phone drawer */}
      {overlay && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closePhoneDrawer}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px]"
        />
      )}

      <div style={{ marginLeft: sidebarWidth }} className="min-h-screen transition-[margin] duration-300 ease-out">
        <header className="sticky top-0 z-20 border-b border-line bg-[var(--topbar)] backdrop-blur-xl">
          <Container>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 md:h-16 md:flex-nowrap md:py-0">
              <div className="min-w-0 flex-1 md:flex-none md:basis-56">
                {current && <p className="v-eyebrow truncate">{current.group}</p>}
                <h1 className="truncate font-display text-lg font-semibold leading-tight md:text-xl">
                  {current?.item.title ?? "Vesture Admin"}
                </h1>
              </div>

              {/* search: second row on a phone, in the bar on a wide screen */}
              <label className="relative order-last w-full md:order-none md:max-w-md md:flex-1">
                <span className="sr-only">Search</span>
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg3"
                  aria-hidden
                />
                <input
                  className="h-10 w-full rounded-xl border border-line bg-field pl-9 pr-3 text-sm text-fg placeholder:text-fg3 transition-colors focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/25"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </label>

              <div className="flex items-center gap-2 md:ml-auto">
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex h-10 items-center gap-2 rounded-xl border border-line bg-panel pl-1 pr-2 transition-colors hover:bg-panel-hi md:pr-3"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-brand/55 text-xs font-bold text-white">
                        {initials}
                      </span>
                      <span className="hidden min-w-0 text-left md:block">
                        <span className="block max-w-[140px] truncate text-xs font-semibold leading-tight">{username}</span>
                        <span className="block max-w-[140px] truncate text-[11px] leading-tight text-fg3">{user?.email}</span>
                      </span>
                      <ChevronDown size={14} className="text-fg3" aria-hidden />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <span className="block truncate text-sm font-semibold">{username}</span>
                      <span className="block truncate text-xs text-fg3">{user?.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={logout} className="cursor-pointer gap-2 text-danger focus:text-danger">
                      <LogOut size={14} /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Container>
        </header>

        <main className="min-h-screen pb-10 pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
