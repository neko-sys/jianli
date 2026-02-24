export const reorderByIds = <T extends { id: string }>(items: T[], ids: string[]): T[] => {
  if (!ids.length) {
    return items;
  }

  const map = new Map(items.map((item) => [item.id, item]));
  const ordered = ids.map((id) => map.get(id)).filter((item): item is T => Boolean(item));
  const rest = items.filter((item) => !ids.includes(item.id));
  return [...ordered, ...rest];
};
