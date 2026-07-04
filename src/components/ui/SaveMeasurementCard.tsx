import { Input } from "./Input";
import { Button } from "./Button";
import { Card } from "./Card";
import type { SavedRoom } from "../../lib/storage";

interface Props {
  roomName: string;
  onRoomNameChange: (name: string) => void;
  onSave: (e: React.FormEvent) => void;
  successMessage: string;
  savedRooms: SavedRoom[];
  onApplyRoom: (room: SavedRoom) => void;
  heading?: string;
  saveLabel?: string;
  placeholder?: string;
  projectsLabel?: string;
  showDimensions?: boolean;
}

export default function SaveMeasurementCard({
  roomName,
  onRoomNameChange,
  onSave,
  successMessage,
  savedRooms,
  onApplyRoom,
  heading = "Save Measurement",
  saveLabel = "Save",
  placeholder = "e.g. Backyard Patio",
  projectsLabel = "Saved Projects:",
  showDimensions = false,
}: Props) {
  return (
    <Card>
      <h3 className="text-sm font-semibold tracking-tight mb-4">{heading}</h3>
      <form onSubmit={onSave} className="flex gap-2 items-end">
        <div className="flex-grow">
          <Input label="Project name" name="roomName" type="text" value={roomName} onChange={(e) => onRoomNameChange(e.target.value)} placeholder={placeholder} required />
        </div>
        <Button type="submit" variant="secondary" className="h-10">{saveLabel}</Button>
      </form>
      {successMessage && (
        <p className="text-xs text-[var(--success)] font-medium mt-2 animate-fade-in-up" role="status">{successMessage}</p>
      )}
      <p className="text-[10px] text-[var(--fg-muted)] mt-2.5 leading-relaxed">
        ℹ️ Measurements are stored locally on this device. Using Private/Incognito browsing or clearing browser cache will delete saved items.
      </p>
      {savedRooms.length > 0 && (
        <div className="border-t border-[var(--border)] pt-4 mt-4">
          <span className="text-xs font-medium text-[var(--fg-muted)] block mb-2">{projectsLabel}</span>
          <div className="flex flex-wrap gap-2">
            {savedRooms.map((room) => (
              <button key={room.id} type="button" onClick={() => onApplyRoom(room)} className="text-xs px-2.5 py-1.5 rounded-md bg-[var(--bg-muted)] border border-[var(--border)] hover:border-[var(--border-hover)] text-[var(--fg-secondary)] font-medium transition-colors" aria-label={`Load saved: ${room.name}`}>
                {room.name}{showDimensions ? ` (${room.length}\u00d7${room.width})` : ""}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
