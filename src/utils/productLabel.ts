// The backend names its products "Save-Small-Small", SAVE_SMALL_SMALL, "Target-Savings", TargetSavings and so on; staff and customers know them as
// SmallVest, Target Lock, Smart Lock and Buy Now Pay Later. Anything else is left as it is.
export const productLabel = (name?: string | null) =>
  (name ?? "")
    .replace(/save[-_ ]small[-_ ]small|^sss$/gi, "SmallVest")
    .replace(/target[-_ ]?savings/gi, "Target Lock")
    .replace(/^smart[-_ ]?lock$/gi, "Smart Lock")
    .replace(/buy[-_ ]now[-_ ]pay[-_ ]later|^bnpl$/gi, "Buy Now Pay Later");
