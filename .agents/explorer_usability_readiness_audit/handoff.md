# Handoff Report: Usability, Core Web Vitals, and Mobile Retention Audit

## 1. Observations

### 1.1. Mobile Layout Responsiveness & SVG Canvas Clipping
On narrow viewports (simulate 375px), 6 of the interactive designers and the flagship visual utility (`ScopeBinder.tsx`) render diagrams inside SVGs with fixed pixel `width`/`height` attributes. Combined with `overflow-hidden` containers, this completely clips the layout viewports without horizontal scroll, rendering major portions of the canvas invisible on mobile:
*   **ClosetDesigner.tsx (Lines 198, 393):**
    ```typescript
    const canvasWidth = 500;
    ...
    <svg width={canvasWidth} height={canvasHeight} className="overflow-visible" ...>
    ```
*   **DeckDesigner.tsx (Lines 114, 145):**
    ```typescript
    const canvasWidth = 380;
    ...
    <svg width={canvasWidth} height={canvasHeight} className="overflow-visible" ...>
    ```
*   **FramingDesigner.tsx (Lines 155, 265):**
    ```typescript
    const canvasWidth = 600;
    ...
    <svg width={canvasWidth} height={canvasHeight} className="overflow-visible" ...>
    ```
*   **HardscapeDesigner.tsx (Lines 171):**
    ```typescript
    <svg width={CANVAS_SIZE} height={CANVAS_SIZE} role="img" aria-label="Hardscape Layout Canvas" className="overflow-visible">
    ```
    *Where `CANVAS_SIZE` is defined as `500` (Line 29).*
*   **TileDesigner.tsx (Lines 62, 177):**
    ```typescript
    const canvasWidth = 360;
    ...
    <svg width={canvasWidth} height={canvasHeight} className="overflow-visible" ...>
    ```
*   **WainscotingDesigner.tsx (Lines 178, 278):**
    ```typescript
    const canvasWidth = 500;
    ...
    <svg width={canvasWidth} height={canvasHeight} className="overflow-visible" ...>
    ```
*   **ScopeBinder.tsx (Lines 134, 194):**
    ```typescript
    const canvasW = Math.max(320, Math.min(600, (room.lengthFt + 4) * sc));
    ...
    <svg width={canvasW} height={canvasH} ...>
    ```
    *(When `room.lengthFt` exceeds 20, `canvasW` is clipped by the `overflow-hidden` container).*

*Contrast this with the fully responsive designs that scale gracefully:*
*   **ConcreteSlabDesigner.tsx (Lines 157, 192):**
    ```typescript
    <svg viewBox="0 0 480 400" className="w-full h-auto" ...>
    <svg viewBox="0 0 460 80" className="w-full h-auto" ...>
    ```
*   **StairStringerDesigner.tsx (Lines 184-187):**
    ```typescript
    <svg viewBox="0 0 600 400" className="w-full h-auto max-w-[560px]">
    ```

---

### 1.2. Touch Target Accessibility Issues (< 44x44px)
Numerous tap elements are way below the 44x44px minimum recommendation for touch interaction on mobile:
*   **CostEstimatorWidget.tsx Price Inputs (Lines 164-166):**
    ```typescript
    className="w-16 h-7 text-right px-1.5 ..."
    ```
    *Visual height `h-7` is 28px — too small for easy tap.*
*   **CostEstimatorWidget.tsx Labor Toggles (Lines 200-215):**
    ```typescript
    className={`px-2.5 py-1 ...`}
    ```
    *Visual height is under 30px.*
*   **CostEstimatorWidget.tsx Hourly Rate & Hours Inputs (Lines 255, 267):**
    ```typescript
    className="w-full h-9 pl-6 pr-3 ..."
    ```
    *Visual height `h-9` is 36px.*
*   **Standard Designer Spec Inputs (e.g. FramingDesigner.tsx Lines 460, 471):**
    ```typescript
    className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2.5 py-1 text-xs ..."
    ```
    *Visual height is around 24-28px.*
