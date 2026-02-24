import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useId } from 'react';
import type { ReactNode } from 'react';

interface SortableListProps<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (items: T[]) => void;
  render: (item: T) => ReactNode;
  itemClassName?: string;
}

const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
  const next = [...list];
  const [removed] = next.splice(startIndex, 1);
  next.splice(endIndex, 0, removed);
  return next;
};

export const SortableList = <T,>({
  items,
  getId,
  onReorder,
  render,
  itemClassName,
}: SortableListProps<T>) => {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const droppableId = `sortable-list-${instanceId}`;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    const { source, destination } = result;
    if (source.index === destination.index) {
      return;
    }
    onReorder(reorder(items, source.index, destination.index));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="sortable-list">
            {items.map((item, index) => {
              const id = getId(item);
              const draggableId = `${droppableId}-item-${id}`;
              return (
                <Draggable key={id} draggableId={draggableId} index={index}>
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={itemClassName}
                      style={dragProvided.draggableProps.style}
                    >
                      <div className="drag-handle" {...dragProvided.dragHandleProps}>
                        ↕
                      </div>
                      <div>{render(item)}</div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
