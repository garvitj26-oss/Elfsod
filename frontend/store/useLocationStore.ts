import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationStore {
  selectedCity: string | null;
  setSelectedCity: (city: string) => void;
  clearCity: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      selectedCity: null,
      setSelectedCity: (city: string) => {
        set({ selectedCity: city });
      },
      clearCity: () => {
        set({ selectedCity: null });
      },
    }),
    {
      name: 'location-storage', // unique name for localStorage key
      partialize: (state) => ({ selectedCity: state.selectedCity }), // only persist selectedCity
    }
  )
);

