import React, {forwardRef} from 'react';

import {ScrollView, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {CustomBottomSheet} from '../index';
import {CButton} from '../../general';
import {CloseSvg} from '@/assets/icons';
import {HelpItem} from '@/components';

const GetHelp = forwardRef((props, ref) => {
  const navigation = useNavigation();

  const pressHandlers = [
    props?.handleMovingOut,
    props?.handleMakeComplaint,
    props?.handleRequestRepair,
    props?.handleGeneralAssistance,
  ];

  return (
    <CustomBottomSheet
      snapPoints={['20%', '60%']}
      ref={ref}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <ScrollView className={'px-4'}>
        <Text className={'text-xs font-inter text-grey_1 mb-2'}>
          What kind of help would you like support with. Select the most
          appropriate type of Help
        </Text>

        <View className={'py-3 flex-col space-y-3'}>
          {helpList?.map((item, ind) => (
            <View key={ind}>
              <HelpItem
                title={item.title}
                desc={item?.description}
                handlePress={pressHandlers?.at(ind)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = handleClose => (
  <View
    className={
      ' top-0 bg-none px-4 py-3 z-50  flex-row justify-between items-end'
    }>
    <Text className={'font-inter-semibold text-lg text-black'}>Get Help</Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0 '}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);
export default GetHelp;

const helpList = [
  {
    title: 'Moving out notice',
    description: 'Issue notice to move out',
  },
  {
    title: 'Make a complaint',
    description: 'Raise a complaint',
  },
  {
    title: 'Request repair',
    description: 'Notify or request repairs',
  },
  {
    title: 'General Assistance',
    description: 'Any other form of assistance',
  },
];
