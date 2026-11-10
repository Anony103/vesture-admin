export type DepositFundingMethod = "TRANSFER" | "CHECKOUT" | "BOTH";

export type DepositFunding = {
  /** TRANSFER = customers send to their own account number; CHECKOUT = they pay on Flutterwave's page; BOTH = they choose. */
  method: DepositFundingMethod;
  available: DepositFundingMethod[];
  /** false when the server cannot make payment pages: Flutterwave's key or the return address is not set. */
  checkoutReady: boolean;
  updatedBy: string | null;
  updatedOn: string | null;
};
