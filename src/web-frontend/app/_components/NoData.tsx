/* NEXT */
import { ReactNode } from "react";

const NoDataIcon = () => (
  <svg
    width="220"
    height="220"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-muted-foreground"
  >
    <path
      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface Props {
  main_text?: string;
  sub_text?: string;
  button?: ReactNode;
}

const NoData = ({ main_text, sub_text, button }: Props) => {
  return (
    <div className="flex flex-col gap-[32] items-center justify-center text-center flex-1">
      <NoDataIcon />
      <div>
        <h2 className="text-t-primary-black !text-title-m-bold">{main_text}</h2>
        <p>{sub_text}</p>
      </div>
      {button}
    </div>
  );
};

export default NoData;
