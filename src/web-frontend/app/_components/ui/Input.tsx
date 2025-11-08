import * as React from "react";

import { cn } from "@/app/_utils";
import { ClassValue } from "clsx";

interface Props extends React.ComponentProps<"input"> {
	error?: string;
	LeftIcon?: React.ReactNode;
	RightIcon?: React.ReactNode;
	containerClassName?: ClassValue;
}

function Input({ className, type, error, LeftIcon, RightIcon, containerClassName, ...props }: Props) {
	return (
		<div className={cn("relative", containerClassName)}> 
			{
				LeftIcon &&
					<div
						className="absolute left-[12] top-[0] h-full w-auto flex items-center justify-center"
					>
						{LeftIcon}
					</div>
			}
			<input
				type={type}
				data-slot="input"
				className={cn(
					"file:text-foreground placeholder:text-t-placeholder-gray !text-paragraph-s-reg selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-stroke-gray flex h-[48] w-full min-w-0 rounded-md border bg-transparent px-[16] shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-fill-primary aria-invalid:border-status-error-red caret-fill-primary",
					className,
					LeftIcon && "pl-[48]",
					RightIcon && "pr-[48]"
				)}
				aria-invalid={error ? "true" : "false"}
				{...props}
			/>
			{error && <p className="text-status-error-red mt-[.4rem] !text-paragraph-s-reg">{error}</p>}
			{
				RightIcon &&
					<div
						className="absolute right-[0] top-[0] size-[48] flex items-center justify-center"
					>
						{RightIcon}
					</div>
			}
		</div>
	);
}

export { Input };
