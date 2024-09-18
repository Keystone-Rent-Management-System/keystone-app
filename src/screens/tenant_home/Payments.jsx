import React, {useState} from 'react';
import {Layout} from '@/components';
import {
  Text,
  View,
  ActivityIndicator,
  FlatList,
  SectionList,
} from 'react-native';
import {generateYears} from '../../utils/yearsOptions';
import {SelectorButton} from '../../components/screens/explore/RoomSelector';
import numberWithCommas from '../../utils/numberWithCommas';
import moment from 'moment';
import {BillsSvg} from '@/assets/icons';
import {PaymentItem} from '../../components';
import {useTenantTransaction} from '../../hooks';

const Payments = () => {
  const [active, setActive] = useState(0);
  const years = generateYears();

  const [size, setSize] = useState(20);

  const {isPending, isRefetching, transactions, totalElements, refetch} =
    useTenantTransaction(size);
  const handleLoadMore = () => {
    if (!isPending && totalElements > size) {
      setSize(prev => prev + 10);
      refetch();
    }
  };

  const renderYears = ({item, index, isActive}) => {
    return (
      <SelectorButton
        key={index}
        ClassName={'py-0'}
        isActive={isActive}
        text={item}
        handlePress={() => {
          setActive(index);
        }}
      />
    );
  };

  return (
    <>
      <Layout ClassName={'p-4 relative'}>
        <View>
          <FlatList
            className={'h-8'}
            data={years}
            renderItem={({item, index}) =>
              renderYears({
                item,
                index,
                isActive: active === index,
              })
            }
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <SectionList
          sections={transactions}
          keyExtractor={item => item?.id}
          estimatedItemSize={20}
          renderItem={renderItem}
          renderSectionHeader={renderHeader}
          refreshing={isPending || isRefetching}
          onRefresh={refetch}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isRefetching ? (
              <ActivityIndicator color={'#022374'} size="large" />
            ) : null
          }
        />
      </Layout>
    </>
  );
};

const renderItem = ({item}, handlePress) => (
  <PaymentItem
    icon={
      <View className={'px-3 black my-auto flex items-center justify-center'}>
        <BillsSvg size={'18'} />
      </View>
    }
    transactionCode={item?.transactionCode}
    date={moment(item?.createdAt)?.format('Do MMMM, YYYY')}
    paymentMethod={item?.methodOfPayment}
    amount={numberWithCommas(Number(item.amountDebited))}
    handlePress={handlePress}
  />
);

const renderHeader = ({section}) => (
  <View className={'pb-2 px-4 mt-3'}>
    <Text className={'font-inter-semibold text-grey_1 capitalize'}>
      {section?.month}
    </Text>
  </View>
);

export default Payments;
