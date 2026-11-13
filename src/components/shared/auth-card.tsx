import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** shown under the form, e.g. a link back to the login page */
  footer?: ReactNode;
};

/** The heading, form area and footer of a sign-in style page; AuthLayout supplies everything around it. */
export const AuthCard = ({ title, subtitle, children, footer }: Props) => (
  <div className="v-rise">
    <h1 className="font-display text-3xl font-semibold leading-tight">{title}</h1>
    {subtitle && <p className="mt-2 text-sm text-fg2">{subtitle}</p>}
    <div className="mt-8">{children}</div>
    {footer && <div className="mt-6 text-center text-sm text-fg2">{footer}</div>}
  </div>
);
