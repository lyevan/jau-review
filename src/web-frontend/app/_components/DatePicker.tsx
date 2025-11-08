"use client";

import * as React from "react";

import { Calendar } from "@/app/_components/ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/_components/ui/Popover";
import { format } from "date-fns";
import SvgIcon from "@/app/_components/SvgIcon";
import { cn } from "@/app/_utils";

interface Props {
    value?: Date | string;
    onChange: (date: Date) => void;
    className?: string;
}

export function DatePicker({ value, onChange, className }: Props) {
	const [open, setOpen] = React.useState(false);

	return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button className="h-[48] border border-stroke-gray rounded-[8] flex items-center justify-between">
                    <p className={cn("text-center w-full text-t-primary-black !text-label-s-reg", className)}>
                        {value ? format(value, "MMM dd, yyyy") : "Select date"}
                    </p>
                    <div className="size-[48] border-l border-stroke-gray flex items-center justify-center shrink-0">
                        <SvgIcon id="icon-line-calendar-default" className="text-icon-default-black" />
                    </div>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value ? new Date(value as string) : undefined}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                        if(date){
                            onChange(date);
                        }
                        setOpen(false);
                    }}
                />
            </PopoverContent>
        </Popover>
	);
}
