"use client";

/* REACT */
import { ButtonHTMLAttributes } from "react";

/* PLUGINS */
import { FaChevronUp, FaChevronDown } from "react-icons/fa6";

/* UTILITIES */
import { cn } from "@/app/_utils";

export type SortType = "asc" | "desc" | null;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
	label: string;
	sort?: SortType;
	onSort?: (value: SortType) => void;
}

const DataSort = ({ label, sort, onSort, ...props }: Props) => {
	const sort_value = sort === "asc" || sort === "desc" ? sort : null;

	return (
		<button
			{...props}
			type="button"
			className={cn("flex w-full items-center disabled:opacity-80 gap-[8]", props.className)}
			onClick={(event) => {
				props.onClick?.(event);

				if (sort === "asc") {
					onSort?.("desc");
				} 
				else if (sort === "desc") {
					onSort?.(null);
				} 
				else {
					onSort?.("asc");
				}
			}}
		>
			<span className="text-t-subtext-gray !text-title-s-bold truncate">{label}</span>
			<div className="flex flex-col gap-0">
				<FaChevronUp
					className={cn("relative top-[2] size-[12] text-icon-default-black", {
						["text-fill-primary"]: sort_value === "asc"
					})}
				/>
				<FaChevronDown
					className={cn("relative top-[-2] size-[12] text-icon-default-black", {
						["text-fill-primary"]: sort_value === "desc"
					})}
				/>
			</div>
		</button>
	);
};

export default DataSort;
