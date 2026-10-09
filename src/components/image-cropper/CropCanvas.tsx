'use client';

// ============================================================
// ✂️ مكوّن Canvas القص التفاعلي
// ============================================================

import { useState, useRef, useCallback, useEffect } from 'react';
import type { CropArea, CropSettings } from '@/lib/image-cropper/types';
import { clampArea } from '@/lib/image-cropper/cropper';
import { COLORS, HANDLE_SIZE, MIN_CROP_SIZE } from '@/lib/image-cropper/constants';

// ============================================================
// 📝 الأنواع
// ============================================================

type HandleType =
  | 'nw' | 'n' | 'ne'
  | 'w'  | 'e'
  | 'sw' | 's' | 'se'
  | 'move'
  | null;

interface CropCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  cropArea: CropArea;
  settings: CropSettings;
  onCropChange: (area: CropArea) => void;
}

// ============================================================
// 🎨 المكوّن الرئيسي
// ============================================================

export default function CropCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  cropArea,
  settings,
  onCropChange,
}: CropCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [activeHandle, setActiveHandle] = useState<HandleType>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, area: { ...cropArea } });
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // ============================================
  // 📏 قياس الحاوية عند التحميل والتغيير
  // ============================================
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isImageLoaded]);

  // ============================================
  // 📐 حساب مقياس العرض
  // ============================================
  const getScale = useCallback(() => {
    if (!containerSize.width || !containerSize.height) return 1;
    const scaleX = containerSize.width / imageWidth;
    const scaleY = containerSize.height / imageHeight;
    return Math.min(scaleX, scaleY);
  }, [containerSize, imageWidth, imageHeight]);

  // ============================================
  // 🎯 حساب موضع المؤشر بالبكسل الأصلي
  // ============================================
  const getImageCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!imageRef.current) return { x: 0, y: 0 };

    const rect = imageRef.current.getBoundingClientRect();
    const scale = getScale();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale,
    };
  }, [getScale]);

  // ============================================
  // 🖱️ تحديد المقبض النشط
  // ============================================
  const getHandleAtPosition = useCallback((e: React.MouseEvent | React.TouchEvent): HandleType => {
    const { x, y } = getImageCoords(e);
    const scale = getScale();
    const handleSize = HANDLE_SIZE / scale;
    const halfHandle = handleSize / 2;

    const { x: cx, y: cy, width, height } = cropArea;
    const right = cx + width;
    const bottom = cy + height;

    // التحقق من المقابض (8 مقابض)
    const handles: Array<{ type: HandleType; hx: number; hy: number }> = [
      { type: 'nw', hx: cx, hy: cy },
      { type: 'n', hx: cx + width / 2, hy: cy },
      { type: 'ne', hx: right, hy: cy },
      { type: 'e', hx: right, hy: cy + height / 2 },
      { type: 'se', hx: right, hy: bottom },
      { type: 's', hx: cx + width / 2, hy: bottom },
      { type: 'sw', hx: cx, hy: bottom },
      { type: 'w', hx: cx, hy: cy + height / 2 },
    ];

    for (const h of handles) {
      if (
        Math.abs(x - h.hx) <= halfHandle &&
        Math.abs(y - h.hy) <= halfHandle
      ) {
        return h.type;
      }
    }

    // التحقق من المنطقة الداخلية (للتحريك)
    if (x >= cx && x <= right && y >= cy && y <= bottom) {
      return 'move';
    }

    return null;
  }, [cropArea, getImageCoords, getScale]);

  // ============================================
  // 🖱️ بدء السحب
  // ============================================
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const handle = getHandleAtPosition(e);

    if (handle) {
      setActiveHandle(handle);
      const { x, y } = getImageCoords(e);
      setDragStart({
        x,
        y,
        area: { ...cropArea },
      });
    }
  }, [cropArea, getHandleAtPosition, getImageCoords]);

  // ============================================
  // 🖱️ أثناء السحب
  // ============================================
  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!activeHandle) return;
    e.preventDefault();

    const { x, y } = getImageCoords(e);
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    const start = dragStart.area;
    let newArea = { ...start };

    switch (activeHandle) {
      case 'move':
        newArea.x = start.x + dx;
        newArea.y = start.y + dy;
        break;

      case 'nw':
        newArea.x = start.x + dx;
        newArea.y = start.y + dy;
        newArea.width = start.width - dx;
        newArea.height = start.height - dy;
        break;

      case 'n':
        newArea.y = start.y + dy;
        newArea.height = start.height - dy;
        break;

      case 'ne':
        newArea.y = start.y + dy;
        newArea.width = start.width + dx;
        newArea.height = start.height - dy;
        break;

      case 'e':
        newArea.width = start.width + dx;
        break;

      case 'se':
        newArea.width = start.width + dx;
        newArea.height = start.height + dy;
        break;

      case 's':
        newArea.height = start.height + dy;
        break;

      case 'sw':
        newArea.x = start.x + dx;
        newArea.width = start.width - dx;
        newArea.height = start.height + dy;
        break;

      case 'w':
        newArea.x = start.x + dx;
        newArea.width = start.width - dx;
        break;
    }

    // ضمان الحد الأدنى
    if (newArea.width < MIN_CROP_SIZE) newArea.width = MIN_CROP_SIZE;
    if (newArea.height < MIN_CROP_SIZE) newArea.height = MIN_CROP_SIZE;

    // ضبط الحدود
    newArea = clampArea(newArea, imageWidth, imageHeight);

    onCropChange(newArea);
  }, [activeHandle, dragStart, getImageCoords, imageWidth, imageHeight, onCropChange]);

  // ============================================
  // 🖱️ إنهاء السحب
  // ============================================
  const handlePointerUp = useCallback(() => {
    setActiveHandle(null);
  }, []);

  // ============================================
  // 🎨 حساب موضع القص على الشاشة
  // ============================================
  const scale = getScale();
  const displayX = cropArea.x * scale;
  const displayY = cropArea.y * scale;
  const displayWidth = cropArea.width * scale;
  const displayHeight = cropArea.height * scale;

  // ============================================
  // 🎨 الرسم
  // ============================================
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center select-none touch-none"
      style={{
        minHeight: '400px',
        maxHeight: '600px',
      }}
    >
      {/* الصورة */}
      <div
        className="relative"
        style={{
          width: imageWidth * scale,
          height: imageHeight * scale,
        }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="صورة للقص"
          className="absolute inset-0 w-full h-full select-none pointer-events-none"
          onLoad={() => setIsImageLoaded(true)}
          draggable={false}
        />

        {/* Overlay + منطقة القص */}
        {isImageLoaded && (
          <div
            className="absolute inset-0 cursor-crosshair"
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          >
            {/* Overlay داكن خارج منطقة القص */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ width: imageWidth * scale, height: imageHeight * scale }}
            >
              <defs>
                <mask id="crop-mask">
                  <rect width="100%" height="100%" fill="white" />
                  {settings.shape === 'circle' ? (
                    <ellipse
                      cx={displayX + displayWidth / 2}
                      cy={displayY + displayHeight / 2}
                      rx={displayWidth / 2}
                      ry={displayHeight / 2}
                      fill="black"
                    />
                  ) : (
                    <rect
                      x={displayX}
                      y={displayY}
                      width={displayWidth}
                      height={displayHeight}
                      rx={settings.shape === 'rounded' ? settings.borderRadius * scale : 0}
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill={COLORS.overlayDark}
                mask="url(#crop-mask)"
              />
            </svg>

            {/* إطار منطقة القص */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: displayX,
                top: displayY,
                width: displayWidth,
                height: displayHeight,
                border: `2px solid ${COLORS.borderPrimary}`,
                borderRadius:
                  settings.shape === 'circle'
                    ? '50%'
                    : settings.shape === 'rounded'
                    ? settings.borderRadius * scale
                    : 0,
                boxShadow: '0 0 0 1px rgba(0,0,0,0.3)',
              }}
            >
              {/* شبكة القاعدة الذهبية */}
              {settings.showGrid && settings.gridType !== 'none' && (
                <GridOverlay type={settings.gridType} />
              )}
            </div>

            {/* المقابض (8 مقابض) */}
            {settings.shape !== 'circle' && (
              <>
                <Handle type="nw" x={displayX} y={displayY} />
                <Handle type="n" x={displayX + displayWidth / 2} y={displayY} />
                <Handle type="ne" x={displayX + displayWidth} y={displayY} />
                <Handle type="e" x={displayX + displayWidth} y={displayY + displayHeight / 2} />
                <Handle type="se" x={displayX + displayWidth} y={displayY + displayHeight} />
                <Handle type="s" x={displayX + displayWidth / 2} y={displayY + displayHeight} />
                <Handle type="sw" x={displayX} y={displayY + displayHeight} />
                <Handle type="w" x={displayX} y={displayY + displayHeight / 2} />
              </>
            )}

            {/* مقبض دائري (إذا كانت الدائرة) */}
            {settings.shape === 'circle' && (
              <>
                <Handle type="nw" x={displayX} y={displayY} />
                <Handle type="ne" x={displayX + displayWidth} y={displayY} />
                <Handle type="se" x={displayX + displayWidth} y={displayY + displayHeight} />
                <Handle type="sw" x={displayX} y={displayY + displayHeight} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 🎯 مكوّن المقبض
// ============================================================

function Handle({ type, x, y }: { type: HandleType; x: number; y: number }) {
  if (!type) return null;

  const cursorMap: Record<string, string> = {
    nw: 'nwse-resize',
    n: 'ns-resize',
    ne: 'nesw-resize',
    e: 'ew-resize',
    se: 'nwse-resize',
    s: 'ns-resize',
    sw: 'nesw-resize',
    w: 'ew-resize',
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x - HANDLE_SIZE / 2,
        top: y - HANDLE_SIZE / 2,
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        borderRadius: '50%',
        background: COLORS.handleFill,
        border: `2px solid ${COLORS.handleStroke}`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        cursor: cursorMap[type] || 'default',
      }}
    />
  );
}

// ============================================================
// 📐 شبكة القاعدة الذهبية
// ============================================================

function GridOverlay({ type }: { type: string }) {
  const lines: React.ReactElement[] = [];

  switch (type) {
    case 'thirds':
      // 2 خطوط أفقية + 2 خطوط رأسية
      [33.33, 66.66].forEach((pos, i) => {
        lines.push(
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0"
            style={{
              top: `${pos}%`,
              height: '1px',
              background: COLORS.gridLine,
              boxShadow: `0 0 2px ${COLORS.gridLineShadow}`,
            }}
          />,
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0"
            style={{
              left: `${pos}%`,
              width: '1px',
              background: COLORS.gridLine,
              boxShadow: `0 0 2px ${COLORS.gridLineShadow}`,
            }}
          />
        );
      });
      break;

    case 'golden':
      // النسبة الذهبية (1.618)
      [38.2, 61.8].forEach((pos, i) => {
        lines.push(
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0"
            style={{
              top: `${pos}%`,
              height: '1px',
              background: COLORS.gridLine,
            }}
          />,
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0"
            style={{
              left: `${pos}%`,
              width: '1px',
              background: COLORS.gridLine,
            }}
          />
        );
      });
      break;

    case 'grid':
      // 4x4 grid
      for (let i = 1; i < 4; i++) {
        const pos = (i / 4) * 100;
        lines.push(
          <div
            key={`h-${i}`}
            className="absolute left-0 right-0"
            style={{
              top: `${pos}%`,
              height: '1px',
              background: COLORS.gridLine,
            }}
          />,
          <div
            key={`v-${i}`}
            className="absolute top-0 bottom-0"
            style={{
              left: `${pos}%`,
              width: '1px',
              background: COLORS.gridLine,
            }}
          />
        );
      }
      break;

    case 'center':
      // خط أفقي + خط رأسي في المنتصف
      lines.push(
        <div
          key="h-center"
          className="absolute left-0 right-0"
          style={{
            top: '50%',
            height: '1px',
            background: COLORS.gridLine,
          }}
        />,
        <div
          key="v-center"
          className="absolute top-0 bottom-0"
          style={{
            left: '50%',
            width: '1px',
            background: COLORS.gridLine,
          }}
        />
      );
      break;
  }

  return <>{lines}</>;
}