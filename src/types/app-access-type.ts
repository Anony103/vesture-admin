export type AppAccess = {
  web: boolean;
  mobile: boolean;
  /** What customers are told while an app is off; empty means the default is used. */
  message: string;
  defaultMessage: string;
  maxMessageLength: number;
};

export type AppAccessPayload = {
  web: boolean;
  mobile: boolean;
  message: string;
};
