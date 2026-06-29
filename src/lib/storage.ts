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
  } catch (error) {
    console.error("Failed to read localStorage", error);
    return [];
  }
}

export function saveRoom(room: Omit<SavedRoom, "id"> & { id?: string }): SavedRoom[] {
  if (typeof window === "undefined") return [];
  const rooms = getSavedRooms();
  const id = room.id || crypto.randomUUID();
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
  } catch (error) {
    console.error("Failed to write to localStorage", error);
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
  } catch (error) {
    console.error("Failed to write to localStorage", error);
  }
  return filtered;
}