*   **Interactive dimension arrows in SVG canvases (e.g. ConcreteSlabDesigner.tsx Lines 59-68):**
    ```typescript
    <g onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} stroke="#1c1917" strokeWidth="1.5" />
      ...
    </g>
    ```
    *No transparent background overlay. Users must tap exactly on the 1.5-pixel-wide line or small text.*
*   **Form Delete Buttons (e.g. FramingDesigner.tsx Line 629):**
    ```typescript
    className="text-red-500 hover:text-red-700 font-bold transition-colors cursor-pointer"
    ```
    *Raw text without padding has a tiny tap target size (~16px height).*

---

### 1.3. Tap Target Precision in Photo-to-Measurement Simulator
*   **MeasureFromPhoto.tsx (Line 187-190):**
    ```typescript
    // Check click proximity to first vertex to auto-close polygon
    if (polygonPoints.length >= 3) {
      const distToStart = calculateDistance({ x: clickX, y: clickY }, polygonPoints[0]);
      if (distToStart < 12) {
        setIsClosed(true);
        return;
      }
    }
    ```
    *While 12px distance threshold works on a full 600px wide screen, the canvas visual size scales down to 300px on mobile via `max-w-full h-auto` (Line 250). The visual distance threshold shrinks to a mere 6px on screen. Tapping within a 6px target to close a polygon on a touchscreen is practically impossible.*

---

### 1.4. CostEstimatorWidget Labor Hour Sync Bug
*   **CostEstimatorWidget.tsx (Lines 40-42, 47-54):**
    ```typescript
    const [laborHours, setLaborHours] = useState<number>(() => {
      return getMaterialPrice("labor_hours", defaultLaborHours);
    });
    ```
    *The `laborHours` state is initialized on mount and never synced to the parent's `defaultLaborHours` prop on re-render. If the user resizes the project size (e.g., from a 10x12 slab to 30x40), `defaultLaborHours` prop updates, but the widget's local `laborHours` state stays at the old value. Consequently, the labor cost and grand total become outdated and incorrect.*

---

### 1.5. Input Clamping & Editing Friction
*   **FramingDesigner.tsx (Lines 459, 470, 493):**
    ```typescript
    onChange={e => setWallLengthFt(Math.max(4, Number(e.target.value)))}
    onChange={e => setWallHeightFt(Math.max(6, Number(e.target.value)))}
    onChange={e => setWastePercent(Math.max(0, Number(e.target.value)))}
    ```
    *Clamping values inside the `onChange` handler using `Math.max` immediately overrides the input state as the user types. If a user tries to change the wall height to `8` by clearing the field (making it empty), `Number(e.target.value)` evaluates to `0`, which immediately gets clamped to `6`. The user cannot clear the field or type any value smaller than the minimum.*
*   **CostEstimatorWidget.tsx (Lines 57-61):**
    ```typescript
    const handlePriceChange = (key: string, valStr: string) => {
      const val = parseFloat(valStr) || 0;
      setPrices((prev) => ({ ...prev, [key]: val }));
      ...
    };
    ```
    *If a user deletes the input contents to type a new price, `parseFloat("") || 0` immediately replaces it with `0`. The user cannot backspace to clear the field.*

---

### 1.6. Double URL-Encoding
*   **FramingDesigner.tsx (Lines 83-91):**
    ```typescript
    setUrlParams({
      ...
      ops: encodeURIComponent(JSON.stringify(openings)),
    });
    ```
*   **HardscapeDesigner.tsx (Line 70):**
    ```typescript
    setUrlParams({ ...pw, pd, el: encodeURIComponent(JSON.stringify(elements)) });
    ```
    *`setUrlParams` in `urlState.ts` uses `URLSearchParams.set`, which already encodes query values automatically. Encoding it beforehand results in double URL-encoding (e.g., `[` becomes `%5B` which becomes `%255B`). This creates bloated, unreadable URLs in the browser.*

---

