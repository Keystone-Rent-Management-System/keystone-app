import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';
import COLORS from '@/constants/Theme';
import numberWithCommas from '../../../utils/numberWithCommas';

const StatsCard = ({isPending, totals}) => {
  return (
    <View
      className={'mt-10 bg-primary rounded-xl h-36 relative overflow-hidden'}>
      <Image
        className="absolute inset-0 w-full h-full"
        source={require('../../../assets/images/home/card_bg.png')}
        alt="bg"
      />

      <View className={'p-3 inset-0 h-full'}>
        <View className={'flex-1 items-center flex-row justify-around'}>
          {/* Balance */}
          <View className={'flex-1 flex-row items-center gap-1'}>
            <Text style={styles.cartLabel} className={' font-inter text-xs'}>
              Debit:{' '}
            </Text>

            <Text className={'text-base text-white font-inter-semibold'}>
              KES.{' '}
              {!isPending
                ? numberWithCommas(Number(totals?.totalDebitedAmount ?? 0))
                : 0}
            </Text>
          </View>

          <View className={'flex-1 flex-row items-center gap-1'}>
            <Text style={styles.cartLabel} className={' font-inter text-xs'}>
              Credit:{' '}
            </Text>

            <Text className={'text-base text-white font-inter-semibold'}>
              KES.{' '}
              {!isPending
                ? numberWithCommas(Number(totals?.totalCreditedAmount ?? 0))
                : 0}
            </Text>
          </View>
        </View>
        {/* Balance */}
        <View className={'flex-1 flex-row items-center gap-1'}>
          <Text style={styles.cartLabel} className={' font-inter text-xs'}>
            Balance{' '}
          </Text>

          <Text className={'text-base text-white font-inter-semibold'}>
            KES.{' '}
            {!isPending
              ? numberWithCommas(
                  Number(
                    totals?.totalDebitedAmount - totals?.totalCreditedAmount ??
                      0,
                  ),
                )
              : 0}
          </Text>
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
