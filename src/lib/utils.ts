import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const parseStringify = (value: unknown) => {
  if (value === undefined) {
    return null; // Return null instead of undefined
  }
  return JSON.parse(JSON.stringify(value));
};