'use client';

import { useEffect, useRef } from 'react';
import type { WheelOption } from '@/lib/picker-wheel/types';
import { getWheelSegments } from '@/lib/picker-wheel/wheel-engine';

interface WheelCanvasProps {
  options: WheelOption[];
  rotation: number;
  showImages?: boolean;
  imageUrls?: Record<string, string>;
  size?: number;
  isSpinning?: boolean;
}

interface CachedWheelImage {
  url: string;
  image: HTMLImageElement;
}

const TAU = Math.PI * 2;

function drawWheel(
  canvas: HTMLCanvasElement,
  options: WheelOption[],
  rotation: number,
  showImages: boolean,
  imageCache: Map<string, CachedWheelImage>,
  size: number,
) {
  const context = canvas.getContext('2d');

  if (!context) return;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const displaySize = Math.max(200, size);
  const resolution = Math.round(displaySize * pixelRatio);

  if (canvas.width !== resolution || canvas.height !== resolution) {
    canvas.width = resolution;
    canvas.height = resolution;
  }

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, displaySize, displaySize);

  if (options.length < 2) return;

  const center = displaySize / 2;
  const radius = displaySize / 2 - 9;
  const segments = getWheelSegments(options);

  context.save();
  context.translate(center, center);
  context.rotate(rotation);

  segments.forEach((segment) => {
    // تبدأ القطاعات من الزاوية نفسها التي يعتمد عليها محرك الاختيار.
    const startAngle = segment.startAngle;
    const endAngle = segment.endAngle;

    context.beginPath();
    context.moveTo(0, 0);
    context.arc(0, 0, radius, startAngle, endAngle);
    context.closePath();

    context.fillStyle = segment.option.color;
    context.fill();

    context.strokeStyle = 'rgba(255,255,255,0.92)';
    context.lineWidth = 2;
    context.stroke();

    const middleAngle = startAngle + segment.angle / 2;
    const textRadius = radius * 0.66;

    const textX = Math.cos(middleAngle) * textRadius;
    const textY = Math.sin(middleAngle) * textRadius;

    context.save();
    context.translate(textX, textY);
    context.rotate(middleAngle + Math.PI / 2);

    const cachedImage = showImages
      ? imageCache.get(segment.option.id)?.image
      : undefined;

    const hasImage = Boolean(
      cachedImage?.complete && cachedImage.naturalWidth > 0,
    );

    if (hasImage && cachedImage) {
      const imageSize = Math.min(42, radius * 0.18);

      context.beginPath();
      context.arc(0, -13, imageSize / 2 + 2, 0, TAU);
      context.fillStyle = 'rgba(255,255,255,0.95)';
      context.fill();

      context.save();
      context.beginPath();
      context.arc(0, -13, imageSize / 2, 0, TAU);
      context.clip();

      context.drawImage(
        cachedImage,
        -imageSize / 2,
        -13 - imageSize / 2,
        imageSize,
        imageSize,
      );

      context.restore();
    }

    const label = segment.option.label;
    const maxTextWidth = radius * 0.52;

    const fontSize = Math.max(
      10,
      Math.min(
        18,
        radius * 0.085,
        maxTextWidth / Math.max(label.length * 0.55, 1),
      ),
    );

    context.font = `700 ${fontSize}px Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.direction = 'rtl';
    context.fillStyle = '#FFFFFF';
    context.shadowColor = 'rgba(15,23,42,0.35)';
    context.shadowBlur = 3;
    context.shadowOffsetY = 1;

    const maxLength = Math.max(
      7,
      Math.floor(maxTextWidth / (fontSize * 0.55)),
    );

    const displayedLabel =
      label.length > maxLength
        ? `${label.slice(0, maxLength - 1)}…`
        : label;

    context.fillText(
      displayedLabel,
      0,
      hasImage ? 25 : 0,
      maxTextWidth,
    );

    context.restore();
  });

  context.restore();

  // الإطار الخارجي.
  context.beginPath();
  context.arc(center, center, radius + 3, 0, TAU);
  context.strokeStyle = '#FFFFFF';
  context.lineWidth = 5;
  context.stroke();

  context.beginPath();
  context.arc(center, center, radius + 6, 0, TAU);
  context.strokeStyle = '#EA5808';
  context.lineWidth = 3;
  context.stroke();

  // المحور المركزي.
  const hubRadius = Math.max(17, displaySize * 0.045);

  const hubGradient = context.createRadialGradient(
    center - hubRadius * 0.3,
    center - hubRadius * 0.3,
    2,
    center,
    center,
    hubRadius,
  );

  hubGradient.addColorStop(0, '#FDBA74');
  hubGradient.addColorStop(0.55, '#EA5808');
  hubGradient.addColorStop(1, '#9A3412');

  context.beginPath();
  context.arc(center, center, hubRadius, 0, TAU);
  context.fillStyle = hubGradient;
  context.fill();

  context.strokeStyle = '#FFFFFF';
  context.lineWidth = 3;
  context.stroke();

  context.beginPath();
  context.arc(center, center, hubRadius * 0.25, 0, TAU);
  context.fillStyle = '#FFFFFF';
  context.fill();

  // مؤشر ثابت أعلى العجلة.
  context.save();
  context.translate(center, 0);

  context.beginPath();
  context.moveTo(-15, 3);
  context.lineTo(15, 3);
  context.lineTo(0, 31);
  context.closePath();

  context.fillStyle = '#0F172A';
  context.shadowColor = 'rgba(15,23,42,0.3)';
  context.shadowBlur = 5;
  context.shadowOffsetY = 2;
  context.fill();

  context.strokeStyle = '#FFFFFF';
  context.lineWidth = 2;
  context.stroke();

  context.restore();
}

export default function WheelCanvas({
  options,
  rotation,
  showImages = true,
  imageUrls = {},
  size = 480,
  isSpinning = false,
}: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageCacheRef = useRef(
    new Map<string, CachedWheelImage>(),
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    let cancelled = false;

    const imageCache = imageCacheRef.current;

    const draw = () => {
      if (cancelled) return;

      drawWheel(
        canvas,
        options,
        rotation,
        showImages,
        imageCache,
        size,
      );
    };

    draw();

    if (!showImages) return;

    Object.entries(imageUrls).forEach(([id, url]) => {
      const cached = imageCache.get(id);

      if (cached?.url === url && cached.image.complete) {
        return;
      }

      const image = new Image();

      image.onload = () => {
        if (cancelled) return;

        imageCache.set(id, { url, image });
        draw();
      };

      image.onerror = () => {
        if (!cancelled) {
          imageCache.delete(id);
          draw();
        }
      };

      imageCache.set(id, { url, image });
      image.src = url;
    });

    return () => {
      cancelled = true;
    };
  }, [options, rotation, showImages, imageUrls, size]);

  return (
    <div
      className="relative mx-auto w-full max-w-full"
      style={{
        maxWidth: size,
        aspectRatio: '1 / 1',
      }}
      aria-label="عجلة الحظ"
      role="img"
      aria-busy={isSpinning}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
