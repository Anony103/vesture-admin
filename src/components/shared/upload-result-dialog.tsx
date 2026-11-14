import { Box, Modal } from "@mui/material";
import { CheckCircle2, Download, TriangleAlert, X } from "lucide-react";
import { StatCard } from "./stat-card";
import { modalSlotProps, modalSx } from "./modal-style";
import type { UploadResult } from "@/types/upload-result";

/** How many failed rows are listed on screen; the download has them all. */
const SHOWN = 200;

const splitError = (line: string) => {
  const match = /^Row (\d+):\s*(.*)$/.exec(line);
  return match ? { row: match[1], reason: match[2] } : { row: "", reason: line };
};

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

/** The failed rows as a spreadsheet the admin can open, fix and upload again. */
const downloadFailed = (result: UploadResult) => {
  const lines = ["Row,Reason", ...result.errors.map((line) => {
    const { row, reason } = splitError(line);
    return `${csvCell(row)},${csvCell(reason)}`;
  })];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `failed-rows-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

type Props = {
  /** nothing is shown while this is null */
  result: UploadResult | null;
  onClose: () => void;
  /** what was uploaded, e.g. "Staff data" */
  subject?: string;
};

/** The result of a bulk upload: how many rows were in the file, how many went in, and which ones failed and why. */
export const UploadResultDialog = ({ result, onClose, subject = "Upload" }: Props) => {
  if (!result) return null;
  const { totalRecords, successCount, failedCount, errors } = result;
  const allWent = failedCount === 0 && successCount > 0;
  const nothingWent = successCount === 0;
  const headline = allWent
    ? "Every row was uploaded"
    : nothingWent
      ? "No rows were uploaded"
      : "Uploaded with some failed rows";

  return (
    <Modal open onClose={onClose} slotProps={modalSlotProps}>
      <Box sx={modalSx(560)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className={nothingWent ? "text-danger" : allWent ? "text-mint" : "text-gold"}>
              {allWent ? <CheckCircle2 size={22} /> : <TriangleAlert size={22} />}
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold leading-tight">{headline}</h2>
              <p className="mt-0.5 truncate text-xs text-fg3">
                {subject}
                {result.fileName ? ` · ${result.fileName}` : ""}
              </p>
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-1 text-fg3 hover:bg-panel-hi hover:text-fg">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatCard label="Total rows" value={totalRecords} tone="brand" />
          <StatCard label="Successful" value={successCount} tone="mint" />
          <StatCard label="Failed" value={failedCount} tone={failedCount > 0 ? "danger" : "neutral"} />
        </div>

        {result.replacedCount ? (
          <p className="mt-3 text-xs text-fg3">
            {result.replacedCount.toLocaleString()} existing record{result.replacedCount === 1 ? "" : "s"} replaced by this file.
          </p>
        ) : null}

        {failedCount > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="v-eyebrow">Failed rows</p>
              <button type="button" className="v-btn v-btn-ghost v-btn-sm" onClick={() => downloadFailed(result)}>
                <Download size={14} /> Download failed rows
              </button>
            </div>
            <ul className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-line bg-field p-2 text-xs">
              {errors.slice(0, SHOWN).map((line, index) => {
                const { row, reason } = splitError(line);
                return (
                  <li key={index} className="flex gap-2 rounded-lg px-2 py-1.5">
                    {row && <span className="v-chip v-chip-bad shrink-0">Row {row}</span>}
                    <span className="min-w-0 break-words text-fg2">{reason}</span>
                  </li>
                );
              })}
              {errors.length > SHOWN && (
                <li className="px-2 py-1.5 text-fg3">and {errors.length - SHOWN} more: download the file to see them all.</li>
              )}
            </ul>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <button type="button" className="v-btn v-btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </Box>
    </Modal>
  );
};
