import { getPlacementAnchor } from './placementZones';
import { getFurnitureScreenAnchor } from './roomGrid';

// The furniture images are positioned from their grid cell, while their PNG
// dimensions vary.  Depth must therefore come from the floor footprint, not
// from the rendered image box.
export const getFurnitureFloorContact = ({ product, gridX, gridY, gridWidth, gridHeight }) => {
  const anchor = getPlacementAnchor(product);
  return getFurnitureScreenAnchor({ product, gridX, gridY, gridWidth, gridHeight, placementAnchor: anchor, footprintOffset: product?.footprintOffset });
};

// Larger screen-space floor Y values are nearer to the viewer in this room's
// isometric projection.  The same order is used for every floor entity.
export const getDepthOrder = ({ floorContact }) => Math.round(floorContact.y * 10);
