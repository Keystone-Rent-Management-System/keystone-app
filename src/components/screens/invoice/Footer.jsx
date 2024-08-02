import React from 'react';
import {View} from 'react-native';

import {CButton} from '../../general';

const Footer = ({handlePrompt, hasConcern, status, handleViewReceipt}) => (
  <View className={'h-16 p-2 px-4 flex-row w-full bg-bg shadow-xl space-x-4'}>
    {status === 'paid' || status === 'overpaid' ? (
      <CButton
        ClassName={'bg-none border border-primary flex-1 mr-5 mx-auto'}
        textClassName={'text-primary font-inter text-xs'}
        text={'View Receipt'}
        onPress={handleViewReceipt}
      />
    ) : (
      <>
        {hasConcern ? (
          <CButton
            ClassName={
              'bg-none border border-primary flex-1 mr-5 mx-auto cursor-default'
            }
            textClassName={'text-primary font-inter text-xs'}
            text={'To be resolved'}
          />
        ) : (
          <CButton
            ClassName={'bg-primary flex-1'}
            textClassName={'text-white font-inter text-xs'}
            text={'View payment instructions'}
            onPress={handlePrompt}
          />
        )}
      </>
    )}
  </View>
);

export default Footer;
