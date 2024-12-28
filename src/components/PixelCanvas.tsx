import React, { useEffect, useRef, useState } from 'react';

interface Tile {
  x: number;
  y: number;
  pixels: string[][];
}

interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

const TILE_SIZE = 10;
const PIXEL_SIZE = 10;
const VIEWPORT_TILES = 32;
const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA'];

const PixelCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const tilesRef = useRef<Map<string, Tile>>(new Map());

  const generateTile = (x: number, y: number): Tile => {
    const pixels = Array(TILE_SIZE).fill(0).map(() =>
      Array(TILE_SIZE).fill(0).map(() => COLORS[Math.floor(Math.random() * COLORS.length)])
    );
    return { x, y, pixels };
  };

  const getTileKey = (x: number, y: number) => `${x},${y}`;

  const ensureTileExists = (x: number, y: number) => {
    const key = getTileKey(x, y);
    if (!tilesRef.current.has(key)) {
      tilesRef.current.set(key, generateTile(x, y));
    }
    return tilesRef.current.get(key)!;
  };

  const updateRandomPixels = () => {
    tilesRef.current.forEach(tile => {
      const numPixels = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numPixels; i++) {
        const x = Math.floor(Math.random() * TILE_SIZE);
        const y = Math.floor(Math.random() * TILE_SIZE);
        tile.pixels[y][x] = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
    });
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
            ctx.fillStyle = color;
            ctx.fillRect(
              screenX + x * PIXEL_SIZE * viewport.zoom,
              screenY + y * PIXEL_SIZE * viewport.zoom,
              PIXEL_SIZE * viewport.zoom,
              PIXEL_SIZE * viewport.zoom
            );
          });
        });
      }
    }
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