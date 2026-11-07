import { useEffect, useState } from "react";
import Button from "./shared/button";
import useProductAvailability from "@/hooks/use-product-availability";

const ProductAvailabilityPanel = () => {
  const { availability, allowed, isLoading, save } = useProductAvailability();
  const [open, setOpen] = useState(false);

  // follow what is saved (when the page first loads, and after a save)
  useEffect(() => {
    if (availability) setOpen(availability.bnpl);
  }, [availability]);

  if (isLoading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!allowed || !availability) {
    return (
      <div>
        <h2 className="text-sm font-semibold">Products are not available to you</h2>
        <p className="mt-1 text-xs text-gray-600">Only a super admin can open or close a product.</p>
      </div>
    );
  }

  const changed = open !== availability.bnpl;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">Products</h1>
      <p className="text-xs text-gray-600">
        While BuyNow PayLater is &quot;coming soon&quot;, customers on web and mobile see it marked as coming soon and cannot start a new purchase.
        Customers who already have a purchase can still see it and pay their instalments. Opening it takes effect on web and on the server at
        once; the mobile app shows the change the next time it is opened, and older app versions that have not been updated will be refused
        with a &quot;coming soon&quot; message.
      </p>

      <div className="flex items-center justify-between gap-4 rounded-md border border-gray-200 p-4">
        <div>
          <p className="text-sm font-semibold">BuyNow PayLater</p>
          <p className="mt-0.5 text-xs text-gray-600">Open lets customers start new purchases. Coming soon blocks them.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={open}
          aria-label="BuyNow PayLater"
          onClick={() => setOpen(!open)}
          className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
            open ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}
        >
          <span className={`inline-block size-2 rounded-full ${open ? "bg-green-600" : "bg-amber-600"}`} />
          {open ? "Open" : "Coming soon"}
        </button>
      </div>

      <div className={changed ? "" : "opacity-50 pointer-events-none"}>
        <Button name="Save" color="purple" loading={save.isPending} onClick={() => save.mutate({ bnpl: open })} />
      </div>
    </div>
  );
};

export default ProductAvailabilityPanel;
