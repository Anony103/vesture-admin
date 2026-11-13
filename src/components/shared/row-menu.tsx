import { MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type RowMenuItem = {
  label: string;
  /** what to do when it is chosen */
  onSelect?: () => void;
  /** go to this address instead (relative to the page, like a Link) */
  to?: string;
  disabled?: boolean;
  /** shown in red, for things that cannot be undone or switch something off */
  danger?: boolean;
  /** leave the item out (handy for "only when ..." items) */
  hidden?: boolean;
  /** a line above this item */
  separated?: boolean;
};

/**
 * The "..." menu at the end of a table row. It opens in a layer above the page, so it is never cut off by the table's own scrolling
 * the way a menu drawn inside the table would be.
 */
export const RowMenu = ({ items, label = "Row actions" }: { items: RowMenuItem[]; label?: string }) => {
  const navigate = useNavigate();
  const shown = items.filter((item) => !item.hidden);
  if (shown.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="grid h-8 w-8 place-items-center rounded-lg text-fg3 transition-colors hover:bg-panel-hi hover:text-fg data-[state=open]:bg-panel-hi data-[state=open]:text-fg"
        >
          <MoreVertical size={17} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52 rounded-xl border-line-hi p-1.5 shadow-xl">
        {shown.map((item, index) => (
          <div key={item.label}>
            {item.separated && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              disabled={item.disabled}
              onSelect={() => (item.to ? navigate(item.to) : item.onSelect?.())}
              className={`cursor-pointer rounded-lg px-3 py-2 text-sm ${item.danger ? "text-danger focus:text-danger" : ""}`}
            >
              {item.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
