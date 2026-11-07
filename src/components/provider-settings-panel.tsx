import { useEffect, useState } from "react";
import Button from "./shared/button";
import useProviderSettings from "@/hooks/use-provider-settings";
import { ProviderKind, ProviderKindView } from "@/types/provider-settings-type";

const selectClass =
  "border border-gray-300 bg-white text-gray-900 rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#7C2EBF]";

const NONE = "";

const ProviderCard = ({
  kind,
  title,
  help,
  view,
  saving,
  onSave,
}: {
  kind: ProviderKind;
  title: string;
  help: string;
  view: ProviderKindView;
  saving: boolean;
  onSave: (kind: ProviderKind, order: string[]) => void;
}) => {
  const [first, setFirst] = useState(view.order[0] ?? NONE);
  const [second, setSecond] = useState(view.order[1] ?? NONE);

  // follow the saved order (after a save, or when the page first loads)
  useEffect(() => {
    setFirst(view.order[0] ?? NONE);
    setSecond(view.order[1] ?? NONE);
  }, [view.order]);

  const label = (name: string) => {
    const option = view.available.find((p) => p.name === name);
    return option ? `${option.label}${option.configured ? "" : " (not set up)"}` : name;
  };
  const isSetUp = (name: string) => view.available.find((p) => p.name === name)?.configured ?? false;

  const chosen = second === NONE ? [first] : [first, second];
  const changed = chosen.join(",") !== view.order.join(",");
  const firstNotSetUp = first !== NONE && !isSetUp(first);
  const nothingUsable = !chosen.some(isSetUp);

  return (
    <section className="rounded-md border border-gray-200 p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-xs text-gray-600">{help}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          First choice
          <select
            value={first}
            onChange={(e) => {
              setFirst(e.target.value);
              if (e.target.value === second) setSecond(NONE);
            }}
            className={selectClass}
          >
            {view.available.map((p) => (
              <option key={p.name} value={p.name}>
                {label(p.name)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          If the first one fails, use
          <select value={second} onChange={(e) => setSecond(e.target.value)} className={selectClass}>
            <option value={NONE}>None (do not fall back)</option>
            {view.available
              .filter((p) => p.name !== first)
              .map((p) => (
                <option key={p.name} value={p.name}>
                  {label(p.name)}
                </option>
              ))}
          </select>
        </label>
      </div>
      {firstNotSetUp && !nothingUsable && (
        <p className="text-xs text-amber-700">
          {label(first)}: the server has no login details for it, so it will be skipped and the fallback used every time.
        </p>
      )}
      {nothingUsable && (
        <p className="text-xs text-red-600">
          None of these is set up on the server (its login details are missing), so this cannot be saved. Choose one that is set up.
        </p>
      )}
      <div className={changed && !nothingUsable ? "" : "opacity-50 pointer-events-none"}>
        <Button name="Save" color="purple" loading={saving} onClick={() => onSave(kind, chosen)} />
      </div>
    </section>
  );
};

const ProviderSettingsPanel = () => {
  const { settings, allowed, isLoading, save } = useProviderSettings();

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  if (!allowed || !settings) {
    return (
      <div>
        <h2 className="text-sm font-semibold">Providers are not available to you</h2>
        <p className="mt-1 text-xs text-gray-600">Only a super admin can choose the BVN and SMS providers.</p>
      </div>
    );
  }

  const saving = save.isPending;
  const onSave = (kind: ProviderKind, order: string[]) => save.mutate({ kind, order });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Providers</h1>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          Changes apply straight away, to every customer, and are written to the Audit Log. The second provider is only used when the first
          cannot do the job; a provider that is not set up on the server is skipped.
        </div>
        <ProviderCard
          kind="BVN"
          title="BVN checks"
          help="Used when a customer signs up. The second provider is asked only when the first is down or refuses our login. If the first says the BVN is not valid, that is the answer and the second is not asked."
          view={settings.bvn}
          saving={saving}
          onSave={onSave}
        />
        <ProviderCard
          kind="SMS"
          title="SMS (one-time codes)"
          help="Used for one-time codes. The second provider is tried when the first does not accept the message or cannot be reached."
          view={settings.sms}
          saving={saving}
          onSave={onSave}
        />
    </div>
  );
};

export default ProviderSettingsPanel;
