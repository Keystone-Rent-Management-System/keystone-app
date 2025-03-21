import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {
  StatementsSvg,
  CallSvg,
  HelpSvg,
  PropertySvg,
  UnitSvg,
  TransactionSvg,
} from '@/assets/icons';
import {useNavigation} from '@react-navigation/native';

const Menu = () => {
  const navigation = useNavigation();

  const handleNavigate = screen => {
    if (screen?.name) {
      navigation.navigate(screen?.name);
    }
  };

  return (
    <>
      <View className={'py-8 px-4'}>
        <View>
          <Text className={'font-open-sauce-sans-medium text-13 text-ctext mb-3'}>
            Property profile
          </Text>

          <View className={'flex-row w-full justify-between'}>
            {propertyProfile.map((opt, ind) => (
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
          <Text className={'font-open-sauce-sans-medium text-13 text-ctext mb-3'}>
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
          <Text className={'font-open-sauce-sans-medium text-13 text-ctext mb-3'}>
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
    </>
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

    <Text className={'mt-3 text-inactive_text font-open-sauce-sans text-xs'}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  menuBtn: {
    elevation: 2,
  },
});

export default Menu;

const propertyProfile = [
  {
    icon: <PropertySvg />,
    text: 'Properties',
    screen: {
      name: 'properties',
    },
  },
  {
    icon: <UnitSvg />,
    text: 'Units',
    screen: {
      name: 'units',
    },
  },
];

const financeOptions = [
  {
    icon: <TransactionSvg />,
    text: 'Transactions',
    screen: {
      name: 'transactions',
    },
  },
  {
    icon: <StatementsSvg />,
    text: 'Statements',
    screen: {
      name: 'statements',
    },
  },
];

const assistance = [
  {
    icon: <CallSvg />,
    text: 'Call',
  },
  {
    icon: <HelpSvg />,
    text: 'Message',
  },
];
