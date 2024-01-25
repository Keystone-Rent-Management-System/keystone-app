import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';
import Badge from '../explore/Badge';
import COLORS from '@/constants/Theme';

const StatsCard = () => {
  return (
    <View
      className={'mt-3 bg-primary rounded-xl h-40 relative overflow-hidden'}>
      <Image
        className="absolute inset-0 w-full h-full"
        source={require('../../../assets/images/home/card_bg.png')}
        alt="bg"
      />

      <View className={'inset-0 h-full p-3 flex-1 flex-col'}>
        <View className={'flex-row justify-end'}>
          <Badge ClassName={'flex-row bg-bg_green space-x-1'}>
            <Text className={'font-inter text-2xs text-c_green'}>
              Green Zone
            </Text>
          </Badge>
        </View>

        {/* Balance */}
        <View>
          <Text style={styles.cartLabel} className={' font-inter text-xs'}>
            Balance{' '}
          </Text>

          <Text className={'text-lg text-white font-inter-semibold'}>
            KES. 35,000.00
          </Text>
        </View>

        <View className={'justify-self-end mt-6 flex-row'}>
          <View className={'flex-1'}>
            <Text style={styles.cartLabel} className={' font-inter text-11'}>
              Due Date
            </Text>

            <Text className={'text-11 text-white font-inter-semibold'}>
              12/12/2023
            </Text>
          </View>

          <View className={'flex-1'}>
            <Text style={styles.cartLabel} className={' font-inter text-11'}>
              Rent
            </Text>

            <Text className={'text-11 text-white font-inter-semibold'}>
              KES. 30,000/Mo
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default StatsCard;

const styles = StyleSheet.create({
  cartLabel: {
    color: COLORS.white + '90',
  },
});
