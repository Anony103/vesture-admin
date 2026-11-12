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
        role="tab"
        aria-selected={active}
        className={`mx-2 pb-6 cursor-pointer border-b-2 text-sm transition-colors ${
          active
            ? "border-brand text-brand font-semibold"
            : "border-transparent text-fg2 hover:text-fg"
        }`}
        onClick={() => onClick(value)}
      >
        {label}
      </p>
    );
  };

export default TabItem;
