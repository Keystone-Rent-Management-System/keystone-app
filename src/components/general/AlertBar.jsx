import React from 'react';

import {Text, View} from 'react-native';

const alertColors = {
  warning: {
    text: '#A27607',
    bg: '#FFD56825',
  },
};
const AlertBar = ({type = 'warning', message, icon}) => {
  return (
    <View
      className={'p-3 rounded-xl flex-row space-x-2 items-center'}
      style={{backgroundColor: alertColors[type]?.bg}}>
      {icon}
      <Text
        style={{color: alertColors[type]?.text}}
        className={'text-black font-inter text-xs'}>
        {message}
      </Text>
    </View>
  );
};

export default AlertBar;
