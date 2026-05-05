/**
 * Utility functions for date and time handling with IST (Indian Standard Time)
 */

/**
 * Get current time in IST format (YYYY-MM-DDTHH:MM)
 * Suitable for datetime-local input fields
 */
export const getCurrentISTDateTime = () => {
  const now = new Date();
  
  // Convert to IST (UTC+5:30)
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  // Format as YYYY-MM-DDTHH:MM for datetime-local input
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');
  const hours = String(istTime.getHours()).padStart(2, '0');
  const minutes = String(istTime.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Convert a datetime string to IST
 * Useful when displaying stored times
 */
export const convertToIST = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  const istTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');
  const hours = String(istTime.getHours()).padStart(2, '0');
  const minutes = String(istTime.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Get IST date only (YYYY-MM-DD)
 */
export const getCurrentISTDate = () => {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Parse a pure date string (YYYY-MM-DD) into a Date object at local midnight.
 * This prevents the date from shifting to a previous day in Western timezones.
 */
export const parseLocalDate = (dateInput) => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput !== 'string') return null;
  const parts = dateInput.split('T')[0].split('-');
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

/**
 * Format an ISO timestamp string into an IST time string (e.g. "2:30 PM").
 * This ensures collaborators in other timezones see the activity time exactly
 * as it was planned in IST.
 */
export const formatISTTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get the YYYY-MM-DD date key from an ISO timestamp, strictly using IST.
 * This ensures activities are grouped under the correct day regardless of viewer timezone.
 */
export const getISTDateKey = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const istTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
