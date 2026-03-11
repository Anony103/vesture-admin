import { Dispatch , SetStateAction } from "react";



interface TabItemProps {
  active: boolean;
  label: string;
  onClick: Dispatch<SetStateAction<string>>;
  id?: string;
  value : string
}

  const TabItem: React.FC<TabItemProps> = ({
    label,
    value,
    active,
    onClick,
  }) => {
    return (
      <p
        className={`mx-2 pb-6 cursor-pointer ${
          active
            ? "border-b-2 border-[#7C2EBF] text-[#7C2EBF] font-semibold"
            : ""
        }`}
        onClick={() => onClick(value)}
      >
        {label}
      </p>
    );
  };

export default TabItem;
