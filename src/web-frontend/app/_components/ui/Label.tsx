"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/app/_utils"

interface Props {
    is_required?: boolean;
    children: React.ReactNode;
}

function Label({
    className,
    is_required = false,
    children,
    ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & Props) {
    return (
        <LabelPrimitive.Root
            data-slot="label"
            className={cn(
                "flex items-center !text-label-s-reg text-t-subtext-gray select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                className
            )}
            {...props}
        >
            {children}
            {is_required && <span className="text-status-error-red">*</span>}
        </LabelPrimitive.Root>
    )
}

export { Label }
