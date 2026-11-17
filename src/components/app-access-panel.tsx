import { useEffect, useState } from "react";
import Button from "./shared/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useAppAccess from "@/hooks/use-app-access";

const Toggle = ({
  label,
  help,
  on,
  onChange,
  onMeansCaution = false,
}: {
  label: string;
  help: string;
  on: boolean;
  onChange: (next: boolean) => void;
  /** true for a switch where "On" is the unusual state (the waitlist): it shows amber when on and grey when off, instead of green and red */
  onMeansCaution?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4 rounded-md border border-gray-200 p-4">
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-0.5 text-xs text-gray-600">{help}</p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        onMeansCaution
          ? on
            ? "bg-amber-100 text-amber-800"
            : "bg-gray-100 text-gray-600"
          : on
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
      }`}
    >
      <span className={`inline-block size-2 rounded-full ${onMeansCaution ? (on ? "bg-amber-600" : "bg-gray-400") : on ? "bg-green-600" : "bg-red-600"}`} />
      {on ? "On" : "Off"}
    </button>
  </div>
);

const AppAccessPanel = () => {
  const { access, allowed, isLoading, save, testers, saveTesters } = useAppAccess();
  const [web, setWeb] = useState(true);
  const [mobile, setMobile] = useState(true);
  const [waitlist, setWaitlist] = useState(false);
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [testerText, setTesterText] = useState("");

  // the testers' text box follows what is saved, one person to a line
  useEffect(() => {
    if (testers) setTesterText(testers.testers.join("\n"));
  }, [testers]);

  // follow what is saved (when the page first loads, and after a save)
  useEffect(() => {
    if (access) {
      setWeb(access.web);
      setMobile(access.mobile);
      setWaitlist(access.waitlist);
      setMessage(access.message);
    }
  }, [access]);

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!allowed || !access) {
    return (
      <div>
        <h2 className="text-sm font-semibold">App access is not available to you</h2>
        <p className="mt-1 text-xs text-gray-600">Only a super admin can switch the customer apps on or off.</p>
      </div>
    );
  }

  const changed = web !== access.web || mobile !== access.mobile || waitlist !== access.waitlist || message.trim() !== access.message.trim();
  const switchingOff = (access.web && !web) || (access.mobile && !mobile);
  const switchingWaitlistOn = !access.waitlist && waitlist;
  const needsConfirm = switchingOff || switchingWaitlistOn;
  const off = [!web && access.web ? "web" : null, !mobile && access.mobile ? "mobile" : null].filter(Boolean) as string[];
  const tooLong = message.length > access.maxMessageLength;

  const doSave = () => {
    setConfirming(false);
    save.mutate({ web, mobile, waitlist, message: message.trim() });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">App Access</h1>
      <p className="text-xs text-gray-600">
        Switch the customer web app or mobile app off, for example during maintenance. While one is off, its customers (including those
        already signed in) see an &quot;unavailable&quot; message. Payments already on their way (bank transfer webhooks) are still credited,
        and staff are never locked out of this admin.
      </p>

      <Toggle label="Web app" help="myvesture.co and the staging site" on={web} onChange={setWeb} />
      <Toggle label="Mobile app" help="The Android and iOS apps. Older versions of the app also count as mobile." on={mobile} onChange={setMobile} />
      <Toggle
        label="Waitlist mode"
        help="The web landing page stays up and its Login button becomes Join waitlist. Every other web page sends visitors to the waitlist, and web logins are refused. The mobile app is not affected."
        on={waitlist}
        onChange={setWaitlist}
        onMeansCaution
      />

      <label className="flex flex-col gap-1 text-xs text-gray-600">
        Message customers see while an app is off (optional)
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder={access.defaultMessage}
          className="border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
        />
        <span className={tooLong ? "text-red-600" : "text-gray-400"}>
          {message.length} / {access.maxMessageLength}
        </span>
      </label>

      {!web && !mobile && <p className="text-xs text-amber-700">Both apps are off: no customer can use Vesture until one is switched back on.</p>}

      <div className={changed && !tooLong ? "" : "opacity-50 pointer-events-none"}>
        <Button name="Save" color="purple" loading={save.isPending} onClick={() => (needsConfirm ? setConfirming(true) : doSave())} />
      </div>

      {testers && (
        <section className="space-y-2 border-t pt-4">
          <h2 className="text-sm font-semibold">Testers who can still use the web</h2>
          <p className="text-xs text-gray-600">
            While Waitlist mode is on, these people can still sign in to the web app at <span className="font-mono">/login</span> and keep using it. Everyone else
            is sent to the waitlist. Put one email address or phone number on each line. This does not change the mobile app.
          </p>
          <textarea
            value={testerText}
            onChange={(e) => setTesterText(e.target.value)}
            rows={6}
            placeholder={"ada@example.com\n0803 123 4567"}
            aria-label="Testers"
            className="border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 rounded-md px-3 py-2 text-sm w-full font-mono focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]"
          />
          <div className="flex items-center gap-3">
            <Button
              name="Save testers"
              color="purple"
              loading={saveTesters.isPending}
              onClick={() => saveTesters.mutate(testerText.split(/[\r\n,;]+/).map((t) => t.trim()).filter(Boolean))}
            />
            <span className="text-xs text-gray-500">
              {testerText.split(/[\r\n,;]+/).filter((t) => t.trim()).length} of up to {testers.max}
            </span>
          </div>
        </section>
      )}

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {switchingOff && switchingWaitlistOn ? `Switch off ${off.join(" and ")} and turn on the waitlist?` : switchingOff ? `Switch off ${off.join(" and ")}?` : "Turn on the waitlist?"}
            </DialogTitle>
          </DialogHeader>
          {switchingOff && (
            <p className="text-sm text-gray-700">
              This takes effect immediately. Every customer on {off.join(" and ")}, including anyone signed in, will be told Vesture is
              unavailable until you switch it back on.
            </p>
          )}
          {switchingWaitlistOn && (
            <p className="mt-2 text-sm text-gray-700">
              Within about 30 seconds the web app&apos;s pages send visitors to the waitlist, and web logins are refused, including for customers
              already signed in. The landing page stays up. The mobile app is not affected.
            </p>
          )}
          <div className="mt-4 flex gap-3">
            <Button name="Cancel" color="lightpurple" onClick={() => setConfirming(false)} />
            <Button name={switchingOff ? "Switch off" : "Turn on"} color="purple" onClick={doSave} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppAccessPanel;
