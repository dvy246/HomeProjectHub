export type ClosetRoomMode = "reach-in" | "walk-in-l" | "walk-in-u" | "pantry" | "mudroom" | "garage";

export type ClosetSectionType = "single-hang" | "double-hang" | "shelf" | "drawer" | "shoe-rack" | "hooks" | "cubby" | "heavy-shelf" | "pegboard";

export interface ClosetSection {
  id: string;
  label: string;
  width: number;
  type: ClosetSectionType;
}

export interface ClosetWall {
  id: string;
  label: string;
  width: number;
  sections: ClosetSection[];
}

export interface ClosetLayout {
  mode: ClosetRoomMode;
  wallHeight: number;
  depth: number;
  walls: ClosetWall[];
}

export type ClosetItemType = "rod" | "shelf" | "drawer" | "shoe-shelf" | "hook" | "cubby" | "pegboard";

export interface ClosetItem {
  type: ClosetItemType;
  y: number;
  height: number;
  width: number;
  sectionIndex: number;
  label: string;
  wallId?: string;
}

export interface MaterialLineItem {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  notes?: string;
}

export interface ClosetResults {
  items: ClosetItem[];
  hangingSpaceIn: number;
  shelfAreaSqFt: number;
  drawerCount: number;
  shoeStoragePairs: number;
  materialList: MaterialLineItem[];
  hangerCapacity: number;
  hangerCapacityThick: number;
  totalCost: number;
}

export interface ModeConfig {
  label: string;
  description: string;
  minHeight: number;
  maxHeight: number;
  defaultHeight: number;
  depthOptions: number[];
  defaultDepth: number;
  availableSectionTypes: ClosetSectionType[];
  defaultWalls: { label: string; width: number; sections: Omit<ClosetSection, "id">[] }[];
}

const SHELF_THICKNESS = 0.75;
const ROD_DIAMETER = 1;
const DRAWER_HEIGHT = 18;
const SHOE_SHELF_SPACING = 8;
const SHELF_SPACING = 14;
const CUBBY_HEIGHT = 12;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function assertNever(x: never): never {
  throw new Error(`unexpected section type: ${x}`);
}

function getSingleHangItems(width: number, wallHeight: number, _depth: number, idx: number): ClosetItem[] {
  const topShelfY = wallHeight - SHELF_THICKNESS;
  const rodY = wallHeight >= 74 ? 66 : Math.max(42, wallHeight - 8);
  return [
    { type: "shelf", y: topShelfY, height: SHELF_THICKNESS, width, sectionIndex: idx, label: "Top Shelf" },
    { type: "rod", y: rodY, height: ROD_DIAMETER, width, sectionIndex: idx, label: "Single Hang Rod" },
  ];
}

function getDoubleHangItems(width: number, wallHeight: number, _depth: number, idx: number): ClosetItem[] {
  const topShelfY = wallHeight - SHELF_THICKNESS;
  const upperRodY = wallHeight >= 84 ? 78 : Math.max(54, wallHeight - 7);
  const lowerRodY = 42;
  const midShelfY = lowerRodY + ROD_DIAMETER + 1;
  const items: ClosetItem[] = [
    { type: "shelf", y: topShelfY, height: SHELF_THICKNESS, width, sectionIndex: idx, label: "Top Shelf" },
    { type: "rod", y: upperRodY, height: ROD_DIAMETER, width, sectionIndex: idx, label: "Upper Rod" },
  ];
  if (wallHeight >= 54) {
    items.push({ type: "shelf", y: midShelfY, height: SHELF_THICKNESS, width, sectionIndex: idx, label: "Mid Shelf" });
  }
  items.push({ type: "rod", y: lowerRodY, height: ROD_DIAMETER, width, sectionIndex: idx, label: "Lower Rod" });
  return items;
}

function getShelfItems(width: number, wallHeight: number, _depth: number, idx: number): ClosetItem[] {
  const items: ClosetItem[] = [];
  const shelvesCount = Math.max(1, Math.floor(wallHeight / SHELF_SPACING));
  for (let i = 0; i < shelvesCount; i++) {
    const y = wallHeight - (i + 1) * SHELF_SPACING;
    if (y < 0) break;
    items.push({ type: "shelf", y, height: SHELF_THICKNESS, width, sectionIndex: idx, label: `Shelf ${i + 1}` });
  }
  return items;
}

