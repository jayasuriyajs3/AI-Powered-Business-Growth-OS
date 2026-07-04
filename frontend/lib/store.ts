import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  businessId: string | null;
  businessName: string | null;
  industry: string | null;
  setBusinessId: (id: string) => void;
  setBusinessName: (name: string) => void;
  setIndustry: (industry: string) => void;
  clearBusiness: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      businessId: null,
      businessName: null,
      industry: null,
      setBusinessId: (id) => set({ businessId: id }),
      setBusinessName: (name) => set({ businessName: name }),
      setIndustry: (industry) => set({ industry }),
      clearBusiness: () => set({ businessId: null, businessName: null, industry: null }),
    }),
    { name: 'growthos-store' }
  )
);
