import { RequestItem } from "@/types/request";

const KEY = "patreon_request_tracker_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// Load requests from API or fallback to localStorage
export async function loadRequests(): Promise<RequestItem[]> {
  try {
    // Try to load from API first
    const response = await fetch('/api/requests');
    if (response.ok) {
      const requests = await response.json();
      // Update localStorage as backup
      if (typeof window !== "undefined") {
        localStorage.setItem(KEY, JSON.stringify(requests));
      }
      return requests;
    }
  } catch (error) {
    console.error('Error loading requests from API, falling back to localStorage:', error);
  }
  
  // Fallback to localStorage
  if (typeof window === "undefined") return [];
  return safeParse<RequestItem[]>(localStorage.getItem(KEY), []);
}

// Save requests to localStorage (backup)
export async function saveRequests(items: RequestItem[]): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(items));
  }
}

// Add a new request via API
export async function addNewRequest(item: RequestItem): Promise<boolean> {
  try {
    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    
    if (response.ok) {
      // Update localStorage as backup
      if (typeof window !== "undefined") {
        const current = safeParse<RequestItem[]>(localStorage.getItem(KEY), []);
        current.push(item);
        localStorage.setItem(KEY, JSON.stringify(current));
      }
      return true;
    }
  } catch (error) {
    console.error('Error adding new request:', error);
  }
  
  return false;
}

// Update an existing request via API
export async function updateExistingRequest(id: string, updates: Partial<RequestItem>): Promise<boolean> {
  try {
    const response = await fetch('/api/requests', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...updates }),
    });
    
    if (response.ok) {
      // Update localStorage as backup
      if (typeof window !== "undefined") {
        const current = safeParse<RequestItem[]>(localStorage.getItem(KEY), []);
        const index = current.findIndex(item => item.id === id);
        if (index !== -1) {
          current[index] = { ...current[index], ...updates };
          localStorage.setItem(KEY, JSON.stringify(current));
        }
      }
      return true;
    }
  } catch (error) {
    console.error('Error updating request:', error);
  }
  
  return false;
}

// Seed data if empty (using localStorage for now)
export async function seedIfEmpty(seed: RequestItem[]): Promise<void> {
  const current = await loadRequests();
  if (current.length === 0) {
    // For now, just use localStorage for seeding
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(seed));
    }
  }
}