function getDrawerItems(width: number, wallHeight: number, _depth: number, idx: number): ClosetItem[] {
  const items: ClosetItem[] = [];
  const maxDrawersHeight = Math.min(42, wallHeight);
  const drawersCount = Math.max(1, Math.floor(maxDrawersHeight / DRAWER_HEIGHT));
  const stackHeight = drawersCount * DRAWER_HEIGHT;

  for (let i = 0; i < drawersCount; i++) {
    const y = i * DRAWER_HEIGHT;
    items.push({ type: "drawer", y, height: DRAWER_HEIGHT, width, sectionIndex: idx, label: `Drawer ${drawersCount - i}` });
  }

  const remainingHeight = wallHeight - stackHeight;
  const shelvesCount = Math.floor(remainingHeight / SHELF_SPACING);
  for (let i = 0; i < shelvesCount; i++) {
    const y = stackHeight + (i + 1) * SHELF_SPACING;
    if (y > wallHeight - SHELF_THICKNESS) break;
    items.push({ type: "shelf", y, height: SHELF_THICKNESS, width, sectionIndex: idx, label: `Shelf above Drawers ${i + 1}` });
  }

  const topShelfY = wallHeight - SHELF_THICKNESS;
  if (topShelfY >= stackHeight && !items.some(item => Math.abs(item.y - topShelfY) < 2)) {
    items.push({ type: "shelf", y: topShelfY, height: SHELF_THICKNESS, width, sectionIndex: idx, label: "Top Shelf" });
  }

  return items;
}

function getShoeRackItems(width: number, wallHeight: number, _depth: number, idx: number): ClosetItem[] {
  const items: ClosetItem[] = [];
  const shelvesCount = Math.max(1, Math.floor(wallHeight / SHOE_SHELF_SPACING));
  for (let i = 0; i < shelvesCount; i++) {
    const y = wallHeight - (i + 1) * SHOE_SHELF_SPACING;
    if (y < 0) break;
    items.push({ type: "shoe-shelf", y, height: SHELF_THICKNESS, width, sectionIndex: idx, label: `Shoe Shelf ${i + 1}` });
  }
  return items;
}

function getHookItems(width: number, wallHeight: number, _depth: number, idx: number): ClosetItem[] {
  const items: ClosetItem[] = [];
  const hooksPerRow = Math.max(1, Math.floor(width / 6));
  const rows = Math.max(1, Math.floor(wallHeight / 14));
  for (let r = 0; r < rows; r++) {
    const y = wallHeight - (r + 1) * 14;
    if (y < 0) break;
    items.push({ type: "hook", y, height: 2, width, sectionIndex: idx, label: `Hook Row ${r + 1} (${hooksPerRow} hooks)` });
  }
  return items;
}

function getCubbyItems(width: number, wallHeight: number, depth: number, idx: number): ClosetItem[] {
  const items: ClosetItem[] = [];
  const rows = Math.max(1, Math.floor(wallHeight / CUBBY_HEIGHT));
  for (let r = 0; r < rows; r++) {
    const y = r * CUBBY_HEIGHT;
    items.push({ type: "cubby", y, height: CUBBY_HEIGHT, width, sectionIndex: idx, label: `Cubby ${rows - r}` });
  }
  return items;
}

function getHeavyShelfItems(width: number, wallHeight: number, _depth: number, idx: number): ClosetItem[] {
  const items: ClosetItem[] = [];
  const shelvesCount = Math.max(1, Math.floor(wallHeight / 18));
  for (let i = 0; i < shelvesCount; i++) {
    const y = wallHeight - (i + 1) * 18;
    if (y < 0) break;
    items.push({ type: "shelf", y, height: SHELF_THICKNESS * 2, width, sectionIndex: idx, label: `Heavy Shelf ${i + 1}` });
  }
  return items;
}

