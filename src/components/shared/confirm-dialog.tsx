import { Box, Modal } from "@mui/material";
import { TriangleAlert, X } from "lucide-react";
import { modalSlotProps, modalSx } from "./modal-style";

type Props = {
  /** nothing is shown while this is false */
  open: boolean;
  title: string;
  /** what will happen; plain text or a few lines of JSX */
  children: React.ReactNode;
  confirmLabel?: string;
  /** red button for something that cannot be undone */
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** An "are you sure?" pop-up in the admin's own look, used instead of the browser's alert box. */
export const ConfirmDialog = ({ open, title, children, confirmLabel = "Confirm", danger, busy, onConfirm, onCancel }: Props) => (
  <Modal open={open} onClose={busy ? undefined : onCancel} slotProps={modalSlotProps}>
    <Box sx={modalSx(440)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className={danger ? "text-danger" : "text-gold"}>
            <TriangleAlert size={22} />
          </span>
          <h2 className="font-display text-lg font-semibold leading-tight">{title}</h2>
        </div>
        <button type="button" aria-label="Close" onClick={onCancel} disabled={busy} className="rounded-lg p-1 text-fg3 hover:bg-panel-hi hover:text-fg">
          <X size={18} />
        </button>
      </div>
      <div className="mt-3 space-y-2 text-sm text-fg2">{children}</div>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="v-btn v-btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="button" className={`v-btn ${danger ? "v-btn-danger" : "v-btn-primary"}`} onClick={onConfirm} disabled={busy}>
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </Box>
  </Modal>
);
