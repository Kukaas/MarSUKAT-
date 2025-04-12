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
    timeZone: "Asia/Manila"
  },
  long: {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Manila"
  },
  medium: {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila"
  },
};

export function formatDate(date, format = "medium") {
  if (!date) return "-";
  try {
    // Handle ISO string dates by appending 'Z' if not present
    const dateString = typeof date === 'string' && !date.endsWith('Z') 
      ? date + 'Z' 
      : date;
    
    // Create a new Date object
    const dateObj = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date');
    }

    return dateObj.toLocaleString("en-US", dateFormats[format]);
  } catch (error) {
    console.error("Date formatting error:", error);
    return "-";
  }
}

export const isChromeBrowser = () => {
  // Check if window is defined (for SSR)
  if (typeof window !== "undefined") {
    // Check for Brave's specific navigator property
    if (navigator.brave?.isBrave) {
      return false;
    }

    const userAgent = navigator.userAgent.toLowerCase();
    return userAgent.includes("chrome") && !userAgent.includes("edg");
  }
  return false;
};

// Add more utility functions as needed