function getPegboardItems(width: number, wallHeight: number, _depth: number, idx: number): ClosetItem[] {
  const items: ClosetItem[] = [];
  const yOffset = 6;
  items.push({ type: "pegboard", y: yOffset, height: wallHeight - yOffset - SHELF_THICKNESS, width, sectionIndex: idx, label: "Pegboard Panel" });
  const topShelfY = wallHeight - SHELF_THICKNESS;
  items.push({ type: "shelf", y: topShelfY, height: SHELF_THICKNESS, width, sectionIndex: idx, label: "Top Shelf" });
  return items;
}

function getWallItems(wall: ClosetWall, wallHeight: number, depth: number): ClosetItem[] {
  const wallItems: ClosetItem[] = [];
  let hangingSpaceIn = 0;
  let totalShelfAreaIn = 0;
  let drawerCount = 0;

  for (let i = 0; i < wall.sections.length; i++) {
    const sec = wall.sections[i];
    const w = clamp(sec.width, 6, wall.width);
    let items: ClosetItem[];

    switch (sec.type) {
      case "single-hang":
        items = getSingleHangItems(w, wallHeight, depth, i);
        hangingSpaceIn += w;
        break;
      case "double-hang":
        items = getDoubleHangItems(w, wallHeight, depth, i);
        hangingSpaceIn += w * 2;
        break;
      case "shelf":
        items = getShelfItems(w, wallHeight, depth, i);
        break;
      case "drawer":
        items = getDrawerItems(w, wallHeight, depth, i);
        break;
      case "shoe-rack":
        items = getShoeRackItems(w, wallHeight, depth, i);
        break;
      case "hooks":
        items = getHookItems(w, wallHeight, depth, i);
        break;
      case "cubby":
        items = getCubbyItems(w, wallHeight, depth, i);
        break;
      case "heavy-shelf":
        items = getHeavyShelfItems(w, wallHeight, depth, i);
        break;
      case "pegboard":
        items = getPegboardItems(w, wallHeight, depth, i);
        break;
      default:
        assertNever(sec.type);
    }

    for (const item of items) {
      if (item.type === "shelf" || item.type === "shoe-shelf") {
        totalShelfAreaIn += item.width * depth;
      }
      if (item.type === "drawer") {
        drawerCount++;
      }
      item.wallId = wall.id;
    }

    wallItems.push(...items);
  }

  return wallItems;
}

