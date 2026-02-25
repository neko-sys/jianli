type LayoutMode = 'linear' | 'compact-grid' | 'two-column';
type SectionSlot = 'root' | 'compact-grid' | 'column-left' | 'column-right';

interface SectionBlock {
  element: HTMLElement;
  slot: SectionSlot;
}

interface TemplateShape {
  mode: LayoutMode;
  header: HTMLElement | null;
  leadBlocks: HTMLElement[];
  sections: SectionBlock[];
  tailBlocks: HTMLElement[];
  compactGrid: HTMLElement | null;
  columns: HTMLElement | null;
  leftColumn: HTMLElement | null;
  rightColumn: HTMLElement | null;
}

interface PageContext {
  pageElement: HTMLElement;
  templateElement: HTMLElement;
  compactGrid: HTMLElement | null;
  leftColumn: HTMLElement | null;
  rightColumn: HTMLElement | null;
  blockCount: number;
}

interface SectionShell {
  section: HTMLElement;
  content: HTMLElement;
}

const SECTION_SELECTOR = ':scope > .resume-section';
const ENTRY_SELECTOR = ':scope > .entry';

const queryChild = (root: HTMLElement, selector: string): HTMLElement | null =>
  root.querySelector<HTMLElement>(selector);

const collectTemplateShape = (sourceTemplate: HTMLElement): TemplateShape => {
  const header = queryChild(sourceTemplate, ':scope > header');
  const compactGrid = queryChild(sourceTemplate, ':scope > .compact-grid');
  const columns = queryChild(sourceTemplate, ':scope > .columns');
  const leftColumn = columns?.children.item(0) as HTMLElement | null;
  const rightColumn = columns?.children.item(1) as HTMLElement | null;

  let mode: LayoutMode = 'linear';
  if (compactGrid) {
    mode = 'compact-grid';
  } else if (columns && leftColumn && rightColumn) {
    mode = 'two-column';
  }

  const sections: SectionBlock[] = [];
  if (mode === 'compact-grid' && compactGrid) {
    const nodes = Array.from(compactGrid.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
    nodes.forEach((element) => sections.push({ element, slot: 'compact-grid' }));
  } else if (mode === 'two-column' && leftColumn && rightColumn) {
    const left = Array.from(leftColumn.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
    const right = Array.from(rightColumn.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
    left.forEach((element) => sections.push({ element, slot: 'column-left' }));
    right.forEach((element) => sections.push({ element, slot: 'column-right' }));
  } else {
    const nodes = Array.from(sourceTemplate.querySelectorAll<HTMLElement>(SECTION_SELECTOR));
    nodes.forEach((element) => sections.push({ element, slot: 'root' }));
  }

  const skipBlocks = new Set<HTMLElement>();
  if (header) {
    skipBlocks.add(header);
  }
  if (compactGrid) {
    skipBlocks.add(compactGrid);
  }
  if (columns) {
    skipBlocks.add(columns);
  }

  const leadBlocks: HTMLElement[] = [];
  const tailBlocks: HTMLElement[] = [];
  let seenSectionHost = false;
  const directChildren = Array.from(sourceTemplate.children).filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );

  for (const child of directChildren) {
    if (child.classList.contains('resume-section')) {
      seenSectionHost = true;
      continue;
    }
    if (skipBlocks.has(child)) {
      if (child === compactGrid || child === columns) {
        seenSectionHost = true;
      }
      continue;
    }
    if (!seenSectionHost) {
      leadBlocks.push(child);
      continue;
    }
    tailBlocks.push(child);
  }

  return {
    mode,
    header,
    leadBlocks,
    sections,
    tailBlocks,
    compactGrid,
    columns,
    leftColumn,
    rightColumn,
  };
};

const createPage = (sourceTemplate: HTMLElement, shape: TemplateShape): PageContext => {
  const pageElement = document.createElement('article');
  pageElement.className = 'resume-page';

  const templateElement = sourceTemplate.cloneNode(false) as HTMLElement;
  templateElement.classList.add('resume-page-template');
  pageElement.appendChild(templateElement);

  let compactGrid: HTMLElement | null = null;
  let leftColumn: HTMLElement | null = null;
  let rightColumn: HTMLElement | null = null;

  if (shape.mode === 'compact-grid' && shape.compactGrid) {
    compactGrid = shape.compactGrid.cloneNode(false) as HTMLElement;
    templateElement.appendChild(compactGrid);
  } else if (
    shape.mode === 'two-column' &&
    shape.columns &&
    shape.leftColumn &&
    shape.rightColumn
  ) {
    const columns = shape.columns.cloneNode(false) as HTMLElement;
    leftColumn = shape.leftColumn.cloneNode(false) as HTMLElement;
    rightColumn = shape.rightColumn.cloneNode(false) as HTMLElement;
    columns.appendChild(leftColumn);
    columns.appendChild(rightColumn);
    templateElement.appendChild(columns);
  }

  return {
    pageElement,
    templateElement,
    compactGrid,
    leftColumn,
    rightColumn,
    blockCount: 0,
  };
};

const isOverflow = (pageTemplate: HTMLElement): boolean =>
  pageTemplate.scrollHeight - pageTemplate.clientHeight > 0.5;

const resolveParent = (context: PageContext, slot: SectionSlot): HTMLElement => {
  switch (slot) {
    case 'compact-grid':
      return context.compactGrid ?? context.templateElement;
    case 'column-left':
      return context.leftColumn ?? context.templateElement;
    case 'column-right':
      return context.rightColumn ?? context.templateElement;
    case 'root':
    default:
      return context.templateElement;
  }
};

const tryAppendAtomic = (
  context: PageContext,
  parent: HTMLElement,
  element: HTMLElement,
): boolean => {
  parent.appendChild(element);
  if (!isOverflow(context.templateElement)) {
    return true;
  }
  parent.removeChild(element);
  return false;
};

const makeSectionShell = (sourceSection: HTMLElement, continued: boolean): SectionShell => {
  const section = sourceSection.cloneNode(false) as HTMLElement;
  const title = queryChild(sourceSection, ':scope > h2');
  const sourceContent = queryChild(sourceSection, ':scope > div');
  const content =
    sourceContent?.cloneNode(false) instanceof HTMLElement
      ? (sourceContent.cloneNode(false) as HTMLElement)
      : document.createElement('div');

  if (title) {
    const titleClone = title.cloneNode(true) as HTMLElement;
    if (continued) {
      const text = titleClone.textContent?.trim() ?? '';
      titleClone.textContent = text ? `${text}（续）` : '（续）';
    }
    section.appendChild(titleClone);
  }
  section.appendChild(content);
  if (continued) {
    section.classList.add('resume-section-continued');
  }
  return { section, content };
};

const forceAppend = (
  context: PageContext,
  slot: SectionSlot,
  node: HTMLElement,
): void => {
  const parent = resolveParent(context, slot);
  parent.appendChild(node);
  context.blockCount += 1;
};

const appendSection = (
  sourceSection: HTMLElement,
  slot: SectionSlot,
  getContext: () => PageContext,
  setContext: (next: PageContext) => void,
  createNextPage: () => PageContext,
): void => {
  let context = getContext();
  const parent = resolveParent(context, slot);
  const entriesRoot = queryChild(sourceSection, ':scope > div');
  const entries = entriesRoot
    ? Array.from(entriesRoot.querySelectorAll<HTMLElement>(ENTRY_SELECTOR))
    : [];

  if (entries.length === 0) {
    const atomicSection = sourceSection.cloneNode(true) as HTMLElement;
    if (tryAppendAtomic(context, parent, atomicSection)) {
      context.blockCount += 1;
      return;
    }
    context = createNextPage();
    setContext(context);
    const nextParent = resolveParent(context, slot);
    if (tryAppendAtomic(context, nextParent, atomicSection)) {
      context.blockCount += 1;
      return;
    }
    atomicSection.classList.add('resume-block-overflow');
    forceAppend(context, slot, atomicSection);
    return;
  }

  let shell = makeSectionShell(sourceSection, false);
  parent.appendChild(shell.section);
  if (isOverflow(context.templateElement)) {
    parent.removeChild(shell.section);
    context = createNextPage();
    setContext(context);
    const nextParent = resolveParent(context, slot);
    nextParent.appendChild(shell.section);
  }

  let hasPlacedEntry = false;
  for (let index = 0; index < entries.length; index += 1) {
    const entryClone = entries[index].cloneNode(true) as HTMLElement;
    shell.content.appendChild(entryClone);
    if (!isOverflow(context.templateElement)) {
      hasPlacedEntry = true;
      continue;
    }

    shell.content.removeChild(entryClone);
    if (index === 0 && context.blockCount > 0) {
      const currentParent = shell.section.parentElement;
      if (currentParent) {
        currentParent.removeChild(shell.section);
      }
      context = createNextPage();
      setContext(context);
      const nextParent = resolveParent(context, slot);
      nextParent.appendChild(shell.section);
      shell.content.appendChild(entryClone);
      if (!isOverflow(context.templateElement)) {
        hasPlacedEntry = true;
        continue;
      }
      shell.content.removeChild(entryClone);
    }

    context = createNextPage();
    setContext(context);
    const nextParent = resolveParent(context, slot);
    shell = makeSectionShell(sourceSection, true);
    nextParent.appendChild(shell.section);
    shell.content.appendChild(entryClone);

    if (!isOverflow(context.templateElement)) {
      hasPlacedEntry = true;
      continue;
    }

    shell.content.removeChild(entryClone);
    shell.content.appendChild(entryClone);
    shell.section.classList.add('resume-block-overflow');
    hasPlacedEntry = true;
  }

  if (hasPlacedEntry) {
    context.blockCount += 1;
  }
};

export const paginateTemplateDom = (
  sourceTemplate: HTMLElement,
  targetRoot: HTMLElement,
): number => {
  targetRoot.innerHTML = '';
  const shape = collectTemplateShape(sourceTemplate);
  const pages: PageContext[] = [];

  const createAndRegisterPage = (): PageContext => {
    const page = createPage(sourceTemplate, shape);
    pages.push(page);
    targetRoot.appendChild(page.pageElement);
    return page;
  };

  let context = createAndRegisterPage();
  const setContext = (next: PageContext) => {
    context = next;
  };
  const getContext = () => context;
  const createNextPage = (): PageContext => createAndRegisterPage();

  const appendRootAtomicBlock = (sourceBlock: HTMLElement): void => {
    const clone = sourceBlock.cloneNode(true) as HTMLElement;
    if (tryAppendAtomic(context, context.templateElement, clone)) {
      context.blockCount += 1;
      return;
    }
    context = createNextPage();
    if (tryAppendAtomic(context, context.templateElement, clone)) {
      context.blockCount += 1;
      return;
    }
    clone.classList.add('resume-block-overflow');
    forceAppend(context, 'root', clone);
  };

  if (shape.header) {
    appendRootAtomicBlock(shape.header);
  }
  shape.leadBlocks.forEach((block) => appendRootAtomicBlock(block));
  shape.sections.forEach((block) => {
    appendSection(block.element, block.slot, getContext, setContext, createNextPage);
  });
  shape.tailBlocks.forEach((block) => appendRootAtomicBlock(block));

  return pages.length;
};
