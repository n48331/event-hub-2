/**
 * Utility functions for constructing absolute URLs
 * Uses NEXT_PUBLIC_URL environment variable for production
 */

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_URL;
  }
  

  
  // Default to localhost for development
  return 'http://localhost:3000';
}

export function getApiUrl(path: string = ''): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}/api${cleanPath}`;
}

export function getEventUrl(eventId: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/event-hub/event/${eventId}`;
}

export function getAdminUrl(path: string = ''): string {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}/event-hub/admin${cleanPath}`;
}
