import { useMemo } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from '@hello-pangea/dnd';
import type { SectionRegion, SectionType } from '../../core/domain/types';

const LEFT_ID = 'layout-left';
const RIGHT_ID = 'layout-right';
const LAYOUT_DRAG_PREFIX = 'layout-section-';

interface Props {
  sectionOrder: SectionType[];
  sectionRegions: Partial<Record<SectionType, SectionRegion>>;
  labels: Record<SectionType, string>;
  onChange: (next: {
    sectionOrder: SectionType[];
    sectionRegions: Partial<Record<SectionType, SectionRegion>>;
  }) => void;
}

const buildColumns = (
  order: SectionType[],
  regions: Partial<Record<SectionType, SectionRegion>>,
): Record<SectionRegion, SectionType[]> => ({
  left: order.filter((item) => item !== 'profile' && (regions[item] ?? 'right') === 'left'),
  right: order.filter((item) => item !== 'profile' && (regions[item] ?? 'right') === 'right'),
});

const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
  const next = [...list];
  const [removed] = next.splice(startIndex, 1);
  next.splice(endIndex, 0, removed);
  return next;
};

const mergeOrder = (
  original: SectionType[],
  left: SectionType[],
  right: SectionType[],
): SectionType[] => {
  const next = [
    'profile' as SectionType,
    ...left.filter((item) => item !== 'profile'),
    ...right.filter((item) => item !== 'profile'),
  ];
  const rest = original.filter((item) => item !== 'profile' && !next.includes(item));
  return [...next, ...rest];
};

const toRegion = (droppableId: string): SectionRegion | undefined => {
  if (droppableId === LEFT_ID) {
    return 'left';
  }
  if (droppableId === RIGHT_ID) {
    return 'right';
  }
  return undefined;
};

const toDraggableId = (section: SectionType): string => `${LAYOUT_DRAG_PREFIX}${section}`;
const fromDraggableId = (id: string): SectionType | undefined => {
  if (!id.startsWith(LAYOUT_DRAG_PREFIX)) {
    return undefined;
  }
  return id.slice(LAYOUT_DRAG_PREFIX.length) as SectionType;
};

const Column = ({
  id,
  title,
  items,
  labels,
  showFixedProfile = false,
}: {
  id: SectionRegion;
  title: string;
  items: SectionType[];
  labels: Record<SectionType, string>;
  showFixedProfile?: boolean;
}) => {
  const droppableId = id === 'left' ? LEFT_ID : RIGHT_ID;

  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`layout-column ${snapshot.isDraggingOver ? 'over' : ''}`}
        >
          <h4>{title}</h4>
          {showFixedProfile && (
            <div className="layout-item fixed layout-item-static">
              <span className="drag-handle">↕</span>
              <span>{labels.profile}</span>
              <small>固定</small>
            </div>
          )}
          {items.map((item, index) => (
            <Draggable key={item} draggableId={toDraggableId(item)} index={index}>
              {(dragProvided) => (
                <div
                  ref={dragProvided.innerRef}
                  {...dragProvided.draggableProps}
                  className="layout-item"
                  style={dragProvided.draggableProps.style}
                >
                  <span className="drag-handle" {...dragProvided.dragHandleProps}>
                    ↕
                  </span>
                  <span>{labels[item]}</span>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export const SectionLayoutBoard = ({
  sectionOrder,
  sectionRegions,
  labels,
  onChange,
}: Props) => {
  const columns = useMemo(
    () => buildColumns(sectionOrder, sectionRegions),
    [sectionOrder, sectionRegions],
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;
    const sourceRegion = toRegion(source.droppableId);
    const targetRegion = toRegion(destination.droppableId);
    if (!sourceRegion || !targetRegion) {
      return;
    }

    const activeId = fromDraggableId(draggableId);
    if (!activeId) {
      return;
    }
    if (activeId === 'profile') {
      return;
    }

    const left = [...columns.left];
    const right = [...columns.right];
    const sourceList = sourceRegion === 'left' ? left : right;
    const targetList = targetRegion === 'left' ? left : right;

    if (sourceRegion === targetRegion) {
      if (source.index === destination.index) {
        return;
      }
      const updated = reorder(sourceList, source.index, destination.index);
      onChange({
        sectionOrder:
          sourceRegion === 'left'
            ? mergeOrder(sectionOrder, updated, right)
            : mergeOrder(sectionOrder, left, updated),
        sectionRegions,
      });
      return;
    }

    const [moved] = sourceList.splice(source.index, 1);
    targetList.splice(destination.index, 0, moved);

    onChange({
      sectionOrder: mergeOrder(sectionOrder, left, right),
      sectionRegions: {
        ...sectionRegions,
        [activeId]: targetRegion,
      },
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="layout-board">
        <Column id="left" title="左栏" items={columns.left} labels={labels} showFixedProfile />
        <Column id="right" title="右栏" items={columns.right} labels={labels} />
      </div>
    </DragDropContext>
  );
};
