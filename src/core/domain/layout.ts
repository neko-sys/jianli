import type { SectionItemsOrder, SectionOrder } from './types';

const arrayMove = <T,>(arr: T[], from: number, to: number): T[] => {
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

export const moveSection = (order: SectionOrder, from: number, to: number): SectionOrder => {
  if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) {
    return order;
  }
  return arrayMove(order, from, to);
};

export const moveItem = (
  itemsOrder: SectionItemsOrder,
  sectionId: string,
  from: number,
  to: number,
): SectionItemsOrder => {
  const section = itemsOrder[sectionId] ?? [];
  if (from === to || from < 0 || to < 0 || from >= section.length || to >= section.length) {
    return itemsOrder;
  }
  return {
    ...itemsOrder,
    [sectionId]: arrayMove(section, from, to),
  };
};
