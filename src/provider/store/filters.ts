import {create} from 'zustand';
import {IFilters} from '../../types/property.ts';

interface FiltersState {
  data: IFilters;
  addRemoveFilter: <K extends keyof IFilters>(
    key: K,
    value: IFilters[K],
    shouldResetRest?: boolean,
  ) => void;
  addRemoveFilters: (filters: IFilters) => void;
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
