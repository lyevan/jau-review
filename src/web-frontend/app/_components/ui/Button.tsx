import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/app/_utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md !text-title-s-bold text-fill-primary-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none  cursor-pointer h-[48] px-[24] truncate",
	{
		variants: {
			variant: {
				default: "bg-fill-primary hover:bg-fill-primary/90 disabled:bg-icon-default-gray disabled:!text-fill-primary-white",
				danger: "bg-status-error-red hover:bg-status-error-red/90 disabled:bg-icon-default-gray disabled:!text-fill-primary-white",
				tertiary: "bg-fill-secondary-light hover:bg-fill-secondary-light/90 disabled:bg-icon-default-gray disabled:!text-fill-primary-white",
				link: "text-fill-primary underline-offset-4 hover:underline p-0 !text-label-s-reg",
                transparent: "border border-fill-primary hover:text-fill-primary-white text-fill-primary hover:bg-fill-primary !text-label-s-reg",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
	VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(
					buttonVariants({ variant }),
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
