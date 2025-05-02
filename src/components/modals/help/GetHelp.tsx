import {CloseSvg} from '@/assets/icons';
import {HelpItem} from '@/components';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import React, {forwardRef} from 'react';
import {Text, View} from 'react-native';
import {CButton} from '../../general';
import {CustomBottomSheet} from '../index';

interface HelpItemProps {
  title: string;
  description: string;
}

interface GetHelpProps {
  handleCloseModal: () => void;
  handleMakeComplaint: () => void;
  handleRequestRepair: () => void;
  handleGeneralAssistance: () => void;
  handlePaymentAllocation: () => void;
  handleSheetChanges?: (index: number) => void;
}

const helpList: HelpItemProps[] = [
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
  {
    title: 'Allocate payment',
    description: 'Provide payment transaction code',
  },
];

const GetHelp = forwardRef<BottomSheet, GetHelpProps>((props, ref) => {
  const pressHandlers = [
    props?.handleMakeComplaint,
    props?.handleRequestRepair,
    props?.handleGeneralAssistance,
    props?.handlePaymentAllocation,
  ];

  return (
    <CustomBottomSheet
      ref={ref}
      snapPoints={['20%', '60%']}
      handleComponent={() => renderSheetHeader(props.handleCloseModal)}
      onChange={props.handleSheetChanges}>
      <BottomSheetScrollView className={'flex-1'}>
        <View className="px-4">
          <Text className={'text-xs font-open-sauce-sans text-grey_1 mb-2'}>
            What kind of help would you like support with? Select the most
            appropriate type of help.
          </Text>

          <View className={'py-3 flex-col space-y-3'}>
            {helpList.map((item, ind) => (
              <View key={ind}>
                <HelpItem
                  title={item.title}
                  desc={item.description}
                  handlePress={pressHandlers[ind]}
                />
              </View>
            ))}
          </View>
        </View>
      </BottomSheetScrollView>
    </CustomBottomSheet>
  );
});

const renderSheetHeader = (handleClose: () => void) => (
  <View
    className={
      'top-0 bg-none px-4 py-3 z-50 flex-row justify-between items-end'
    }>
    <Text className={'font-open-sauce-sans-semibold text-lg text-black'}>
      Get Help
    </Text>

    <CButton
      ClassName={'rounded-full bg-gray-200 h-8 w-8 p-0'}
      onPress={handleClose}>
      <CloseSvg />
    </CButton>
  </View>
);

export default GetHelp;
