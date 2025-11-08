import { cn } from "@/app/_utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Spinner = ({ className, ...props }: SpinnerProps) => {
  return (
    <div
      className={cn(
        "animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-primary rounded-full",
        className
      )}
      role="status"
      aria-label="loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export { Spinner };