### 1.7. Broken Share URL / State Restoration Loops
*   **ScopeBinder.tsx (Lines 62-67):**
    ```typescript
    const [lengthFt, setLengthFt] = useState(12);
    const [widthFt, setWidthFt] = useState(10);
    ...
    ```
    *`ScopeBinder` generates search query parameters on share (e.g. `?l=15&w=12&h=9`), but completely lacks code to read or apply these parameters on mount. When someone navigates to a shared link, it resets to default values.*
*   **ClosetDesigner.tsx:**
    *Completely lacks state-to-URL synchronization. Layout configurations cannot be shared via URL, breaking back-navigation and bookmarking loops.*
*   **MaterialWise.tsx (Lines 593-601):**
    *Lacks dynamic URL state synchronization. Changes to weights/materials are lost on page refresh. Copying the link also lacks a visual clipboard confirmation/toast.*

---

## 2. Logic Chain

1.  **Fixed-width SVGs (`width={canvasWidth}`) + `overflow-hidden` wrappers** $\rightarrow$ Elements exceed the parent boundaries on mobile (375px width minus padding leaves ~295px width) $\rightarrow$ The canvas visual layout is cropped, hiding crucial components and dimensions $\rightarrow$ **Fails Mobile Layout Responsiveness.**
2.  **Input fields with `py-1` (height 28px), toggles with `py-1`, raw button texts, and thin SVG lines (`strokeWidth="1.5"`) without padding rects** $\rightarrow$ User tap coordinates must be extremely precise $\rightarrow$ High tap error rates on touchscreen devices $\rightarrow$ **Fails Touch Target Accessibility (min 44x44px).**
3.  **Proximity check threshold of 12px on an auto-scaled canvas** $\rightarrow$ Canvas is visually scaled down by 50% on mobile $\rightarrow$ Visual proximity threshold drops to 6 physical pixels $\rightarrow$ User cannot visually aim or tap within 6px accuracy $\rightarrow$ **Prevents users from closing polygons in Photo-to-Measurement on mobile.**
4.  **Initializing `laborHours` state once on mount using the initial prop value, and never updating it on prop changes** $\rightarrow$ Resizing project dimensions changes the calculated labor hours, but `laborHours` state does not update $\rightarrow$ Contractor labor costs and grand totals displayed are outdated $\rightarrow$ **Functional discrepancy in Budget Customizer.**
5.  **Running `Math.max` clamping or `parseFloat || 0` directly on `onChange` handlers** $\rightarrow$ Deleting or backspacing values triggers immediate resets to minimums/zeros $\rightarrow$ User cannot clear a text box or start typing a multi-digit number $\rightarrow$ **High input entry friction.**
6.  **Calling `encodeURIComponent` before passing values to `URLSearchParams`** $\rightarrow$ Double encoding occurs in browser search parameters $\rightarrow$ Share URLs are excessively long and cluttered.
7.  **No `getUrlParam` initialization in `ScopeBinder` or `ClosetDesigner`** $\rightarrow$ Share URLs are either not restored on visit, or cannot be generated $\rightarrow$ **Breaks sharing and back-navigation restore loops.**

---

## 3. Caveats
*   The audit was conducted via read-only source-code inspection. Dynamic performance measurements (like actual LCP or CLS scores) were not recorded under network throttling.
*   Assumed a target mobile width of 375px (standard portrait viewport for iPhone SE/12 mini).

---

## 4. Conclusion & Actionable Recommendations

The HomePlanningHub codebase is functional, but contains significant layout, responsiveness, and usability bottlenecks on mobile devices that will impact mobile retention and user experience. 

### Recommended Fixes:

#### Recommendation 1: Fix SVG Responsiveness in Designers & Utilities
Modify fixed-width SVGs in `ClosetDesigner`, `DeckDesigner`, `FramingDesigner`, `HardscapeDesigner`, `TileDesigner`, `WainscotingDesigner`, and `ScopeBinder` to use `viewBox` and `w-full h-auto` with a CSS `max-width` limit.
*Example Proposed Diff for `DeckDesigner.tsx` layout wrapper:*
```diff
- <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg w-full flex justify-center py-6 overflow-hidden">
-   <svg width={canvasWidth} height={canvasHeight} className="overflow-visible" role="img" aria-label="Deck Blueprint Layout Graph">
+ <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg w-full flex justify-center py-6 overflow-hidden">
+   <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-auto max-w-[380px] overflow-visible" role="img" aria-label="Deck Blueprint Layout Graph">
```

