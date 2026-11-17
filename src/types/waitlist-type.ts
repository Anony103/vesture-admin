export type WaitlistEntry = {
  id: string;
  email: string;
  /** International form, e.g. +2348031234567. */
  phone: string;
  /** Product codes the person ticked (see WaitlistService.INTERESTS on the server). */
  interests: string[];
  note: string | null;
  source: string | null;
  createdOn: string;
};

export type WaitlistList = {
  content: WaitlistEntry[];
  totalPages: number;
  /** How many rows match the search. */
  totalElements: number;
  /** Everyone on the list, whatever the search. */
  total: number;
};

export type WaitlistApiResponse<T> = {
  code: number;
  status: string;
  message: string;
  data: T;
};
