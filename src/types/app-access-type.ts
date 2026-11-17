export type AppAccess = {
  web: boolean;
  mobile: boolean;
  /** Waitlist mode: the web's landing page stays up, its other pages send visitors to the waitlist, and web logins are refused. */
  waitlist: boolean;
  /** What customers are told while an app is off; empty means the default is used. */
  message: string;
  defaultMessage: string;
  maxMessageLength: number;
};

export type AppAccessPayload = {
  web: boolean;
  mobile: boolean;
  waitlist: boolean;
  message: string;
};

export type WebTesters = {
  /** Emails and phone numbers (+234...) allowed to keep signing in to the web while Waitlist mode is on. */
  testers: string[];
  max: number;
};
