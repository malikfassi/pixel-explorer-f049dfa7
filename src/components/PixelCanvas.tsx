import React, { useEffect, useRef, useState, useCallback } from 'react';
import { applyFisheye, addFoggyCorners, getHoverEffect } from '../utils/canvasEffects';
import { Tile, generateTile, updateRandomPixels, getFadedColor } from '../utils/tileManager';

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

const TILE_SIZE = 10;
const PIXEL_SIZE = 10;
const VIEWPORT_TILES = 32;

const PixelCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const tilesRef = useRef<Map<string, Tile>>(new Map());
  const frameRef = useRef<number>();

  const getTileKey = (x: number, y: number) => `${x},${y}`;

  const ensureTileExists = useCallback((x: number, y: number) => {
    const key = getTileKey(x, y);
    if (!tilesRef.current.has(key)) {
      tilesRef.current.set(key, generateTile(x, y, TILE_SIZE));
    }
    return tilesRef.current.get(key)!;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#1A1F2C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tileSize = TILE_SIZE * PIXEL_SIZE * viewport.zoom;
    const startTileX = Math.floor(viewport.x / tileSize);
    const startTileY = Math.floor(viewport.y / tileSize);
    const tilesInView = Math.ceil(VIEWPORT_TILES / viewport.zoom);

    const visibleTilesX = Math.ceil(canvas.width / tileSize) + 1;
    const visibleTilesY = Math.ceil(canvas.height / tileSize) + 1;

    for (let ty = startTileY; ty < startTileY + Math.min(tilesInView, visibleTilesY); ty++) {
      for (let tx = startTileX; tx < startTileX + Math.min(tilesInView, visibleTilesX); tx++) {
        const tile = ensureTileExists(tx, ty);
        const screenX = tx * tileSize - viewport.x;
        const screenY = ty * tileSize - viewport.y;

        tile.pixels.forEach((row, y) => {
          row.forEach((pixelData, x) => {
            const pixelX = screenX + x * PIXEL_SIZE * viewport.zoom;
            const pixelY = screenY + y * PIXEL_SIZE * viewport.zoom;
            
            if (pixelX < -PIXEL_SIZE || pixelX > canvas.width + PIXEL_SIZE ||
                pixelY < -PIXEL_SIZE || pixelY > canvas.height + PIXEL_SIZE) {
              return;
            }

            const distorted = applyFisheye(
              pixelX,
              pixelY,
              canvas.width,
              canvas.height
            );

            const hoverEffect = getHoverEffect(
              distorted.x,
              distorted.y,
              mousePos.x,
              mousePos.y,
              PIXEL_SIZE,
              viewport.zoom
            );

            const pixelSize = PIXEL_SIZE * viewport.zoom * hoverEffect.scale;
            const offset = (pixelSize - (PIXEL_SIZE * viewport.zoom)) / 2;

            ctx.globalAlpha = hoverEffect.alpha;
            ctx.fillStyle = getFadedColor(pixelData);
            ctx.fillRect(
              distorted.x - offset,
              distorted.y - offset,
              pixelSize,
              pixelSize
            );
            ctx.globalAlpha = 1;
          });
        });
      }
    }

    addFoggyCorners(ctx, canvas.width, canvas.height);
  }, [viewport, ensureTileExists, mousePos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      updateRandomPixels(tilesRef.current);
      draw();
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPos.x;
      const dy = e.clientY - lastPos.y;
      setViewport(prev => ({ ...prev, x: prev.x - dx, y: prev.y - dy }));
      setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setViewport(prev => ({
        ...prev,
        zoom: Math.max(0.5, Math.min(2, prev.zoom * zoomFactor))
      }));
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [isDragging, lastPos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        const rect = canvas.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const handleMouseLeave = () => {
      setMousePos({ x: -1000, y: -1000 });
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDragging]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-screen touch-none"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    />
  );
};

export default PixelCanvas;
