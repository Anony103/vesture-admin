import { useEffect, useState } from "react";
import Button from "./shared/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useAppAccess from "@/hooks/use-app-access";

const Toggle = ({ label, help, on, onChange }: { label: string; help: string; on: boolean; onChange: (next: boolean) => void }) => (
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
        on ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      <span className={`inline-block size-2 rounded-full ${on ? "bg-green-600" : "bg-red-600"}`} />
      {on ? "On" : "Off"}
    </button>
  </div>
);

const AppAccessPanel = () => {
  const { access, allowed, isLoading, save } = useAppAccess();
  const [web, setWeb] = useState(true);
  const [mobile, setMobile] = useState(true);
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  // follow what is saved (when the page first loads, and after a save)
  useEffect(() => {
    if (access) {
      setWeb(access.web);
      setMobile(access.mobile);
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

  const changed = web !== access.web || mobile !== access.mobile || message.trim() !== access.message.trim();
  const switchingOff = (access.web && !web) || (access.mobile && !mobile);
  const off = [!web ? "web" : null, !mobile ? "mobile" : null].filter(Boolean) as string[];
  const tooLong = message.length > access.maxMessageLength;

  const doSave = () => {
    setConfirming(false);
    save.mutate({ web, mobile, message: message.trim() });
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
        <Button name="Save" color="purple" loading={save.isPending} onClick={() => (switchingOff ? setConfirming(true) : doSave())} />
      </div>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Switch off {off.join(" and ")}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-700">
            This takes effect immediately. Every customer on {off.join(" and ")}, including anyone signed in, will be told Vesture is
            unavailable until you switch it back on.
          </p>
          <div className="mt-4 flex gap-3">
            <Button name="Cancel" color="lightpurple" onClick={() => setConfirming(false)} />
            <Button name="Switch off" color="purple" onClick={doSave} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppAccessPanel;
