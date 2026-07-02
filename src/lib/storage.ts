export interface SavedRoom {
  id: string;
  name: string;
  length: number;
  width: number;
  height?: number;
  geometryType: "area" | "volume";
}

const STORAGE_KEY = "home_project_hub_saved_rooms";

export function getSavedRooms(): SavedRoom[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    // Dispatch a custom event to notify other components of the storage change
    window.dispatchEvent(new Event("saved-rooms-changed"));
  } catch {
  }
  return rooms;
}

export function deleteRoom(id: string): SavedRoom[] {
  if (typeof window === "undefined") return [];
  const rooms = getSavedRooms();
  const filtered = rooms.filter((r) => r.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event("saved-rooms-changed"));
  } catch {
  }
  return filtered;
}
