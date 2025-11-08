import React from "react";

interface Props {
  children: React.ReactNode;
  className ?: string;
}


const Container = ({ children, className }: Props) => {
  return (
    <div className={`xl:max-w-[1280px] xl:m-auto ${className || ""}`}>
      {children}
    </div>
  );
};

export default Container;
