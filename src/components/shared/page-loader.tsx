import { ClipLoader } from "react-spinners";

export const PageLoader = () => (
  <div className="min-h-[30vh] flex items-center justify-center">
    <ClipLoader color="rgb(164, 92, 255)" size={40} />
  </div>
);
