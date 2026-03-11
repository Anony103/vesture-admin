import { ReactElement } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

function Backbutton(): ReactElement {
    const navigate = useNavigate()
    return (
    <div
      onClick={() => {
        navigate(-1);
      }}
      className="flex gap-2 items-center text-xs"
    >
      <IoIosArrowBack />
      Back
    </div>
  );
}

export default Backbutton;
