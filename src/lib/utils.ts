import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAsCurrency(value: number) {
  const valueInDecimal = value / 100.0;
  const nairaFormat = new Intl.NumberFormat("en-us", {
    style: "currency",
    currency: "NGN",
  });
  return nairaFormat.format(valueInDecimal);
}
