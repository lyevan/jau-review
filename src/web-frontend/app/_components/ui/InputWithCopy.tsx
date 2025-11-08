/* REACT */
import * as React from "react";

/* COMPONENTS */
import SvgIcon from "@/app/_components/SvgIcon";

/* UTILS */
import { cn, handleCopyLink } from "@/app/_utils";

interface Props
  extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  error?: string;
  value: string;
  onChange?: (value: string) => void;
  text_to_copy?: string;
}

function InputWithCopy({
  className,
  type = "text",
  error,
  value = "",
  onChange,
  text_to_copy,
  ...props
}: Props) {
  const handleCopy = async () => {
    await handleCopyLink(text_to_copy || value);
  };

  return (
    <div className="relative w-full">
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-t-placeholder-gray !text-paragraph-s-reg selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-stroke-gray flex h-[48] w-full min-w-0 rounded-md border bg-transparent px-[16] shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-fill-primary aria-invalid:border-status-error-red caret-fill-primary pr-[64]",
          className
        )}
        aria-invalid={error ? "true" : "false"}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
      {error && (
        <p className="text-status-error-red mt-[.4rem] !text-paragraph-s-reg">
          {error}
        </p>
      )}
      <button
        className="absolute right-[0] top-[0] border-s border-s-stroke-gray h-full max-h-[48] w-[48] flex items-center justify-center cursor-pointer transition-colors"
        type="button"
        onClick={handleCopy}
        aria-label="Copy to clipboard"
      >
        📋
      </button>
    </div>
  );
}

export { InputWithCopy };
