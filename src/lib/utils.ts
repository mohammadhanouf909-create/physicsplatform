import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// دالة دمج كلاسات Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// دالة تنسيق السعر (مثلاً: 100.00 EGP)
export function formatPrice(amount: number, currency: string = "EGP") {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

// دالة تنسيق التاريخ (مثلاً: 15 Oct 2025)
export function formatDate(date: string, locale: string = "en") {
  try {
    return new Date(date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return date;
  }
}

// دالة جلب أول حروف من الاسم (للبروفايل)
export function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}