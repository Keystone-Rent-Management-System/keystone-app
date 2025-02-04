import React, {ReactNode, useMemo} from 'react';

import moment from 'moment/moment';
import {Text, TouchableOpacity, View} from 'react-native';

interface IListingItem {
  icon: ReactNode;
  title: string;
  date: string;
  unit: string;
  amount: number;
  status: string;
  customDate?: string;
  isPartial?: boolean;
  handlePress: () => void;
  disabled?: boolean;
  paymentStatus?: string;
  balance?: number;
}

const ListingItem = ({
  icon,
  title,
  date,
  unit,
  amount,
  customDate,
  isPartial,
  handlePress,
  disabled,
  balance,
  status,
}: IListingItem) => {
  const isActive = useMemo(() => {
    return status?.toLowerCase() === 'active';
  }, [status]);

  return (
    <TouchableOpacity
      className={
        'mb-4 flex-row space-x-3 pt-2 pb-3 border-b border-b-border_grey'
      }
      disabled={disabled}
      onPress={handlePress}>
      <View
        className={
          'items-center justify-center h-10 w-10 rounded-full bg-white overflow-hidden border border-border_grey'
        }>
        {icon}
      </View>

      <View className={'flex-1'}>
        <View className={'flex-row justify-between w-full'}>
          <Text className={` font-inter-medium text-xs ${'text-primary'}`}>
            {title}
          </Text>

          {customDate ? (
            <Text className={'font-inter text-2xs text-inactive_text'}>
              {customDate ? customDate : moment(date).format('MMM DD YYYY')}
            </Text>
          ) : null}
        </View>

        <View className={'flex-row justify-between w-full mt-2'}>
          <Text className={'font-inter text-2xs text-black'}>Unit {unit}</Text>

          <View className={'flex-row'}>
            {isPartial ? (
              <Text className={'text-green-400 font-inter-medium text-11'}>
                Partial .&nbsp;
              </Text>
            ) : null}
            {amount ? (
              <Text
                className={`text-black font-inter-medium text-xs
              ${'text-black'}
              `}>
                KES. {amount}{' '}
              </Text>
            ) : null}
          </View>
        </View>

        <View className={'flex-row justify-between w-full mt-1'}>
          <View className="">
            {isActive && (
              <View className="px-3 py-1 rounded-full bg-green-100">
                <Text className="text-2xs font-inter text-green-800">
                  Active
                </Text>
              </View>
            )}
          </View>

          <Text className={'text-gray-400 font-inter-medium text-11'}>
            Balance: {balance}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ListingItem;

// function getInvoiceStatus(paymentStatus: string, invoiceStatus: string) {
//   if (
//     paymentStatus?.toLowerCase() === 'unpaid' &&
//     invoiceStatus?.toLowerCase() === 'inactive'
//   ) {
//     return '';
//   } else if (
//     paymentStatus?.toLowerCase() === 'paid' &&
//     invoiceStatus?.toLowerCase() === 'inactive'
//   ) {
//     return 'Paid';
//   } else if (
//     paymentStatus?.toLowerCase() === 'unpaid' &&
//     invoiceStatus?.toLowerCase() === 'active'
//   ) {
//     return 'Unpaid';
//   } else if (
//     paymentStatus?.toLowerCase() === 'paid' &&
//     invoiceStatus?.toLowerCase() === 'active'
//   ) {
//     return 'Paid';
//   }
// }
