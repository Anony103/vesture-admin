import { Check, Copy } from "lucide-react";
import { useState } from "react";

/** A reference or id that copies to the clipboard when clicked. Falls back to plain text if copying is not allowed. */
export const CopyText = ({ value, className = "" }: { value?: string | null; className?: string }) => {
  const [copied, setCopied] = useState(false);
  if (!value) return <span>-</span>;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // clipboard blocked (an insecure page, a locked-down browser): the text can still be selected by hand
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copied" : "Click to copy"}
      className={`group inline-flex max-w-full items-center gap-1.5 text-left ${className}`}
    >
      <span className="v-mono truncate text-xs">{value}</span>
      {copied ? (
        <Check size={13} className="shrink-0 text-mint" />
      ) : (
        <Copy size={13} className="shrink-0 text-fg3 opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
};
