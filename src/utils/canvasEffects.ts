export const applyFisheye = (
  x: number,
  y: number,
  width: number,
  height: number,
  strength: number = 1.5
) => {
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Convert to normalized coordinates (-1 to 1)
  const normalizedX = (x - centerX) / centerX;
  const normalizedY = (y - centerY) / centerY;
  
  // Calculate distance from center (0 to 1)
  const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
  
  if (distance === 0) return { x, y };
  
  // Apply distortion
  const distortionFactor = Math.atan(distance * strength) / (distance * strength);
  
  // Convert back to screen coordinates
  return {
    x: centerX + normalizedX * centerX * distortionFactor,
    y: centerY + normalizedY * centerY * distortionFactor
  };
};

export const addFoggyCorners = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.3,
    width / 2,
    height / 2,
    Math.min(width, height) * 0.8
  );
  gradient.addColorStop(0, 'rgba(26, 31, 44, 0)');
  gradient.addColorStop(1, 'rgba(26, 31, 44, 0.7)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};