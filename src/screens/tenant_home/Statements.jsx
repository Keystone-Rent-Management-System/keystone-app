import React, {useCallback, useRef, useState} from 'react';
import {Layout} from '@/components';
import {CButton, StatementItem} from '../../components';
import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import {SelectorButton} from '../../components/screens/explore/RoomSelector';
import {StatementListSvg} from '../../assets/icons';
import COLORS from '../../constants/Theme';
import {ExportStatementModal} from '../../components/modals';
import {useStatement} from '../../hooks/useStatement';
import moment from 'moment';
import numberWithCommas from '../../utils/numberWithCommas';
import {generateYears} from '../../utils/yearsOptions';

const Statements = () => {
  const exportModalRef = useRef();

  const years = generateYears();

  const [active, setActive] = useState(0);
  const [year, setYear] = useState('');
  const [size, setSize] = useState(20);

  const {isPending, isRefetching, statements, totalElements, refetch} =
    useStatement(size, year);
  const handleLoadMore = () => {
    if (!isPending && totalElements > size) {
      setSize(prev => prev + 10);
      refetch();
    }
  };

  const handleOpenExportModal = useCallback(() => {
    exportModalRef.current?.expand();
  }, []);

  const handleCloseExportModal = useCallback(() => {
    exportModalRef.current?.close();
  }, []);

  const renderYears = ({item, index, isActive}) => {
    return (
      <SelectorButton
        key={index}
        ClassName={'py-0'}
        isActive={isActive}
        text={item}
        handlePress={() => {
          setActive(index);
          setYear(item);
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
          sections={statements}
          keyExtractor={item => item?.id}
          renderItem={renderItem}
          renderSectionHeader={renderHeader}
          refreshing={isPending}
          onRefresh={refetch}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isRefetching ? (
              <ActivityIndicator color={'#022374'} size="large" />
            ) : null
          }
        />

        <CButton
          style={{elevation: 2}}
          ClassName={
            'absolute bg-primary_bg_pale rounded-full flex-row space-x-1 shadow-md bottom-3 right-3'
          }
          onPress={handleOpenExportModal}>
          <StatementListSvg h={'20'} color={COLORS.primary} />

          <Text className={'text-primary text-xs font-inter-medium'}>
            Export Statement
          </Text>
        </CButton>
      </Layout>

      <ExportStatementModal
        ref={exportModalRef}
        handleCloseModal={handleCloseExportModal}
      />
    </>
  );
};

const renderItem = ({item}, handlePress) => (
  <StatementItem
    title={
      item?.invoiceNumber
        ? `Invoice no: ${item?.invoiceNumber}`
        : `Transaction code: ${item?.transactionCode}`
    }
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

export default Statements;
