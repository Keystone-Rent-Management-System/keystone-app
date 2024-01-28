import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import {BillsSvg, InvoiceSvg, StatementsSvg} from '@/assets/icons';
import {CallSvg, ExtensionSvg, HelpSvg} from '../../../assets/icons';
import {useNavigation} from '@react-navigation/native';

const Menu = () => {
  const navigation = useNavigation();

  const handleNavigate = screen => {
    if (screen?.name) {
      navigation.navigate(screen?.name);
    }
  };

  return (
    <View className={'py-8 px-4'}>
      <View>
        <Text className={'font-inter-medium text-13 text-ctext mb-3'}>
          Finance & Payments
        </Text>

        <View className={'flex-row w-full justify-between'}>
          {financeOptions.map((opt, ind) => (
            <MenuBtn
              key={ind}
              icon={opt.icon}
              text={opt.text}
              handlePress={() => handleNavigate(opt?.screen)}
            />
          ))}
        </View>
      </View>

      <View className={'mt-8'}>
        <Text className={'font-inter-medium text-13 text-ctext mb-3'}>
          Assistance
        </Text>

        <View className={'flex-row w-full justify-between'}>
          {assistance.map((opt, ind) => (
            <MenuBtn
              key={ind}
              icon={opt.icon}
              text={opt.text}
              handlePress={() => handleNavigate(opt?.screen)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const MenuBtn = ({icon, text, handlePress}) => (
  <View className={'items-center'}>
    <TouchableOpacity
      className={
        'items-center justify-center h-12 w-12 rounded-full bg-white overflow-hidden'
      }
      style={styles.menuBtn}
      onPress={handlePress}>
      {icon}
    </TouchableOpacity>

    <Text className={'mt-3 text-inactive_text font-inter text-xs'}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  menuBtn: {
    elevation: 2,
  },
});

export default Menu;

const financeOptions = [
  {
    icon: <InvoiceSvg />,
    text: 'Invoices',
    screen: {
      name: 'invoice_top_tabs',
    },
  },
  {
    icon: <StatementsSvg />,
    text: 'Statements',
  },
  {
    icon: <BillsSvg />,
    text: 'Bills',
  },
];

const assistance = [
  {
    icon: <CallSvg />,
    text: 'Call',
  },
  {
    icon: <HelpSvg />,
    text: 'Help',
  },
  {
    icon: <ExtensionSvg />,
    text: 'Extension',
  },
];
