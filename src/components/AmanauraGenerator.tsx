"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, RotateCcw, ZoomIn, ZoomOut, Move, Camera } from "lucide-react";

interface AmanauraGeneratorProps {
  onDownloadSuccess?: () => void;
}

export function AmanauraGenerator({ onDownloadSuccess }: AmanauraGeneratorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  
  // Transform State (Zoom & Pan/Drag)
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; initialOffsetX: number; initialOffsetY: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const userImgRef = useRef<HTMLImageElement | null>(null);
  const frameImgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Load Frame Overlay Image
  useEffect(() => {
    const frame = new Image();
    frame.src = "/amanaura.png";
    frame.onload = () => {
      frameImgRef.current = frame;
      setFrameLoaded(true);
    };
  }, []);

  // Reset transforms
  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Draw Canvas (Core Canvas + Zoom & Pan Logic)
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas resolution 1080x1080
    canvas.width = 1080;
    canvas.height = 1080;

    // Clear Canvas
    ctx.clearRect(0, 0, 1080, 1080);
    ctx.fillStyle = "#022c22";
    ctx.fillRect(0, 0, 1080, 1080);

    // 1. Draw User Image with Zoom & Offset
    const userImg = userImgRef.current;
    if (userImg) {
      // Calculate base cover scale
      const baseScale = Math.max(1080 / userImg.width, 1080 / userImg.height);
      const scaledWidth = userImg.width * baseScale * zoom;
      const scaledHeight = userImg.height * baseScale * zoom;

      // Base centered position + offset
      const baseX = (1080 - scaledWidth) / 2 + offset.x;
      const baseY = (1080 - scaledHeight) / 2 + offset.y;

      ctx.drawImage(userImg, baseX, baseY, scaledWidth, scaledHeight);
    } else {
      // Placeholder text if no image uploaded
      ctx.fillStyle = "#A3E635";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Upload Foto Anda Di Sini", 540, 540);
    }

    // 2. Draw Frame Overlay
    const frameImg = frameImgRef.current;
    if (frameImg) {
      ctx.drawImage(frameImg, 0, 0, 1080, 1080);
    }
  }, [zoom, offset]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, frameLoaded, imageSrc]);

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.src = src;
      img.onload = () => {
        userImgRef.current = img;
        handleReset(); // Reset zoom and position on new image
        drawCanvas();
      };
    };
    reader.readAsDataURL(file);
  };

  // Pointer Drag Gestures (Mouse & Touch Friendly)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageSrc) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialOffsetX: offset.x,
      initialOffsetY: offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current || !canvasRef.current) return;

    // Convert screen drag delta to 1080px canvas scale
    const rect = canvasRef.current.getBoundingClientRect();
    const canvasScale = 1080 / rect.width;

    const deltaX = (e.clientX - dragStartRef.current.x) * canvasScale;
    const deltaY = (e.clientY - dragStartRef.current.y) * canvasScale;

    // Apply clamp so photo doesn't completely leave canvas area
    const newX = dragStartRef.current.initialOffsetX + deltaX;
    const newY = dragStartRef.current.initialOffsetY + deltaY;

    // Clamp range +/- 800px
    const clampedX = Math.max(-800, Math.min(800, newX));
    const clampedY = Math.max(-800, Math.min(800, newY));

    setOffset({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {
        // pointer capture release fallback
      }
    }
  };

  // Download Output JPG
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `amanaura-hut16-pklu-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (onDownloadSuccess) {
          onDownloadSuccess();
        }
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="space-y-6 rounded-2xl border border-transparent sm:border-[#D4AF37]/30 bg-transparent sm:bg-black/40 p-0 sm:p-6 sm:backdrop-blur-md text-[#FDFBF7]">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-[#D4AF37]">Amanaura Frame Generator</h2>
        <p className="text-xs text-gray-300">Geser dan atur ukuran foto Anda agar pas di dalam frame.</p>
      </div>

      {/* Interactive Touch/Mouse Canvas Container */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative mx-auto w-full max-w-[360px] aspect-square rounded-xl overflow-hidden border border-[#D4AF37]/20 bg-black/50 shadow-xl flex items-center justify-center touch-none select-none ${
          imageSrc ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none" />
        
        {imageSrc && (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-gray-300 flex items-center gap-1">
            <Move className="w-3 h-3 text-[#D4AF37]" />
            Geser Foto
          </div>
        )}
      </div>

      {/* Controls: Zoom Slider & Reset */}
      {imageSrc && (
        <div className="space-y-3 bg-black/50 p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
            <span className="flex items-center gap-1 text-[#D4AF37]">
              <ZoomIn className="w-4 h-4" /> Zoom / Ukuran Foto
            </span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>

          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.02"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-gray-400 shrink-0" />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-xs text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Reset Posisi &amp; Zoom
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          aria-label="Upload dari galeri"
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="user"
          onChange={handleImageUpload}
          className="hidden"
          aria-label="Ambil foto dari kamera"
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] font-semibold rounded-xl cursor-pointer transition-all text-xs"
          >
            <Camera className="w-4 h-4" />
            <span>Ambil Kamera</span>
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] font-semibold rounded-xl cursor-pointer transition-all text-xs"
          >
            <Upload className="w-4 h-4" />
            <span>Pilih Galeri</span>
          </button>
        </div>

        <Button
          type="button"
          disabled={!imageSrc}
          onClick={handleDownload}
          aria-label="Download hasil Amanaura ke perangkat"
          className="w-full bg-[#D4AF37] hover:bg-[#B3932D] text-black font-bold py-6 text-base rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Hasil Amanaura (JPG)
        </Button>
      </div>
    </div>
  );
}
