import React from 'react';
import {Text, View} from 'react-native';

import {CButton} from '../../general';
import {DownloadSvg} from '../../../assets/icons/invoice';

const Footer = ({handlePrompt, hasConcern, status, handleViewReceipt}) => (
  <View className={'h-16 p-2 px-4 flex-row w-full bg-bg shadow-xl space-x-4'}>
    {status === 'paid' || status === 'overpaid' ? (
      <CButton
        ClassName={'bg-none border border-primary flex-1 mr-5 mx-auto py-0'}
        text={''}
        onPress={handleViewReceipt}>
        <View className="flex-row items-center justify-center gap-x-2">
          <DownloadSvg />

          <Text className={'text-primary font-open-sauce-sans text-[13px] mt-1'}>
            View Receipt
          </Text>
        </View>
      </CButton>
    ) : (
      <>
        {hasConcern ? (
          <CButton
            ClassName={
              'bg-none border border-primary flex-1 mr-5 mx-auto cursor-default'
            }
            textClassName={'text-primary font-open-sauce-sans text-sm'}
            text={'To be resolved'}
          />
        ) : (
          <CButton
            ClassName={'bg-primary flex-1'}
            textClassName={'text-white font-open-sauce-sans text-sm'}
            text={'View payment instructions'}
            onPress={handlePrompt}
          />
        )}
      </>
    )}
  </View>
);

export default Footer;
