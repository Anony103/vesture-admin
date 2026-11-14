/** What the server answers after a bulk upload (staff data, credit entries, assets). */
export type UploadResult = {
  totalRecords: number;
  successCount: number;
  failedCount: number;
  /** staff data only: existing records the sheet replaced */
  replacedCount?: number;
  /** one "Row N: reason" line for each row that failed */
  errors: string[];
  /** the file the admin chose, kept for the title and the failed-rows download */
  fileName?: string;
};

/** The answer's envelope, as the upload services type it. */
export type UploadResponse = {
  message: string;
  result: string;
  status: string;
  code: number;
  data?: UploadResult;
};
