import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price range
export function formatPriceRange(priceRange: string): string {
  return priceRange;
}

// Format rating
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
}

// Check if restaurant is open
export function isRestaurantOpen(hours: Record<string, { open: string; close: string } | 'Closed'>): boolean {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const todayHours = hours[currentDay];
  if (!todayHours || todayHours === 'Closed') {
    return false;
  }
  
  const [openHour, openMinute] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMinute] = todayHours.close.split(':').map(Number);
  
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;
  
  return currentTime >= openTime && currentTime <= closeTime;
}