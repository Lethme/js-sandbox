declare interface String {
	capitalize(): string;

	bindArgs(...args: Array<string | number>): string;

	bind(obj: Record<string, any>): string;
}