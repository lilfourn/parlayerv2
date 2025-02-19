import { create } from 'zustand';

interface SidebarStore {
  isExpanded: boolean;
  width: number;
  setIsExpanded: (expanded: boolean) => void;
  setWidth: (width: number) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isExpanded: false,
  width: 72, // Default collapsed width
  setIsExpanded: (expanded) => set({ isExpanded: expanded }),
  setWidth: (width) => set({ width }),
}));
