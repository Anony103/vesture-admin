// The backend names its products "Save-Small-Small" and "Target-Savings"; staff and customers know them as SmallVest and Target Lock.
export const productLabel = (name?: string | null) =>
  (name ?? "")
    .replace(/save[- ]small[- ]small/gi, "SmallVest")
    .replace(/target[- ]savings/gi, "Target Lock");
