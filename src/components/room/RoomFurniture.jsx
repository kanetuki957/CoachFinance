import React from 'react';
import { getProductById, isProductImagePath } from '../../domain/shop/productCatalog';
import { getGridFootprint, ROOM_GRID } from '../../domain/furniture/furnitureInventory';

export const RoomFurniture = ({ items, onEdit, disabled = false }) => items.map((item) => {
  const product = getProductById(item.furnitureId);
  if (!product?.isFurniture) return null;
  const footprint = getGridFootprint(product, item.orientation);
  const image = footprint.image;
  return <button key={item.instanceId} type="button" disabled={disabled} onClick={() => onEdit(item)} aria-label={`${product.name}を編集`} className={`absolute touch-none select-none disabled:pointer-events-none ${item.placedAt ? 'animate-[furniture-pop_.28s_ease-out]' : ''}`} style={{ left: `${(item.gridX / ROOM_GRID.columns) * 100}%`, top: `${(item.gridY / ROOM_GRID.rows) * 100}%`, width: `${(footprint.gridWidth / ROOM_GRID.columns) * 100}%`, height: `${(footprint.gridHeight / ROOM_GRID.rows) * 100}%`, zIndex: item.zIndex }}>
    {isProductImagePath(image) ? <img src={image} alt={product.name} draggable={false} className="pointer-events-none block h-full w-full object-contain drop-shadow-lg" /> : <span className="flex h-full w-full items-center justify-center text-[clamp(1.8rem,8vw,4rem)] drop-shadow-lg">{image}</span>}
  </button>;
});