#### Recommendation 2: Resolve input and button touch targets
*   Set a minimum height of `h-11` (44px) or increase padding (e.g. `py-2.5 text-sm`) for all inputs, select dropdowns, and button controls on mobile.
*   In `ConcreteSlabDesigner.tsx`'s `DimensionArrow`, render an invisible thick line overlay to capture touch events easily:
    ```xml
    <g onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} stroke="transparent" strokeWidth="24" />
      <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} stroke="#1c1917" strokeWidth="1.5" />
      ...
    </g>
    ```

#### Recommendation 3: Scale distance threshold for polygon closing
In `MeasureFromPhoto.tsx`, dynamically adjust the threshold based on the actual visual scaling of the canvas:
```typescript
const canvas = canvasRef.current;
const rect = canvas ? canvas.getBoundingClientRect() : null;
const visualScale = rect ? (canvas.width / rect.width) : 1;
const distToStart = calculateDistance({ x: clickX, y: clickY }, polygonPoints[0]);
// Scale the 12px visual threshold to internal canvas coordinate space
if (distToStart < (12 * visualScale)) {
  setIsClosed(true);
}
```

#### Recommendation 4: Fix labor hours sync in CostEstimatorWidget
Add a `useEffect` inside `CostEstimatorWidget.tsx` to sync the state when the parent prop changes:
```typescript
useEffect(() => {
  setLaborHours(getMaterialPrice("labor_hours", defaultLaborHours));
}, [defaultLaborHours]);
```

#### Recommendation 5: Postpone input clamping to onBlur
Keep the state as a raw string during input typing (`onChange`), and validate/clamp only when the user leaves the input field (`onBlur`):
```typescript
const [wallLengthInput, setWallLengthInput] = useState(String(wallLengthFt));
// Inside render:
<input
  type="number"
  value={wallLengthInput}
  onChange={e => setWallLengthInput(e.target.value)}
  onBlur={() => {
    const val = Math.max(4, Math.min(40, Number(wallLengthInput) || 12));
    setWallLengthFt(val);
    setWallLengthInput(String(val));
  }}
/>
```

#### Recommendation 6: Fix broken URL restoration in ScopeBinder
Restore state from query params on mount:
```typescript
useEffect(() => {
  if (typeof window !== "undefined") {
    const params = window.location.search;
    if (params) {
      const restored = scopeRoomFromParams(params);
      if (restored) {
        setLengthFt(restored.lengthFt);
        setWidthFt(restored.widthFt);
        setHeightFt(restored.heightFt);
        const doors = restored.openings.find(o => o.type === "door")?.count ?? 0;
        const windows = restored.openings.find(o => o.type === "window")?.count ?? 0;
        setDoorCount(doors);
        setWindowCount(windows);
      }
    }
  }
}, []);
```

---

## 5. Verification Method

### 5.1. Automated Verification
Run the standard unit tests to ensure that all core calculation engines remain valid and passing:
```bash
npm run test
```

### 5.2. Usability & Layout Verification (Manual)
1.  **Responsive Check:** Open Chrome DevTools, toggle device mode, select "iPhone SE" or set custom dimensions to `375px x 667px`. Visit each designer `/calculators/*-designer/` and `/plan/`. Confirm that:
    *   No horizontal page scrollbar appears.
    *   SVG canvases scale down to fit the container bounds rather than getting cropped.
2.  **Labor Hour Sync Verification:** In `/calculators/concrete-slab-designer/`, customize the unit pricing. Resize the slab from `10x12` to `40x40`. Verify that the contractor hours and grand total update automatically in the budget widget.
3.  **URL Restoring Verification:** Go to `/plan/`, adjust room specifications, click "Share This Binder" to copy the URL. Paste it in a new window. Verify that the page loads the exact customized room size (e.g. `15x12x9` with adjusted openings) rather than resetting to `12x10x8`.
