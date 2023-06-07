import {ArgumentsType} from "@/utils/types";

type DebounceCallbackType<T extends Function> = (...args: ArgumentsType<T>) => void;

export function debounce<T extends Function>(this: any, func: T, delay: number = 0): DebounceCallbackType<T> {
	let timeoutId: number | undefined;

	return (...args: ArgumentsType<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(func.bind(this, ...args), delay);
	}
}