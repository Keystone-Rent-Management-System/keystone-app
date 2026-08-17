import {fetchUnits, ISavedUnit, removeUnit, saveUnit} from '../lib/sqlite.ts';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {toast} from '../utils/toast';


interface ISaveUnit {
  unitId: string;
  data: any;
}

const queryKey = ['savedUnits'];

export const useFetchSavedUnits = () => {
  return useQuery({
    queryKey,
    queryFn: fetchUnits,
  });
};

const useSavedUnits = () => {
  const queryClient = useQueryClient();

  //   mutation to save unit
  const saveUnitMutation = useMutation({
    mutationFn: (d: ISaveUnit) => saveUnit(d.unitId, d.data),
    mutationKey: ['saveUnit'],
    onMutate: async (d: ISaveUnit) => {
      // update cache optimistically

      // cancel any outgoing fetch request
      await queryClient.cancelQueries({queryKey});

      // get previous data
      const previousData = queryClient.getQueryData<ISavedUnit[]>(queryKey);
      //   update cache
      queryClient.setQueryData<ISavedUnit[]>(queryKey, old => {
        if (!old) {
          return [
            {
              id: 1,
              unit_id: d.unitId,
              data: d.data,
              isLiked: true,
            },
          ];
        }
        return [
          ...old,
          {
            id: old.length + 1,
            unit_id: d.unitId,
            data: d.data,
            isLiked: true,
          },
        ];
      });

      return {previousData};
    },
    onSuccess: async () => {
      toast.show('Unit saved successfully', toast.SHORT);
      queryClient.refetchQueries({queryKey});
    },
    onError: async (_err, _vars, context) => {
      //   revert cache
      queryClient.setQueryData<ISavedUnit[]>(queryKey, context?.previousData);
      toast.show('An error occurred', toast.SHORT);
    },
    onSettled: () => queryClient.refetchQueries({queryKey}),
  });

  //  mutation to remove unit
  const removeUnitMutation = useMutation({
    mutationFn: (unitId: string) => removeUnit(unitId),
    mutationKey: ['removeUnit'],
    onMutate: async (unitId: string) => {
      // update cache optimistically
      await queryClient.cancelQueries({queryKey});

      const previousData = queryClient.getQueryData<ISavedUnit[]>(queryKey);

      queryClient.setQueryData<ISavedUnit[]>(queryKey, old => {
        if (!old) {
          return [];
        }
        return old.filter(unit => unit.unit_id !== unitId);
      });

      return {previousData};
    },
    onSuccess: async () => {
      toast.show('Unit removed successfully', toast.SHORT);
    },
    onError: async (_err, _vars, context) => {
      //   revert cache
      queryClient.setQueryData<ISavedUnit[]>(queryKey, context?.previousData);
      toast.show('An error occurred', toast.SHORT);
    },
    onSettled: () => queryClient.invalidateQueries({queryKey}),
  });

  return {
    saveUnitMutation,
    removeUnitMutation,
  };
};

export default useSavedUnits;
