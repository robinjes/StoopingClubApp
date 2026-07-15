/** Width of the hardcover spine rendered on the left edge of the book. */
export const BOOK_SPINE_WIDTH = 24;

/** Horizontal padding around the book within the stroll container. */
export const BOOK_HORIZONTAL_PADDING = 16;

/** Inner padding between the cover frame and the page well. */
export const BOOK_COVER_PADDING = 6;

/** Fraction of page height dedicated to the product image (remainder is metadata). */
export const PAGE_IMAGE_HEIGHT_RATIO = 0.62;

/** Grid resolution for the Skia curl mesh — higher = smoother curl, lower = faster. */
export const CURL_MESH_COLS = 14;
export const CURL_MESH_ROWS = 20;

/** Full page-turn duration in milliseconds when starting from rest. */
export const FLIP_DURATION_MS = 820;

/** Minimum duration when completing a partially dragged page. */
export const FLIP_MIN_DURATION_MS = 180;

/** Drag distance (0–1) required to commit a page turn on release. */
export const FLIP_COMMIT_THRESHOLD = 0.4;

/** Hardcover palette */
export const COVER_BORDER = '#1F3D0C';
export const BINDING_DARK = '#243F10';
export const PAPER_BACK = '#E8DFCF';
