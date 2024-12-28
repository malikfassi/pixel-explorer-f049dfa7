export const COLORS = [
  '#9b87f5', '#7E69AB', '#6E59A5', '#D6BCFA',
  '#FF719A', '#FFA99F', '#FFE29F', '#abecd6'
];

interface PixelData {
  color: string;
  userId: string;
  expiresAt: number;
}

export interface Tile {
  x: number;
  y: number;
  pixels: PixelData[][];
}

const generateRandomUserId = () => {
  const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace'];
  return names[Math.floor(Math.random() * names.length)];
};

const generateExpirationTime = () => {
  // Random expiration between 2 and 10 seconds from now
  return Date.now() + Math.random() * 8000 + 2000;
};

export const generateTile = (x: number, y: number, tileSize: number): Tile => {
  const pixels: PixelData[][] = Array(tileSize).fill(0).map(() =>
    Array(tileSize).fill(0).map(() => ({
      color: '#ffffff',
      userId: '',
      expiresAt: 0
    }))
  );
  return { x, y, pixels };
};

export const updateRandomPixels = (tiles: Map<string, Tile>) => {
  const tileKeys = Array.from(tiles.keys());
  if (tileKeys.length === 0) return;
  
  const randomKey = tileKeys[Math.floor(Math.random() * tileKeys.length)];
  const tile = tiles.get(randomKey);
  
  if (!tile) return;

  const userId = generateRandomUserId();
  const numPixelsToUpdate = Math.floor(Math.random() * 5) + 1; // Update 1-5 pixels

  for (let i = 0; i < numPixelsToUpdate; i++) {
    const x = Math.floor(Math.random() * tile.pixels[0].length);
    const y = Math.floor(Math.random() * tile.pixels.length);
    
    // Only update if pixel has expired
    if (tile.pixels[y][x].expiresAt < Date.now()) {
      tile.pixels[y][x] = {
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        userId: userId,
        expiresAt: generateExpirationTime()
      };
    }
  }
};

export const getFadedColor = (pixelData: PixelData): string => {
  const now = Date.now();
  
  // If not expired, return the original color
  if (now < pixelData.expiresAt) {
    return pixelData.color;
  }

  // Calculate fade over 1 second after expiration
  const fadeTime = 1000; // 1 second fade
  const timeSinceExpiration = now - pixelData.expiresAt;
  
  if (timeSinceExpiration >= fadeTime) {
    return '#ffffff'; // Completely faded to white
  }

  // Parse the original color
  const r = parseInt(pixelData.color.slice(1, 3), 16);
  const g = parseInt(pixelData.color.slice(3, 5), 16);
  const b = parseInt(pixelData.color.slice(5, 7), 16);

  // Calculate fade progress (0 to 1)
  const fadeProgress = timeSinceExpiration / fadeTime;

  // Interpolate towards white (255, 255, 255)
  const newR = Math.floor(r + (255 - r) * fadeProgress);
  const newG = Math.floor(g + (255 - g) * fadeProgress);
  const newB = Math.floor(b + (255 - b) * fadeProgress);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};