export function calculateCloset(layout: ClosetLayout): ClosetResults {
  const safeHeight = clamp(layout.wallHeight, 48, 120);
  const safeDepth = clamp(layout.depth, 12, 30);

  let allItems: ClosetItem[] = [];
  let hangingSpaceIn = 0;
  let totalShelfAreaIn = 0;
  let drawerCount = 0;

  for (const wall of layout.walls) {
    const wallItems = getWallItems(wall, safeHeight, safeDepth);
    allItems = allItems.concat(wallItems);

    for (const sec of wall.sections) {
      const w = clamp(sec.width, 6, wall.width);
      if (sec.type === "single-hang") hangingSpaceIn += w;
      else if (sec.type === "double-hang") hangingSpaceIn += w * 2;
    }
    for (const item of wallItems) {
      if (item.type === "shelf" || item.type === "shoe-shelf") {
        totalShelfAreaIn += item.width * safeDepth;
      }
      if (item.type === "drawer") drawerCount++;
    }
  }

  const shelfAreaSqFt = totalShelfAreaIn / 144;
  const hangerCapacity = Math.floor(hangingSpaceIn / 1);
  const hangerCapacityThick = Math.floor(hangingSpaceIn / 1.5);

  let shoePairs = 0;
  for (const item of allItems) {
    if (item.type === "shoe-shelf") {
      shoePairs += Math.floor((item.width / 12) * 2);
    }
  }

  const totalSections = layout.walls.reduce((sum, w) => sum + w.sections.length, 0);

  const materialList: MaterialLineItem[] = [];
  const rodCount = allItems.filter(i => i.type === "rod").length;
  if (rodCount > 0) {
    materialList.push({
      name: "Closet Rod & Flanges",
      quantity: rodCount, unit: "pcs", pricePerUnit: 12,
      notes: `Steel closet rod, 1" diameter`,
    });
  }

  const shelfCount = allItems.filter(i => i.type === "shelf" || i.type === "shoe-shelf").length;
  if (shelfCount > 0) {
    const shelfSqFt = Math.ceil(totalShelfAreaIn / 144);
    materialList.push({
      name: "Shelving Board",
      quantity: shelfSqFt, unit: "sq ft", pricePerUnit: 3.5,
      notes: `${safeDepth}" deep shelving material`,
    });
  }

  if (drawerCount > 0) {
    const drawerUnits = Math.ceil(drawerCount / 2);
    materialList.push({
      name: "Drawer Units (2-drawer)",
      quantity: drawerUnits, unit: "pcs", pricePerUnit: 45,
      notes: `Stackable ${safeDepth}" deep drawer units`,
    });
  }

  if (totalSections > 0) {
    const standardsPairs = totalSections * 2;
    materialList.push({
      name: "Wall Standards & Brackets",
      quantity: standardsPairs, unit: "pairs", pricePerUnit: 8,
      notes: "Adjustable shelving track system",
    });
  }

  if (hangingSpaceIn > 0) {
    materialList.push({
      name: "Wood / Velvet Hangers",
      quantity: Math.min(hangerCapacity, 100), unit: "pcs", pricePerUnit: 1.5,
      notes: "24-pack bulk (thin profile)",
    });
  }

  const hookCount = allItems.filter(i => i.type === "hook").length;
  if (hookCount > 0) {
    materialList.push({
      name: "Wall Hooks / Coat Hooks",
      quantity: hookCount, unit: "rows", pricePerUnit: 8,
      notes: "Heavy-duty wall hooks",
    });
  }

  const pegboardCount = allItems.filter(i => i.type === "pegboard").length;
  if (pegboardCount > 0) {
    const panelSqFt = Math.ceil((safeHeight * layout.walls.reduce((max, w) => Math.max(max, w.width), 0)) / 144);
    materialList.push({
      name: "Pegboard Panels",
      quantity: Math.max(1, panelSqFt), unit: "sq ft", pricePerUnit: 2.5,
      notes: "4x8 perforated hardboard",
    });
  }

  const totalCost = materialList.reduce((sum, item) => sum + item.quantity * item.pricePerUnit, 0);

  return {
    items: allItems,
    hangingSpaceIn,
    shelfAreaSqFt: Math.round(shelfAreaSqFt * 100) / 100,
    drawerCount,
    shoeStoragePairs: shoePairs,
    materialList,
    hangerCapacity,
    hangerCapacityThick,
    totalCost: Math.round(totalCost),
  };
}

export function decimalToFraction(val: number): string {
  if (isNaN(val) || val <= 0) return '0"';
  const whole = Math.floor(val);
  const remainder = val - whole;
  if (remainder < 0.03125) return whole > 0 ? `${whole}"` : '0"';
  const sixteenths = Math.round(remainder * 16);
  if (sixteenths === 0) return whole > 0 ? `${whole}"` : '0"';
  if (sixteenths === 16) return `${whole + 1}"`;
  let num = sixteenths;
  let den = 16;
  if (num % 8 === 0) { num /= 8; den /= 8; }
  else if (num % 4 === 0) { num /= 4; den /= 4; }
  else if (num % 2 === 0) { num /= 2; den /= 2; }
  return whole > 0 ? `${whole} ${num}/${den}"` : `${num}/${den}"`;
}

