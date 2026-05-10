import { create } from 'zustand';
import { DEFAULT_RAW_PRICES, DEFAULT_ECONOMY_ITEMS } from "./lib/constants";

interface StoreState {
  globalRawPrices: Record<string, { md: string; nd: string }>;
  globalScrapPrice: string;
  globalRemnantPrice: string;
  customGrades: string[];
  deletedGrades: string[];
  remnantPricing: Record<string, { round: string; hex: string }>;
  economyItems: any[];
  isUserSettingsLoaded: boolean;
  
  setGlobalRawPrices: (prices: Record<string, { md: string; nd: string }>) => void;
  setGlobalScrapPrice: (price: string) => void;
  setGlobalRemnantPrice: (price: string) => void;
  setCustomGrades: (grades: string[]) => void;
  setDeletedGrades: (grades: string[]) => void;
  setRemnantPricing: (pricing: Record<string, { round: string; hex: string }>) => void;
  setEconomyItems: (items: any[]) => void;
  setIsUserSettingsLoaded: (loaded: boolean) => void;
}

export const useStore = create<StoreState>((set) => ({
  globalRawPrices: DEFAULT_RAW_PRICES,
  globalScrapPrice: "20000",
  globalRemnantPrice: "30000",
  customGrades: [],
  deletedGrades: [],
  remnantPricing: {},
  economyItems: DEFAULT_ECONOMY_ITEMS,
  isUserSettingsLoaded: false,

  setGlobalRawPrices: (prices) => set({ globalRawPrices: prices }),
  setGlobalScrapPrice: (price) => set({ globalScrapPrice: price }),
  setGlobalRemnantPrice: (price) => set({ globalRemnantPrice: price }),
  setCustomGrades: (grades) => set({ customGrades: grades }),
  setDeletedGrades: (grades) => set({ deletedGrades: grades }),
  setRemnantPricing: (pricing) => set({ remnantPricing: pricing }),
  setEconomyItems: (items) => set({ economyItems: items }),
  setIsUserSettingsLoaded: (loaded) => set({ isUserSettingsLoaded: loaded }),
}));
