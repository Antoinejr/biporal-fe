import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ngNG, { type Locale } from "./locale";

export function convertHourToString(hour: number) {
  if (hour >= 0 && hour <= 12) {
    return `${hour} AM`;
  }
  return `${hour - 12} PM`;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAsCurrency(value: number) {
  const valueInDecimal = value / 100.0;
  return formatCurrency(valueInDecimal);
}

let currentLocale: Locale = ngNG;

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

// Format currency
export function formatCurrency(
  raw: number,
  options?: {
    showSymbol?: boolean;
    decimals?: number;
  },
): string {
  // FIXME: subject to change
  const amount = raw / 100.0;
  const locale = getLocale();
  const decimals = options?.decimals ?? locale.currency.decimals;
  const showSymbol = options?.showSymbol ?? true;

  const formatted = amount.toLocaleString("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${locale.currency.symbol}${formatted}` : formatted;
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

// Validate phone number
export function isValidPhoneNumber(phone: string): boolean {
  const locale = getLocale();
  const cleaned = phone.replace(/\D/g, "");
  return locale.phone.regex.test(cleaned);
}

// Format Lagos ID
export function formatLagosId(id: string): string {
  if (!id) return "";
  const cleaned = id.replace(/\D/g, "");
  return `LAG${cleaned}`;
}

// Validate Lagos ID
export function isValidLagosId(id: string): boolean {
  const locale = getLocale();
  return locale.lagosId.regex.test(id);
}

// Format date
export function formatDate(
  date: Date | string,
  format: "short" | "medium" | "long" | "full" = "medium",
): string {
  const locale = getLocale();
  const d = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: locale.dateTime.timezone,
  };

  switch (format) {
    case "short":
      options.day = "2-digit";
      options.month = "2-digit";
      options.year = "numeric";
      break;
    case "medium":
      options.day = "numeric";
      options.month = "short";
      options.year = "numeric";
      break;
    case "long":
      options.day = "numeric";
      options.month = "long";
      options.year = "numeric";
      break;
    case "full":
      options.weekday = "long";
      options.day = "numeric";
      options.month = "long";
      options.year = "numeric";
      break;
  }

  return d.toLocaleDateString("en-NG", options);
}

// Format time
export function formatTime(
  date: Date | string,
  format: "short" | "medium" | "long" | "full" = "short",
): string {
  const locale = getLocale();
  const d = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: locale.dateTime.timezone,
    hour12: false, // 24-hour format
  };

  switch (format) {
    case "short":
      options.hour = "2-digit";
      options.minute = "2-digit";
      break;
    case "medium":
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.second = "2-digit";
      break;
    case "long":
    case "full":
      options.hour = "2-digit";
      options.minute = "2-digit";
      options.second = "2-digit";
      options.timeZoneName = format === "long" ? "short" : "long";
      break;
  }

  return d.toLocaleTimeString("en-NG", options);
}

// Format date and time
export function formatDateTime(
  date: Date | string,
  format: "short" | "medium" | "long" | "full" = "medium",
): string {
  return `${formatDate(date, format)} ${formatTime(date, format)}`;
}
