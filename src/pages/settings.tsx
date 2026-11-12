import { ReactElement, useState } from "react";
import { Container } from "../components/shared/container";
import { Clock, Eye, EyeOff, LockKeyhole, Package, PlugZap, Smartphone, Wallet, type LucideIcon } from "lucide-react";
import Button from "../components/shared/button";
import { Input } from "@/components/ui/input";
import useUpdatePassword from "@/hooks/use-update-password";
import useProviderSettings from "@/hooks/use-provider-settings";
import ProviderSettingsPanel from "@/components/provider-settings-panel";
import useAppAccess from "@/hooks/use-app-access";
import AppAccessPanel from "@/components/app-access-panel";
import useProductAvailability from "@/hooks/use-product-availability";
import ProductAvailabilityPanel from "@/components/product-availability-panel";
import useDepositFunding from "@/hooks/use-deposit-funding";
import DepositFundingPanel from "@/components/deposit-funding-panel";

const SECTION_ICONS: Record<string, LucideIcon> = {
  Security: LockKeyhole,
  "Auto Save": Clock,
  Providers: PlugZap,
  "App Access": Smartphone,
  Products: Package,
  "Deposit Funding": Wallet,
};

/** 1 -> "1am", 12 -> "12pm", 23 -> "11pm" */
const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;

// interface Props {
//     title:string
// }

function Settings(): ReactElement {
  const [showPassword, setShowPassword] = useState(false);
  // only a super admin is told the Providers tab exists
  const providerSettings = useProviderSettings();
  const appAccess = useAppAccess();
  const productAvailability = useProductAvailability();
  const depositFunding = useDepositFunding();
  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isLoading,
    handleSettingOptionsChange,
    settingOptions,
    handleSave,
    setHour,
    hour,
  } = useUpdatePassword();

  // only the sections this admin may use are listed
  const sections = [
    "Security",
    "Auto Save",
    ...(providerSettings.allowed ? ["Providers"] : []),
    ...(appAccess.allowed ? ["App Access"] : []),
    ...(productAvailability.allowed ? ["Products"] : []),
    ...(depositFunding.allowed ? ["Deposit Funding"] : []),
  ];

  const eye = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide passwords" : "Show passwords"}
      className="grid h-8 w-8 place-items-center rounded-lg text-fg3 transition-colors hover:bg-panel-hi hover:text-fg"
    >
      {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
    </button>
  );

  return (
    <Container>
      <article className="min-h-screen">
        <div className="grid gap-5 md:grid-cols-[250px_minmax(0,1fr)]">
          {/* SECTION MENU: a column on wide screens, a scrolling row on phones */}
          <nav aria-label="Settings sections" className="glass v-rise h-fit p-2">
            <ul className="no-scrollbar flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
              {sections.map((item) => {
                const Icon = SECTION_ICONS[item] ?? LockKeyhole;
                const active = settingOptions === item;
                return (
                  <li key={item} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSettingOptionsChange(item)}
                      aria-current={active ? "page" : undefined}
                      className={`flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        active
                          ? "bg-brand/15 text-fg shadow-[inset_0_0_0_1px_rgb(var(--brand-rgb)/0.3)]"
                          : "text-fg2 hover:bg-panel-hi hover:text-fg"
                      }`}
                    >
                      <Icon size={17} className={active ? "text-brand" : ""} />
                      {item}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* SECTION CONTENT */}
          <section className="glass v-rise min-w-0 p-6" style={{ animationDelay: "80ms" }}>
            {settingOptions === "Security" ? (
              <div className="max-w-2xl">
                <h2 className="font-display text-lg font-semibold">Update password</h2>
                <p className="mt-1 mb-6 text-sm text-fg2">Choose a new password for your admin account.</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid gap-x-4 gap-y-2 md:grid-cols-2">
                    <Input
                      label="Old Password"
                      placeholder="Enter old password"
                      type={showPassword ? "text" : "password"}
                      className="pr-11"
                      rightIcon={eye}
                      error={errors.oldPassword?.message}
                      {...register("oldPassword", {
                        required: "Old password is required",
                      })}
                    />
                    <Input
                      label="New Password"
                      placeholder="Enter new password"
                      type={showPassword ? "text" : "password"}
                      className="pr-11"
                      rightIcon={eye}
                      error={errors.newPassword?.message}
                      {...register("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 6,
                          message: "Minimum 6 characters",
                        },
                      })}
                    />
                    <div className="md:col-span-2">
                      <Input
                        label="Confirm Password"
                        placeholder="Re-enter new password"
                        type={showPassword ? "text" : "password"}
                        className="pr-11"
                        rightIcon={eye}
                        error={errors.confirmPassword?.message}
                        {...register("confirmPassword", {
                          required: "Please confirm your password",
                          validate: (value, formValues) =>
                            value === formValues.newPassword ||
                            "Passwords do not match",
                        })}
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="mt-6">
                    <Button
                      color="purple"
                      name="Update Password"
                      type="submit"
                      loading={isLoading}
                    />
                  </div>
                </form>
              </div>
            ) : null}
            {settingOptions === "Providers" ? <ProviderSettingsPanel /> : null}
            {settingOptions === "App Access" ? <AppAccessPanel /> : null}
            {settingOptions === "Products" ? <ProductAvailabilityPanel /> : null}
            {settingOptions === "Deposit Funding" ? <DepositFundingPanel /> : null}
            {settingOptions === "Auto Save" ? (
              <div className="max-w-2xl">
                <h2 className="font-display text-lg font-semibold">Auto-save debit time</h2>
                <p className="mt-1 mb-6 text-sm text-fg2">Choose the hour of the day when auto-save debits run.</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-end justify-between">
                      <label htmlFor="debit-hour" className="v-eyebrow">
                        Debit hour
                      </label>
                      <span className="v-mono font-display text-3xl font-semibold leading-none">{hourLabel(hour)}</span>
                    </div>

                    <input
                      id="debit-hour"
                      type="range"
                      min={1}
                      max={23}
                      step={1}
                      value={hour} // controlled by state
                      onChange={(e) => setHour(Number(e.target.value))} // update state
                      style={{
                        background: `linear-gradient(to right, rgb(var(--brand-rgb)) 0%, rgb(var(--brand-rgb)) ${
                          ((hour - 1) / 22) * 100
                        }%, var(--line-hi) ${((hour - 1) / 22) * 100}%, var(--line-hi) 100%)`,
                      }}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[rgb(var(--brand-rgb))]"
                    />

                    <div className="flex justify-between text-xs text-fg3">
                      <span>1am</span>
                      <span>12pm</span>
                      <span>11pm</span>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="mt-6">
                    <Button
                      color="purple"
                      name="Save"
                      type="button"
                      onClick={() => handleSave()}
                      loading={isLoading}
                    />
                  </div>
                </form>
              </div>
            ) : null}
          </section>
        </div>
      </article>
    </Container>
  );
}

export default Settings;