export const MODE_CONFIGS: Record<ClosetRoomMode, ModeConfig> = {
  "reach-in": {
    label: "Standard Reach-In Closet",
    description: "Single-wall closet design with hanging rods, shelves, and drawers. Ideal for bedrooms and hallways.",
    minHeight: 48, maxHeight: 120, defaultHeight: 84,
    depthOptions: [12, 16, 20, 24, 30],
    defaultDepth: 24,
    availableSectionTypes: ["single-hang", "double-hang", "shelf", "drawer", "shoe-rack"],
    defaultWalls: [
      { label: "Main Wall", width: 96, sections: [
        { label: "Double Hang", width: 48, type: "double-hang" },
        { label: "Shelf", width: 24, type: "shelf" },
        { label: "Shoe Rack", width: 24, type: "shoe-rack" },
      ]},
    ],
  },
  "walk-in-l": {
    label: "L-Shape Walk-In Closet",
    description: "Two-wall L-shaped closet layout for larger walk-in spaces. Ideal for master closets.",
    minHeight: 48, maxHeight: 120, defaultHeight: 96,
    depthOptions: [16, 20, 24, 30],
    defaultDepth: 24,
    availableSectionTypes: ["single-hang", "double-hang", "shelf", "drawer", "shoe-rack"],
    defaultWalls: [
      { label: "Long Wall", width: 120, sections: [
        { label: "Double Hang", width: 72, type: "double-hang" },
        { label: "Shoe Rack", width: 48, type: "shoe-rack" },
      ]},
      { label: "Short Wall", width: 72, sections: [
        { label: "Single Hang", width: 36, type: "single-hang" },
        { label: "Drawers", width: 36, type: "drawer" },
      ]},
    ],
  },
  "walk-in-u": {
    label: "U-Shape Walk-In Closet",
    description: "Three-wall U-shaped closet layout for maximum storage. Ideal for luxury master suites.",
    minHeight: 48, maxHeight: 120, defaultHeight: 96,
    depthOptions: [16, 20, 24, 30],
    defaultDepth: 24,
    availableSectionTypes: ["single-hang", "double-hang", "shelf", "drawer", "shoe-rack"],
    defaultWalls: [
      { label: "Left Wall", width: 96, sections: [
        { label: "Double Hang", width: 48, type: "double-hang" },
        { label: "Shelf", width: 24, type: "shelf" },
        { label: "Drawers", width: 24, type: "drawer" },
      ]},
      { label: "Back Wall", width: 120, sections: [
        { label: "Double Hang", width: 72, type: "double-hang" },
        { label: "Shoe Rack", width: 48, type: "shoe-rack" },
      ]},
      { label: "Right Wall", width: 96, sections: [
        { label: "Double Hang", width: 48, type: "double-hang" },
        { label: "Shelf", width: 24, type: "shelf" },
        { label: "Drawers", width: 24, type: "drawer" },
      ]},
    ],
  },
  pantry: {
    label: "Walk-In Pantry",
    description: "Deep shelving and drawer-based pantry storage for dry goods, small appliances, and bulk items.",
    minHeight: 48, maxHeight: 120, defaultHeight: 84,
    depthOptions: [12, 16, 20, 24],
    defaultDepth: 20,
    availableSectionTypes: ["shelf", "drawer", "cubby", "heavy-shelf"],
    defaultWalls: [
      { label: "Main Wall", width: 72, sections: [
        { label: "Pantry Shelves", width: 48, type: "shelf" },
        { label: "Drawers", width: 24, type: "drawer" },
      ]},
    ],
  },
  mudroom: {
    label: "Mudroom / Entryway",
    description: "Cubbies, hooks, and bench storage for entryway organization. Great for boots, coats, and backpacks.",
    minHeight: 48, maxHeight: 120, defaultHeight: 84,
    depthOptions: [12, 16, 18, 20, 24],
    defaultDepth: 18,
    availableSectionTypes: ["cubby", "hooks", "shelf", "shoe-rack"],
    defaultWalls: [
      { label: "Main Wall", width: 72, sections: [
        { label: "Cubbies", width: 36, type: "cubby" },
        { label: "Hooks", width: 36, type: "hooks" },
      ]},
    ],
  },
  garage: {
    label: "Garage Workshop",
    description: "Heavy-duty shelving and pegboard storage for tools, equipment, and garage organization.",
    minHeight: 48, maxHeight: 120, defaultHeight: 96,
    depthOptions: [16, 20, 24, 30],
    defaultDepth: 24,
    availableSectionTypes: ["heavy-shelf", "pegboard", "shelf"],
    defaultWalls: [
      { label: "Main Wall", width: 96, sections: [
        { label: "Pegboard", width: 48, type: "pegboard" },
        { label: "Heavy Shelves", width: 48, type: "heavy-shelf" },
      ]},
    ],
  },
};
