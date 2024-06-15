import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';
import COLORS from '@/constants/Theme';
import numberWithCommas from '../../../utils/numberWithCommas';

const StatsCard = ({invoice}) => {
  return (
    <View
      className={'mt-3 bg-primary rounded-xl h-40 relative overflow-hidden'}>
      <Image
        className="absolute inset-0 w-full h-full"
        source={require('../../../assets/images/home/card_bg.png')}
        alt="bg"
      />

      <View className={'inset-0 h-full p-3 flex-1 flex-col'}>
        {/* Balance */}
        <View>
          <Text style={styles.cartLabel} className={' font-inter text-xs'}>
            Balance{' '}
          </Text>

          <Text className={'text-lg text-white font-inter-semibold'}>
            KES. {numberWithCommas(Number(invoice?.dueAmount))}
          </Text>
        </View>

        <View className={'justify-self-end mt-12 flex-row'}>
          <View className={'flex-1'}>
            <Text style={styles.cartLabel} className={' font-inter text-11'}>
              Due Date
            </Text>

            <Text className={'text-11 text-white font-inter-semibold'}>
              5/06/2024
            </Text>
          </View>

          <View className={'flex-1'}>
            <Text style={styles.cartLabel} className={' font-inter text-11'}>
              Rent
            </Text>

            <Text className={'text-11 text-white font-inter-semibold'}>
              KES. {numberWithCommas(Number(invoice?.totalAmount))}/Mo
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
