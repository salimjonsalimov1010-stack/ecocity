// Minimal QR Code generator (pure JS, no CDN needed)
// Generates a visual QR-like pattern based on user ID
function drawQR(canvasId, text) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = 200;
  canvas.width = size; canvas.height = size;

  // Use text to seed a deterministic pattern
  let hash = 0;
  for (let i = 0; i < text.length; i++) { hash = ((hash << 5) - hash) + text.charCodeAt(i); hash |= 0; }

  const cells = 21;
  const cellSize = size / cells;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  // Draw QR-like modules
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // Fixed finder patterns (corners)
      if (isFinderPattern(r, c, cells)) {
        ctx.fillStyle = '#1a2e1a';
      } else if (isFinderBorder(r, c, cells)) {
        ctx.fillStyle = '#ffffff';
      } else if (isTimingPattern(r, c)) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#1a2e1a' : '#ffffff';
      } else {
        // Data modules - deterministic based on hash
        const bit = (hash * (r * cells + c) * 6364136223846793005 + 1442695040888963407) & 1;
        ctx.fillStyle = bit ? '#1a2e1a' : '#ffffff';
      }
      ctx.fillRect(c * cellSize, r * cellSize, cellSize - 0.5, cellSize - 0.5);
    }
  }

  // Draw finder patterns properly
  drawFinder(ctx, 0, 0, cellSize);
  drawFinder(ctx, 0, (cells - 7) * cellSize, cellSize);
  drawFinder(ctx, (cells - 7) * cellSize, 0, cellSize);

  // Center logo
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(size/2 - 16, size/2 - 16, 32, 32);
  ctx.fillStyle = '#1a6b3c';
  ctx.font = 'bold 16px Inter,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🌿', size/2, size/2);
}

function drawFinder(ctx, x, y, cs) {
  ctx.fillStyle = '#1a2e1a';
  ctx.fillRect(x, y, 7*cs, 7*cs);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x+cs, y+cs, 5*cs, 5*cs);
  ctx.fillStyle = '#1a2e1a';
  ctx.fillRect(x+2*cs, y+2*cs, 3*cs, 3*cs);
}

function isFinderPattern(r, c, cells) {
  return (r < 7 && c < 7) || (r < 7 && c >= cells-7) || (r >= cells-7 && c < 7);
}

function isFinderBorder(r, c, cells) {
  return (r === 7 && c <= 7) || (c === 7 && r <= 7) ||
         (r === 7 && c >= cells-8) || (c === cells-8 && r <= 7) ||
         (r === cells-8 && c <= 7) || (c === 7 && r >= cells-8);
}

function isTimingPattern(r, c) {
  return (r === 6 && c >= 8) || (c === 6 && r >= 8);
}
