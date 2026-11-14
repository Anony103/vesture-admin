export type NetPayLimitView = {
  /** The share of net pay a public-sector customer may commit per month, as a percentage (30 = 30%). */
  percent: number;
  updatedBy: string | null;
  updatedOn: string | null;
};
