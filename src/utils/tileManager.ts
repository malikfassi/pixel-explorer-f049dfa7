export const COLORS = [
  '#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA',
  '#FF719A', '#FFA99F', '#FFE29F', '#abecd6'
];

export interface Tile {
  x: number;
  y: number;
  pixels: string[][];
}

export const generateTile = (x: number, y: number, tileSize: number): Tile => {
  const pixels = Array(tileSize).fill(0).map(() =>
    Array(tileSize).fill(0).map(() => COLORS[Math.floor(Math.random() * COLORS.length)])
  );
  return { x, y, pixels };
};

export const updateRandomPixels = (tiles: Map<string, Tile>) => {
  // Get a random tile from the map
  const tileKeys = Array.from(tiles.keys());
  if (tileKeys.length === 0) return;
  
  const randomKey = tileKeys[Math.floor(Math.random() * tileKeys.length)];
  const tile = tiles.get(randomKey);
  
  if (!tile) return;

  // Update one pixel in the selected tile
  const x = Math.floor(Math.random() * tile.pixels[0].length);
  const y = Math.floor(Math.random() * tile.pixels.length);
  tile.pixels[y][x] = COLORS[Math.floor(Math.random() * COLORS.length)];
};