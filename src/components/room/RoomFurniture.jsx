import React, { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { getFurnitureById } from '../../domain/furniture/furnitureCatalog';
import { ROOM_SIZE } from '../../domain/furniture/furnitureInventory';

export const RoomFurniture = ({ roomRef, items, onMove, onRemove }) => {
  const [selectedInstanceId, setSelectedInstanceId] = useState(null);
  const drag = useRef(null);

  const pointInRoom = (event) => {
    const rect = roomRef.current.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (ROOM_SIZE.width / rect.width),
      y: (event.clientY - rect.top) * (ROOM_SIZE.height / rect.height),
    };
  };

  const startDrag = (event, item) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = pointInRoom(event);
    drag.current = { instanceId: item.instanceId, offsetX: point.x - item.x, offsetY: point.y - item.y };
    setSelectedInstanceId(item.instanceId);
  };

  const moveDrag = (event) => {
    if (!drag.current) return;
    const point = pointInRoom(event);
    onMove(drag.current.instanceId, point.x - drag.current.offsetX, point.y - drag.current.offsetY);
  };

  const endDrag = (event) => {
    if (!drag.current) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    drag.current = null;
  };

  return items.map((item) => {
    const furniture = getFurnitureById(item.furnitureId);
    if (!furniture) return null;
    const isSelected = selectedInstanceId === item.instanceId;
    return (
      <div
        key={item.instanceId}
        role="button"
        tabIndex={0}
        aria-label={`${furniture.name}。ドラッグして移動`}
        onPointerDown={(event) => startDrag(event, item)}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`absolute touch-none select-none ${isSelected ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-900' : ''}`}
        style={{ left: `${(item.x / ROOM_SIZE.width) * 100}%`, top: `${(item.y / ROOM_SIZE.height) * 100}%`, width: `${(furniture.width / ROOM_SIZE.width) * 100}%`, height: `${(furniture.height / ROOM_SIZE.height) * 100}%`, zIndex: item.zIndex }}
      >
        <span className="flex h-full w-full items-center justify-center text-[clamp(1.8rem,8vw,4rem)] drop-shadow-lg">{furniture.image}</span>
        {isSelected && <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => onRemove(item.instanceId)} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-400 text-slate-950 shadow" aria-label={`${furniture.name}を片付ける`}><X className="h-4 w-4 stroke-[3]" /></button>}
      </div>
    );
  });
};
