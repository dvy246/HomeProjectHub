import React, { useState, useEffect, useRef } from "react";
import { calculateDistance, calculateScale, calculatePolygonArea, calculatePolygonPerimeter, convertAreaToPhysical, convertLengthToPhysical, type Point2D } from "../../lib/measureEngine";
import { Card } from "../ui/Card";
import { useI18n } from "../i18n/I18nProvider";
import { withI18n } from "../i18n/withI18n";

function MeasureFromPhoto() {
  const { t } = useI18n();

  // Image states
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");

  // Tools & math states
  const [activeTool, setActiveTool] = useState<"scale" | "trace">("scale");
  const [scalePoints, setScalePoints] = useState<Point2D[]>([]);
  const [scaleInputLength, setScaleInputLength] = useState<string>("8");
  const [scaleInputUnit, setScaleInputUnit] = useState<"ft" | "in">("ft");
  const [scalePixelsPerInch, setScalePixelsPerInch] = useState<number>(0);

  const [polygonPoints, setPolygonPoints] = useState<Point2D[]>([]);
  const [isClosed, setIsClosed] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Auto calculate scale when scalePoints or inputs change
  useEffect(() => {
    if (scalePoints.length === 2) {
      const pxDist = calculateDistance(scalePoints[0], scalePoints[1]);
      const length = parseFloat(scaleInputLength) || 0;
      const scale = calculateScale(pxDist, length, scaleInputUnit);
      setScalePixelsPerInch(scale);
    } else {
      setScalePixelsPerInch(0);
    }
  }, [scalePoints, scaleInputLength, scaleInputUnit]);

  // Canvas Redraw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      // Fit image inside canvas size: 600x400
      const scale = Math.min(600 / image.width, 400 / image.height);
      const w = image.width * scale;
      const h = image.height * scale;
      const x = (600 - w) / 2;
      const y = (400 - h) / 2;

      ctx.drawImage(image, x, y, w, h);
    } else {
      // Draw upload placeholder instructions
      ctx.fillStyle = "var(--fg-muted)";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Upload a floor plan, blueprint, or flat yard image to begin", 300, 200);
    }

    // 1. Draw Scale Calibration Line
    if (scalePoints.length > 0) {
      ctx.fillStyle = "#ea580c"; // safety orange
      ctx.strokeStyle = "#ea580c";
      ctx.lineWidth = 2;

      // Draw dots
      scalePoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });

      // Draw dashed line
      if (scalePoints.length === 2) {
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(scalePoints[0].x, scalePoints[0].y);
        ctx.lineTo(scalePoints[1].x, scalePoints[1].y);
        ctx.stroke();
        ctx.setLineDash([]); // reset line dash

        // Draw distance tag
        const midX = (scalePoints[0].x + scalePoints[1].x) / 2;
        const midY = (scalePoints[0].y + scalePoints[1].y) / 2;
        ctx.fillStyle = "var(--bg)";
        ctx.strokeStyle = "var(--border-strong)";
        ctx.beginPath();
        ctx.rect(midX - 30, midY - 10, 60, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "var(--fg)";
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${scaleInputLength} ${scaleInputUnit}`, midX, midY + 4);
      }
    }

    // 2. Draw Polygon Tracing Boundary
    if (polygonPoints.length > 0) {
      ctx.fillStyle = "rgba(234, 88, 12, 0.15)"; // semi-translucent accent fill
      ctx.strokeStyle = "#f97316"; // accent orange stroke
      ctx.lineWidth = 1.5;

      // Draw connecting lines
      ctx.beginPath();
      ctx.moveTo(polygonPoints[0].x, polygonPoints[0].y);
      for (let i = 1; i < polygonPoints.length; i++) {
        ctx.lineTo(polygonPoints[i].x, polygonPoints[i].y);
      }

      if (isClosed) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();

      // Draw point markers
      polygonPoints.forEach((p, idx) => {
        ctx.fillStyle = idx === 0 ? "#ea580c" : "#f97316"; // first dot is darker orange
        ctx.beginPath();
        ctx.arc(p.x, p.y, idx === 0 ? 6 : 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, [image, imageLoaded, scalePoints, polygonPoints, isClosed, scaleInputLength, scaleInputUnit]);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImageLoaded(true);
        // Reset states on new upload
        setScalePoints([]);
        setPolygonPoints([]);
        setIsClosed(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Canvas Click Handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;


    if (activeTool === "scale") {
      if (scalePoints.length < 2) {
        setScalePoints([...scalePoints, { x: clickX, y: clickY }]);
      } else {
        // Reset to first click if 2 points already set
        setScalePoints([{ x: clickX, y: clickY }]);
      }
    } else if (activeTool === "trace") {
      if (isClosed) {
        // Reset tracing if already closed and clicked again
        setPolygonPoints([{ x: clickX, y: clickY }]);
        setIsClosed(false);
        return;
      }

      // Check click proximity to first vertex to auto-close polygon
      if (polygonPoints.length >= 3) {
        const distToStart = calculateDistance({ x: clickX, y: clickY }, polygonPoints[0]);
        if (distToStart < (12 * scaleX)) {
          setIsClosed(true);
          return;
        }
      }

      setPolygonPoints([...polygonPoints, { x: clickX, y: clickY }]);
    }
  };

  // Clear/Reset Methods
  const clearScale = () => {
    setScalePoints([]);
    setScalePixelsPerInch(0);
  };

  const clearTracing = () => {
    setPolygonPoints([]);
    setIsClosed(false);
  };

  const resetAll = () => {
    setImage(null);
    setImageLoaded(false);
    setFileName("");
    clearScale();
    clearTracing();
  };

  // Compute scale-corrected parameters
  const rawArea = calculatePolygonArea(polygonPoints);
  const rawPerim = calculatePolygonPerimeter(polygonPoints, isClosed);

  const physicalAreaSqFt = scalePixelsPerInch > 0 ? convertAreaToPhysical(rawArea, scalePixelsPerInch) : 0;
  const physicalPerimFt = scalePixelsPerInch > 0 ? convertLengthToPhysical(rawPerim, scalePixelsPerInch) : 0;

  // Prefill length/width values by taking square root of physicalArea
  const derivedDimensionSide = Math.sqrt(physicalAreaSqFt);
  const derivedSideString = derivedDimensionSide > 0 ? derivedDimensionSide.toFixed(2) : "0";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
      
      {/* Visual Canvas Display Column */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] p-4 flex flex-col items-center relative select-none">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">
              HTML5 Canvas Area Estimator & Scale Calibrator
            </span>
            <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/5 px-2 py-0.5 rounded border border-[var(--accent)]/10 font-bold capitalize">
              {fileName ? fileName : "No Image Loaded"}
            </span>
          </div>

          {/* Interactive Canvas */}
          <div className="bg-[var(--bg-inset)] border border-[var(--border)] rounded-lg w-full flex justify-center py-4 overflow-hidden relative cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onClick={handleCanvasClick}
              className="max-w-full h-auto bg-stone-900/5 dark:bg-stone-900/30 rounded"
            />
          </div>

          {/* Canvas Actions Controls */}
          {image && (
            <div className="w-full flex justify-between items-center mt-3 pt-3 border-t border-[var(--border)] no-print">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTool("scale")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded border transition-colors ${activeTool === "scale" ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]" : "bg-[var(--bg-subtle)] text-[var(--fg-secondary)] border-[var(--border)] hover:bg-[var(--bg-muted)]"}`}
                >
                  1. Set Scale Line
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool("trace")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded border transition-colors ${activeTool === "trace" ? "bg-[var(--accent)] text-[var(--accent-fg)] border-[var(--accent)]" : "bg-[var(--bg-subtle)] text-[var(--fg-secondary)] border-[var(--border)] hover:bg-[var(--bg-muted)]"}`}
                >
                  2. Trace Perimeter
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearTracing}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded border border-[var(--border)] hover:bg-[var(--bg-muted)] text-[var(--fg-secondary)]"
                >
                  Clear Tracing
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded border border-red-500/20 text-red-500 hover:bg-red-500/5"
                >
                  Reset Image
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Informative Step Guidance */}
        {!image && (
          <div className="border border-dashed border-[var(--border)] rounded-xl p-6 text-center bg-[var(--bg-inset)]/20 no-print">
            <span className="block text-xs font-semibold text-[var(--fg)] mb-2">How to Calibrate & Measure:</span>
            <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] text-[var(--fg-secondary)] leading-relaxed mt-4">
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-[var(--bg-muted)] flex items-center justify-center font-bold text-[var(--fg)] mb-2">1</span>
                <span>Upload a flat blueprint or room floor plan image.</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-[var(--bg-muted)] flex items-center justify-center font-bold text-[var(--fg)] mb-2">2</span>
                <span>Click two ends of a known wall, and enter its length.</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-6 h-6 rounded-full bg-[var(--bg-muted)] flex items-center justify-center font-bold text-[var(--fg)] mb-2">3</span>
                <span>Trace the room corners to compute square footage.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inputs & Measurements Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        
        {/* Upload Control Card */}
        <Card className="no-print">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-3">Load Image File</h3>
          <div className="flex flex-col gap-2">
            <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-[var(--border)] rounded-lg cursor-pointer hover:bg-[var(--bg-muted)] transition-all bg-[var(--bg-inset)]/30">
              <div className="flex flex-col items-center justify-center pt-2 pb-2">
                <svg className="w-6 h-6 text-[var(--fg-muted)] mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                <p className="text-[10px] text-[var(--fg-muted)] font-medium">Click to select photo or floor plan</p>
                <p className="text-[9px] text-[var(--fg-muted)]">PNG, JPG, WebP</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
        </Card>

        {/* Scale Input Settings */}
        {image && (
          <Card className="no-print">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">Scale Calibration</h3>
              {scalePoints.length > 0 && (
                <button type="button" onClick={clearScale} className="text-[9px] text-red-500 font-bold hover:underline">
                  Reset Scale
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-[10px] font-semibold text-[var(--fg-secondary)] mb-1">Known Physical Length</label>
                  <input
                    type="number"
                    value={scaleInputLength}
                    onChange={e => setScaleInputLength(e.target.value)}
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2.5 py-1 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--primary)]"
                    min="1"
                  />
                </div>
                <div className="w-20">
                  <label className="block text-[10px] font-semibold text-[var(--fg-secondary)] mb-1">Unit</label>
                  <select
                    value={scaleInputUnit}
                    onChange={e => setScaleInputUnit(e.target.value as any)}
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--fg)] focus:outline-none focus:border-[var(--primary)]"
                  >
                    <option value="ft">Feet</option>
                    <option value="in">Inches</option>
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-[var(--fg-muted)] leading-relaxed italic">
                {scalePoints.length < 2 
                  ? "👉 Set scale line by clicking two corners of a known wall segment or reference object on the canvas."
                  : `Scale established: ${(scalePixelsPerInch * 12).toFixed(1)} pixels per foot.`
                }
              </p>
            </div>
          </Card>
        )}

        {/* Traced Output Metrics */}
        {image && (
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-3 border-b border-[var(--border)] pb-2">Calculated Dimensions</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
                <span className="text-xs text-[var(--fg-secondary)]">Area (Square Footage)</span>
                <span className="text-sm font-bold tabular-nums text-[var(--accent)]">
                  {scalePixelsPerInch > 0 && polygonPoints.length >= 3
                    ? `${physicalAreaSqFt.toFixed(1)} sq ft`
                    : "Trace boundary first"
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[var(--border)]">
                <span className="text-xs text-[var(--fg-secondary)]">Perimeter Length</span>
                <span className="text-sm font-semibold tabular-nums text-[var(--fg)]">
                  {scalePixelsPerInch > 0 && polygonPoints.length >= 2
                    ? `${physicalPerimFt.toFixed(1)} ft`
                    : "Set scale & trace first"
                  }
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Related Material Calculators quick routing */}
        {physicalAreaSqFt > 0 && (
          <Card className="no-print">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)] mb-3 border-b border-[var(--border)] pb-2">Estimate Materials</h3>
            <div className="flex flex-col gap-2">
              <a
                href={`/calculators/paint/?length=${derivedSideString}&width=${derivedSideString}`}
                className="w-full text-left bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border)] rounded-lg p-2.5 transition-colors flex justify-between items-center"
              >
                <div>
                  <span className="block text-xs font-bold text-[var(--fg)]">Calculate Paint</span>
                  <span className="block text-[9px] text-[var(--fg-muted)]">Prefills room to {derivedSideString}ft &times; {derivedSideString}ft</span>
                </div>
                <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5l7 7-7 7" /></svg>
              </a>
              <a
                href={`/calculators/tile/?length=${derivedSideString}&width=${derivedSideString}`}
                className="w-full text-left bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border)] rounded-lg p-2.5 transition-colors flex justify-between items-center"
              >
                <div>
                  <span className="block text-xs font-bold text-[var(--fg)]">Calculate Floor Tiles</span>
                  <span className="block text-[9px] text-[var(--fg-muted)]">Prefills floor to {derivedSideString}ft &times; {derivedSideString}ft</span>
                </div>
                <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 5l7 7-7 7" /></svg>
              </a>
              <a
                href={`/calculators/concrete/slab/?length=${derivedSideString}&width=${derivedSideString}`}
                className="w-full text-left bg-[var(--bg-subtle)] hover:bg-[var(--bg-muted)] border border-[var(--border)] rounded-lg p-2.5 transition-colors flex justify-between items-center"
              >
                <div>
                  <span className="block text-xs font-bold text-[var(--fg)]">Calculate Concrete Slab</span>
                  <span className="block text-[9px] text-[var(--fg-muted)]">Prefills slab to {derivedSideString}ft &times; {derivedSideString}ft</span>
                </div>
                <svg className="w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          </Card>
        )}

        {/* Local Processing Guarantee Banner */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-inset)]/20 p-3.5 flex flex-col gap-2">
          <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">Local Processing Guarantee</span>
          <p className="text-[11px] text-[var(--fg-secondary)] leading-relaxed text-pretty">
            Your images stay private. HomePlanningHub processes uploads completely inside your browser sandbox. No photo data is sent to external servers or cloud services.
          </p>
        </div>

        {/* Warning disclaimer YMYL */}
        <div className="border-l-4 border-l-[var(--warning)] bg-[var(--bg-subtle)] p-3 rounded-r-lg text-[10px] leading-relaxed text-[var(--fg-secondary)]">
          <strong>YMYL SAFETY NOTICE:</strong> Photo measurements are 2D approximations. Camera angles, perspective distortion, and lens curvature introduce measurement margins of error. Always verify critical room dimensions with a physical tape measure before purchasing materials.
        </div>
      </div>
    </div>
  );
}

export default withI18n(MeasureFromPhoto);
