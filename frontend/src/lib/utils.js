import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function isDevelopment() {
  // Multiple ways to check for development mode
  return (
    import.meta.env.MODE === 'development' || 
    import.meta.env.VITE_NODE_ENV === 'development' ||
    import.meta.env.DEV === true ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

export const dateFormats = {
  short: {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  long: {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  medium: {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
};

export function formatDate(date, format = "medium") {
  if (!date) return "-";
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleString("en-US", dateFormats[format]);
  } catch (error) {
    return "-";
  }
}

// Add more utility functions as needed
