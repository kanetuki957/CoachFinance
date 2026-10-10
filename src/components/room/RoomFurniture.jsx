import React from 'react';
import { getProductById, isProductImagePath } from '../../domain/shop/productCatalog';
import { getGridFootprint, ROOM_GRID } from '../../domain/furniture/furnitureInventory';
import { getDepthOrder, getFurnitureFloorContact } from '../../domain/room/depthOrder';
import { resolveFurnitureSize } from '../../domain/room/furnitureSizing';

export const RoomFurniture = ({ items, onEdit, disabled = false }) => items.map((item) => {
  const product = getProductById(item.furnitureId);
  if (!product?.isFurniture) return null;
  const footprint = getGridFootprint(product, item.orientation);
  const displaySize = resolveFurnitureSize(product);
  const image = footprint.image;
  const floorContact = getFurnitureFloorContact({ product, gridX: item.gridX, gridY: item.gridY, gridWidth: footprint.gridWidth, gridHeight: footprint.gridHeight });
  return <button key={item.instanceId} type="button" disabled={disabled} onClick={() => onEdit(item)} aria-label={`${product.name}を編集`} className={`absolute touch-none select-none disabled:pointer-events-none ${item.placedAt ? 'animate-[furniture-pop_.28s_ease-out]' : ''}`} style={{ left: `${(item.gridX / ROOM_GRID.columns) * 100}%`, top: `${(item.gridY / ROOM_GRID.rows) * 100}%`, width: `${(displaySize.width / 320) * 100}%`, height: `${(displaySize.height / 320) * 100}%`, zIndex: getDepthOrder({ floorContact }) }}>
    {isProductImagePath(image) ? <img src={image} alt={product.name} draggable={false} className="pointer-events-none block h-full w-full object-contain drop-shadow-lg" /> : <span className="flex h-full w-full items-center justify-center text-[clamp(1.8rem,8vw,4rem)] drop-shadow-lg">{image}</span>}
  </button>;
});
