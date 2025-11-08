"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/app/_utils";
import { ZERO } from "@/app/_constants";

const MAX_PROGRESS = 100;

function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
	return (
		<ProgressPrimitive.Root data-slot="progress" className={cn("bg-fill-secondary-white relative h-[10] w-full overflow-hidden rounded-full", className)} {...props}>
			<ProgressPrimitive.Indicator data-slot="progress-indicator" className="bg-status-warning-yellow h-full w-full flex-1 transition-all rounded-full" style={{ transform: `translateX(-${MAX_PROGRESS - (value || ZERO)}%)` }} />
		</ProgressPrimitive.Root>
	);
}

export { Progress };
