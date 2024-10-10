import {create} from 'zustand';

interface IFilters {
  bedrooms?: number;
  houseType?: string;
  bathrooms?: number;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface FiltersState {
  data: IFilters;
  addRemoveFilter: <K extends keyof IFilters>(
    key: K,
    value: IFilters[K],
    shouldResetRest?: boolean,
  ) => void;
  resetFilters: () => void;
}

export const useFiltersStore = create<FiltersState>(set => ({
  data: {},
  addRemoveFilter: <K extends keyof IFilters>(
    key: K,
    value: IFilters[K],
    shouldResetRest?: boolean,
  ) => {
    set(state => {
      const newFilters = shouldResetRest ? {} : {...state.data};

      if (state.data[key]) {
        newFilters[key] = undefined;
      } else {
        newFilters[key] = value;
      }
      return {data: newFilters};
    });
  },
  addRemoveFilters: (filters: IFilters) => {
    set(state => {
      const newFilters = {...state.data, ...filters};
      return {data: newFilters};
    });
  },
  resetFilters: () => set(() => ({data: {}})),
}));
