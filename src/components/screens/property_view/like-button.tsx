import {LikeSvg} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import useSavedUnits, {useFetchSavedUnits} from '@/hooks/useSavedUnits';
import {IProperty} from '@/types/property';
import {cn} from '@/utils/tailwind';
import React, {useCallback, useMemo} from 'react';
import {TouchableOpacity, TouchableOpacityProps} from 'react-native';

interface ILikeButton extends TouchableOpacityProps {
  data: IProperty;
  color?: string;
  strokeColor?: string;
  iconProps?: any;
}

const LikeButton = ({
  data,
  className,
  color,
  strokeColor,
  iconProps,
  ...rest
}: ILikeButton) => {
  const {data: _data, refetch} = useFetchSavedUnits();

  const liked = useMemo(() => {
    return _data?.some(unit => unit.unit_id === data?.id);
  }, [_data, data?.id]);

  const {saveUnitMutation, removeUnitMutation} = useSavedUnits();
  const handleLike = useCallback(() => {
    // remove unit if already liked
    if (liked) {
      return removeUnitMutation.mutate(data.id);
    }

    saveUnitMutation.mutate({unitId: data.id, data});
    refetch();
  }, [data, liked, refetch, removeUnitMutation, saveUnitMutation]);

  return (
    <TouchableOpacity onPress={handleLike} className={cn(className)} {...rest}>
      <LikeSvg
        color={liked ? COLORS.likeRed : color || COLORS.text_color}
        opacity={liked ? '1' : '0.45'}
        strokeColor={liked ? COLORS.likeRed : strokeColor}
        {...iconProps}
      />
    </TouchableOpacity>
  );
};

export default LikeButton;
