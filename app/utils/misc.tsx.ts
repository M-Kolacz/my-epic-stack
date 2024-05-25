import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const getErrorMessage = (error: unknown) => {
	if (typeof error === "string") return error;
	if (
		error &&
		typeof error === "object" &&
		"message" in error &&
		typeof error.message === "string"
	) {
		return error.message;
	}
	console.error("💀 Unable to get error message", error);

	return "Unknown error";
};

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
