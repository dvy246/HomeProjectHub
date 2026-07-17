import type { SavedProject } from "./projectEngine";

export interface SavedRoom {
  id: string;
  name: string;
  length: number;
  width: number;
  height?: number;
  geometryType: "area" | "volume";
}

const ROOMS_KEY = "home_project_hub_saved_rooms";

export function getSavedRooms(): SavedRoom[] {
  if (typeof window === "undefined") return [];
  migrateOldRooms();
  try {
    const data = localStorage.getItem(ROOMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRoom(room: Omit<SavedRoom, "id"> & { id?: string }): SavedRoom[] {
  if (typeof window === "undefined") return [];
  const rooms = getSavedRooms();
  let id = room.id;
  if (!id) {
    try {
      id = crypto.randomUUID();
    } catch {
      id = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    }
  }
  const newRoom: SavedRoom = { ...room, id };
  const existingIndex = rooms.findIndex((r) => r.id === id);
  if (existingIndex > -1) {
    rooms[existingIndex] = newRoom;
  } else {
    rooms.push(newRoom);
  }
  try {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    window.dispatchEvent(new Event("saved-rooms-changed"));
  } catch {}
  return rooms;
}

export function deleteRoom(id: string): SavedRoom[] {
  if (typeof window === "undefined") return [];
  const rooms = getSavedRooms().filter((r) => r.id !== id);
  try {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    window.dispatchEvent(new Event("saved-rooms-changed"));
  } catch {}
  return rooms;
}

let migrated = false;
function migrateOldRooms(): void {
  if (typeof window === "undefined" || migrated) return;
  const oldKey = "home_project_hub_rooms";
  try {
    const oldData = localStorage.getItem(oldKey);
    if (oldData) {
      const oldRooms = JSON.parse(oldData);
      if (Array.isArray(oldRooms)) {
        localStorage.setItem(ROOMS_KEY, JSON.stringify(oldRooms));
      }
      localStorage.removeItem(oldKey);
    }
    migrated = true;
  } catch {}
}

export interface MaterialPrice {
  price: number;
  label: string;
}

export function saveMaterialPrice(key: string, price: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`hph_price_${key}`, price.toString());
  } catch (e) {}
}

export function getMaterialPrice(key: string, defaultPrice: number): number {
  if (typeof window === "undefined") return defaultPrice;
  try {
    const val = localStorage.getItem(`hph_price_${key}`);
    return val ? parseFloat(val) : defaultPrice;
  } catch (e) {
    return defaultPrice;
  }
}

export type { SavedProject };

