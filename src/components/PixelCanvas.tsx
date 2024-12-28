import React, { useEffect, useRef, useState } from 'react';
import { applyFisheye, addFoggyCorners } from '../utils/canvasEffects';
import { Tile, generateTile, updateRandomPixels } from '../utils/tileManager';

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
  const tilesRef = useRef<Map<string, Tile>>(new Map());

  const getTileKey = (x: number, y: number) => `${x},${y}`;

  const ensureTileExists = (x: number, y: number) => {
    const key = getTileKey(x, y);
    if (!tilesRef.current.has(key)) {
      tilesRef.current.set(key, generateTile(x, y, TILE_SIZE));
    }
    return tilesRef.current.get(key)!;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#1A1F2C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tileSize = TILE_SIZE * PIXEL_SIZE * viewport.zoom;
    const startTileX = Math.floor(viewport.x / tileSize);
    const startTileY = Math.floor(viewport.y / tileSize);
    const tilesInView = Math.ceil(VIEWPORT_TILES / viewport.zoom);

    for (let ty = startTileY; ty < startTileY + tilesInView; ty++) {
      for (let tx = startTileX; tx < startTileX + tilesInView; tx++) {
        const tile = ensureTileExists(tx, ty);
        const screenX = tx * tileSize - viewport.x;
        const screenY = ty * tileSize - viewport.y;

        tile.pixels.forEach((row, y) => {
          row.forEach((color, x) => {
            const pixelX = screenX + x * PIXEL_SIZE * viewport.zoom;
            const pixelY = screenY + y * PIXEL_SIZE * viewport.zoom;
            
            const distorted = applyFisheye(
              pixelX,
              pixelY,
              canvas.width,
              canvas.height
            );

            ctx.fillStyle = color;
            ctx.fillRect(
              distorted.x,
              distorted.y,
              PIXEL_SIZE * viewport.zoom,
              PIXEL_SIZE * viewport.zoom
            );
          });
        });
      }
    }

    addFoggyCorners(ctx, canvas.width, canvas.height);
  };

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

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      updateRandomPixels();
      draw();
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [viewport]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-screen touch-none"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    />
  );
};

export default PixelCanvas;
