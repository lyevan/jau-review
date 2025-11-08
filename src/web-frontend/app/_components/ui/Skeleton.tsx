import { ONE } from "@/app/_constants";
import { cn } from "@/app/_utils";
import { ClassValue } from "clsx";

interface Props {
	containerClassName?: ClassValue;
	itemClassName?: ClassValue;
	count?: number
}

function Skeleton({ containerClassName, itemClassName, count = ONE }: Props) {

	if(count > ONE) {
		return (
			<div className={cn("flex flex-col gap-[16]", containerClassName)}>
				{[...Array(count)].map((_, index) => (
					<div
						key={index}
						data-slot="skeleton"
						className={cn(
							"bg-fill-highlight-lightest animate-pulse rounded-md",
							itemClassName,
						)}
					/>
				))}
			</div>
		)
	}

	return (
		<div
			data-slot="skeleton"
			className={cn(
				"bg-fill-highlight-lightest animate-pulse rounded-md",
				itemClassName,
			)}
		/>
	);
}

export { Skeleton };
