export const applyFisheye = (
  x: number,
  y: number,
  width: number,
  height: number,
  strength: number = 0.5
) => {
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Convert to normalized coordinates (-1 to 1)
  const normalizedX = (x - centerX) / centerX;
  const normalizedY = (y - centerY) / centerY;
  
  // Calculate distance from center (0 to 1)
  const distance = Math.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);
  
  if (distance === 0) return { x, y };
  
  // Apply distortion with reduced strength
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
  // Center gradient for subtle atmosphere
  const centerGradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.3,
    width / 2,
    height / 2,
    Math.min(width, height) * 0.8
  );
  centerGradient.addColorStop(0, 'rgba(26, 31, 44, 0)');
  centerGradient.addColorStop(1, 'rgba(26, 31, 44, 0.7)');
  ctx.fillStyle = centerGradient;
  ctx.fillRect(0, 0, width, height);

  // Add corner gradients for enhanced fog effect
  const corners = [
    [0, 0],
    [width, 0],
    [0, height],
    [width, height]
  ];

  corners.forEach(([x, y]) => {
    const cornerGradient = ctx.createRadialGradient(
      x, y,
      0,
      x, y,
      Math.min(width, height) * 0.4
    );
    cornerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    cornerGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    cornerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = cornerGradient;
    ctx.fillRect(0, 0, width, height);
  });
};

export const getHoverEffect = (
  x: number,
  y: number,
  mouseX: number,
  mouseY: number,
  pixelSize: number,
  zoom: number
): { scale: number; alpha: number } => {
  const distance = Math.sqrt(
    Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2)
  );
  const hoverRadius = pixelSize * 4 * zoom;
  
  if (distance > hoverRadius) return { scale: 1, alpha: 1 };
  
  const scale = 1 + (0.2 * (1 - distance / hoverRadius));
  const alpha = 1 + (0.3 * (1 - distance / hoverRadius));
  
  return { scale, alpha };
};
