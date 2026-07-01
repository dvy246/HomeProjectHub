import React, { useState, useEffect } from "react";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { getSavedRooms, saveRoom, deleteRoom, type SavedRoom } from "../lib/storage";

export default function SavedRoomsDashboard() {
  const [rooms, setRooms] = useState<SavedRoom[]>([]);
  const [name, setName] = useState<string>("");
  const [length, setLength] = useState<string>("");
  const [width, setWidth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [geometryType, setGeometryType] = useState<"area" | "volume">("area");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setRooms(getSavedRooms());
    const handler = () => setRooms(getSavedRooms());
    window.addEventListener("saved-rooms-changed", handler);
    return () => window.removeEventListener("saved-rooms-changed", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a project name.");
      return;
    }
    if (!length || !width) {
      setError("Please enter both length and width.");
      return;
    }
    setError("");
    saveRoom({
      id: editingId || undefined,
      name: name.trim(),
      length: parseFloat(length) || 0,
      width: parseFloat(width) || 0,
      height: height ? parseFloat(height) : undefined,
      geometryType,
    });
    setName("");
    setLength("");
    setWidth("");
    setHeight("");
    setEditingId(null);
    setRooms(getSavedRooms());
  };

  const handleEdit = (room: SavedRoom) => {
    setEditingId(room.id);
    setName(room.name);
    setLength(room.length.toString());
    setWidth(room.width.toString());
    setHeight(room.height ? room.height.toString() : "");
    setGeometryType(room.geometryType);
  };

  const handleDelete = (id: string) => {
    deleteRoom(id);
    setRooms(getSavedRooms());
    if (editingId === id) {
      setEditingId(null);
      setName("");
      setLength("");
      setWidth("");
      setHeight("");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setLength("");
    setWidth("");
    setHeight("");
    setError("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Add/Edit form */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold tracking-tight">
            {editingId ? "Edit Measurement" : "Add New Measurement"}
          </h3>
          {editingId && (
            <button type="button" onClick={handleCancel} className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Project Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Backyard Patio" error={error || undefined} />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Input label="Length (ft)" type="number" inputMode="decimal" value={length} onChange={(e) => setLength(e.target.value)} placeholder="e.g. 10" />
            <Input label="Width (ft)" type="number" inputMode="decimal" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="e.g. 10" />
            <Input label="Height (ft, optional)" type="number" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 0.33" className="col-span-2 sm:col-span-1" />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--fg-secondary)] mb-2 block">Measurement Type</label>
            <div className="flex bg-[var(--bg-muted)] p-0.5 rounded-lg text-xs w-fit">
              <button
                type="button"
                aria-label="Area measurement (2D)"
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${geometryType === "area" ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-muted)]"}`}
                onClick={() => setGeometryType("area")}
              >Area (2D)</button>
              <button
                type="button"
                aria-label="Volume measurement (3D)"
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${geometryType === "volume" ? "bg-[var(--bg)] text-[var(--fg)] shadow-sm" : "text-[var(--fg-muted)]"}`}
                onClick={() => setGeometryType("volume")}
              >Volume (3D)</button>
            </div>
          </div>

          <Button type="submit" variant="primary" className="self-start">
            {editingId ? "Update" : "Save Measurement"}
          </Button>
        </form>
      </Card>

      {/* Saved rooms list */}
      {rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-muted)] flex items-center justify-center mx-auto mb-4 text-[var(--fg-muted)]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold mb-1">No saved measurements yet</h4>
          <p className="text-xs text-[var(--fg-muted)] text-pretty max-w-sm mx-auto">
            Add your first measurement above, or use the Save button on any calculator to store dimensions here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rooms.map((room) => (
            <div key={room.id} className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 card-elevated flex items-start justify-between gap-4">
              <div className="flex-grow min-w-0">
                <h4 className="text-sm font-semibold tracking-tight truncate">{room.name}</h4>
                <p className="text-xs text-[var(--fg-muted)] mt-1 tabular-nums">
                  {room.length} × {room.width}{room.height ? ` × ${room.height}` : ""} ft
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-[var(--bg-muted)] font-mono text-[10px]">{room.geometryType}</span>
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => handleEdit(room)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors" aria-label={`Edit ${room.name}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button type="button" onClick={() => handleDelete(room.id)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--error)] transition-colors" aria-label={`Delete ${room.name}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
