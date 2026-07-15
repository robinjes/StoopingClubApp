import type { BookFlipDirection } from './bookTypes';

export type PagePoint = {
  x: number;
  y: number;
  /** 0 = fully lit, 1 = fully shaded — used for fold darkening on the curl mesh. */
  shade: number;
};

/**
 * Deforms a point on the turning sheet for a forward page flip.
 *
 * The fold line sweeps from the fore-edge (right) toward the spine (left) as
 * progress goes 0 → 1. Each point past the fold rotates up to 180° around that
 * line, so at progress = 1 the entire sheet has turned over and tucks behind
 * the spine (x → 0).
 */
function deformForwardPoint(
  srcX: number,
  srcY: number,
  width: number,
  height: number,
  progress: number,
): PagePoint {
  'worklet';
  const foldX = width * (1 - progress);
  const lift = progress * 5;

  if (srcX <= foldX) {
    const proximity = foldX > 0 ? srcX / foldX : 1;
    const edgeLift = (1 - proximity) * lift * 0.2;
    return { x: srcX, y: srcY - edgeLift, shade: 0 };
  }

  const turningSpan = Math.max(width - foldX, 1);
  const t = (srcX - foldX) / turningSpan;
  // Full half-circle rotation: at progress = 1 every point completes a 180° turn.
  const angle = t * progress * Math.PI;
  const arm = srcX - foldX;
  const curledX = foldX + arm * Math.cos(angle);
  const curledY = srcY - arm * Math.sin(angle) * 0.08 - lift * 0.12;
  const shade = t * progress * 0.34;

  return {
    x: curledX,
    y: Math.min(Math.max(curledY, 0), height),
    shade,
  };
}

/**
 * Cylindrical page-curl projection with a complete 180° page turn.
 *
 * Forward: right edge sweeps left and the sheet rotates fully onto the spine.
 * Backward: mirrored so the previous page lays flat from the spine outward.
 */
export function deformPagePoint(
  srcX: number,
  srcY: number,
  width: number,
  progress: number,
  direction: BookFlipDirection,
  height = width * 1.4,
): PagePoint {
  'worklet';

  if (direction === 'backward') {
    const mirrored = deformForwardPoint(width - srcX, srcY, width, height, 1 - progress);
    return { x: width - mirrored.x, y: mirrored.y, shade: mirrored.shade };
  }

  return deformForwardPoint(srcX, srcY, width, height, progress);
}

/** Horizontal position of the fold crease — used for highlight and shadow overlays. */
export function getFoldLineX(
  width: number,
  progress: number,
  direction: BookFlipDirection,
): number {
  'worklet';
  const effective = direction === 'forward' ? progress : 1 - progress;
  return width * (1 - effective);
}

/**
 * Builds UV texture coordinates and triangle indices for a regular page grid.
 * Texture coordinates stay fixed while vertex positions deform during the curl.
 */
export function buildPageMeshTopology(cols: number, rows: number, width: number, height: number) {
  const vertexCount = cols * rows;
  const textures: { x: number; y: number }[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      textures.push({
        x: (col / (cols - 1)) * width,
        y: (row / (rows - 1)) * height,
      });
    }
  }

  const indices: number[] = [];
  for (let row = 0; row < rows - 1; row += 1) {
    for (let col = 0; col < cols - 1; col += 1) {
      const topLeft = row * cols + col;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + cols;
      const bottomRight = bottomLeft + 1;
      indices.push(topLeft, topRight, bottomLeft, topRight, bottomRight, bottomLeft);
    }
  }

  return { textures, indices, vertexCount };
}

/** Maps linear drag distance to flip progress, clamped to [0, 1]. */
export function dragToProgress(dragPixels: number, pageWidth: number, direction: BookFlipDirection): number {
  'worklet';
  const normalized = dragPixels / pageWidth;
  if (direction === 'forward') {
    return Math.min(Math.max(normalized, 0), 1);
  }
  return Math.min(Math.max(1 - normalized, 0), 1);
}
