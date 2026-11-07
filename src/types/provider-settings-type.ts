export type ProviderOption = {
  name: string;
  label: string;
  /** False when the server has no login details for it, so it would be skipped. */
  configured: boolean;
};

export type ProviderKindView = {
  /** First choice first. */
  order: string[];
  available: ProviderOption[];
};

export type ProviderSettingsView = {
  bvn: ProviderKindView;
  sms: ProviderKindView;
};

export type ProviderKind = "BVN" | "SMS";
