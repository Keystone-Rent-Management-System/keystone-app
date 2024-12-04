import React, {memo} from 'react';
import {Pressable, Text, View} from 'react-native';
import {StatementsSvg} from '../../../assets/icons';
import moment from 'moment';

interface IStatementItem {
  invoiceNumber: string;
  startingBalance: string;
  date: string;
  paymentAmount: string;
  handlePress?: () => void;
}

const StatementItem = ({
  invoiceNumber,
  startingBalance,
  date,
  paymentAmount,
}: IStatementItem) => {
  return (
    <Pressable
      className={'flex-row space-x-2 py-3.5 border-b border-border_grey'}>
      {/*  text  */}
      <View
        className={
          'items-center justify-center h-10 w-10 rounded-full bg-white overflow-hidden border border-border_grey'
        }>
        <View className={'px-3 black my-auto flex items-center justify-center'}>
          <StatementsSvg />
        </View>
      </View>

      <View className={'flex-1 gap-y-2'}>
        {/*  Row 1  */}
        <View className={'flex flex-row justify-between'}>
          {/*column 1 */}
          <Text className={'text-primary text-sm font-inter-semibold'}>
            {invoiceNumber}
          </Text>

          <Text className={'text-zinc-400 text-xs font-inter'}>
            {moment(date).format('DD MMM YY')}
          </Text>
        </View>

        {/*Row 2*/}
        <View className={'flex flex-row justify-between'}>
          <Text className={'text-zinc-400 text-xs font-inter'}>
            {`Starting Bal: KES ${startingBalance}`}
          </Text>

          <Text className={'text-black text-[13px] font-inter-semibold'}>
            KES {paymentAmount}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default memo(StatementItem);
