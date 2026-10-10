import { getPlacementAnchor } from './placementZones';
import { ROOM_GRID_CONFIG } from './roomGrid';

// The furniture images are positioned from their grid cell, while their PNG
// dimensions vary.  Depth must therefore come from the floor footprint, not
// from the rendered image box.
export const getFurnitureFloorContact = ({ product, gridX, gridY, gridWidth, gridHeight }) => {
  const anchor = getPlacementAnchor(product);
  const cellWidth = 100 / 10;
  const cellHeight = 100 / 10;
  const halfMarkerHeight = Math.min(ROOM_GRID_CONFIG.markerHeight, cellHeight * 0.65) / 2;
  const footprintOffset = product?.footprintOffset ?? {};
  const widthProgress = Math.max(gridWidth - 1, 0) * anchor.x;
  const depthProgress = Math.max(gridHeight - 1, 0) * anchor.y;

  return {
    x: (gridX + 0.5) * cellWidth + (widthProgress - depthProgress) * (Math.min(ROOM_GRID_CONFIG.markerWidth, cellWidth * 0.9) / 2) + 5 + (Number(footprintOffset.x) || 0),
    y: (gridY + 1) * cellHeight + (widthProgress + depthProgress) * halfMarkerHeight + (Number(footprintOffset.y) || 0),
  };
};

// Larger screen-space floor Y values are nearer to the viewer in this room's
// isometric projection.  The same order is used for every floor entity.
export const getDepthOrder = ({ floorContact }) => Math.round(floorContact.y * 10);
