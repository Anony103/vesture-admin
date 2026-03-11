import { ReactElement } from "react";
import { ClipLoader } from "react-spinners";

interface Props {
  title: string;
  amount: string;
  icon: string;
  loading: boolean;
}

function DashboardCard({ title, amount, icon, loading }: Props): ReactElement {
  return (
    <div className="bg-white shadow w-[100%] h-[100%] gap-4 rounded p-4 flex flex-row">
      <div>
        <img src={icon} alt="" />
      </div>
      <div className="flex flex-col gap-y-1 ">
        {loading ? (
          <ClipLoader color = "#7C2EBF"  size = "10px" />
        ) : (
          <p className="text-lg font-semibold ">{amount}</p>
        )}

        <p className="text-xs text-gray-400">{title}</p>
      </div>
    </div>
  );
}

export default DashboardCard;
