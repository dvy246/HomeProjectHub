import React, { useState, useEffect } from "react";
import { Card, CardTitle, CardDescription } from "./ui/Card";
import { Button } from "./ui/Button";
import { getSavedRooms, deleteRoom, type SavedRoom } from "../lib/storage";

export default function SavedRoomsDashboard() {
  const [rooms, setRooms] = useState<SavedRoom[]>([]);

  useEffect(() => {
    setRooms(getSavedRooms());
    const handleRoomsChange = () => setRooms(getSavedRooms());
    window.addEventListener("saved-rooms-changed", handleRoomsChange);
    return () => window.removeEventListener("saved-rooms-changed", handleRoomsChange);
  }, []);

  const handleDelete = (id: string) => {
    deleteRoom(id);
  };

  if (rooms.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 select-none">
          No saved measurements found.
        </p>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-6 text-pretty">
          Go to any calculator (like Slab or Footing), input your project dimensions, and click "Save Room" to store them.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.location.href = "/calculators/concrete/slab/"} variant="primary">
            Go to Slab Calculator
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <Card key={room.id} className="flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <CardTitle className="mb-0">{room.name}</CardTitle>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold focus:outline-none transition-colors"
                  aria-label={`Delete ${room.name}`}
                >
                  Delete
                </button>
              </div>
              <CardDescription className="font-mono text-xs tabular-nums mt-2">
                Dimensions: {room.length} ft &times; {room.width} ft 
                {room.height ? ` &times; ${room.height} in` : ""}
              </CardDescription>
            </div>
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = `/calculators/concrete/slab/?ref=${room.id}`}
                className="w-full text-xs"
              >
                Use in Slab
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.href = `/calculators/concrete/footing/?ref=${room.id}`}
                className="w-full text-xs"
              >
                Use in Footing
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
