export interface DateRange {
	from: Date;
	to: Date;
}

export interface DateStringRange {
	from: string;
	to: string;
}

export interface SortFilter {
	sort_by_field: string | null;
	sort_by_order: string | null;
}

export interface Option {
	label: string;
	value: string;
}