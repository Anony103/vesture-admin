import React from "react";

export const Container = ({ children }: { children?: React.ReactNode }) => {
  return (
    <article className="flex flex-col items-center justify-center ">
      <div className="w-[95%]  lg:w-[91%] max-w-[1400px]">{children}</div>
    </article>
  );
};
