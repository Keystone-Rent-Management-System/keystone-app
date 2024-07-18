import React, {useState, useRef, useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  SectionList,
} from 'react-native';
import {CButton, LandlordStatementItem, Layout} from '@/components';
import COLORS from '../../../constants/Theme';
import {useInvoiceAnalytics} from '../../../hooks';
import numberWithCommas from '../../../utils/numberWithCommas';
import moment from 'moment';
import {StatementListSvg} from '@/assets/icons';
import {ExportStatementModal} from '../../../components/modals';

const PropertyStatements = () => {
  const exportModalRef = useRef();
  const navigation = useNavigation();
  const [size, setSize] = useState(20);

  const handleNavigate = unitName => {
    navigation.navigate('unit_statements', {unitName});
  };

  const {isPending, isRefetching, statements, totalElements, refetch} =
    useInvoiceAnalytics(size);

  const handleLoadMore = () => {
    if (!isPending && !isRefetching && totalElements > size) {
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

  return (
    <>
      <Layout ClassName={'px-4 relative'}>
        <SectionList
          sections={statements}
          keyExtractor={item => item?.id}
          estimatedItemSize={20}
          renderItem={({item}) => renderStatementItem(item, handleNavigate)}
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

export const renderStatementItem = (item, handlePress = () => {}) => {
  return (
    <LandlordStatementItem
      title={item?.propertyName?.split('-')[1]}
      date={moment(item?.updatedAt)?.format('Do MMMM, YYYY')}
      billAmount={numberWithCommas(Number(item?.totalAmount ?? 0))}
      collectAmount={numberWithCommas(Number(item?.paidAmount ?? 0))}
      overPaid={
        item?.paidAmount > item?.totalAmount
          ? numberWithCommas(Number(-item?.dueAmount ?? 0))
          : 0
      }
      unCollectAmount={
        item?.paidAmount < item?.totalAmount
          ? numberWithCommas(Number(item?.dueAmount ?? 0))
          : item?.dueAmount === item?.totalAmount
          ? numberWithCommas(Number(item?.dueAmount ?? 0))
          : 0
      }
      handlePress={() => handlePress(item?.propertyName?.split('-')[1])}
    />
  );
};

const renderHeader = ({section}) => (
  <View className={'pb-2 px-4 mt-3'}>
    <Text className={'font-inter-semibold text-grey_1 capitalize'}>
      {section?.property}
    </Text>
  </View>
);

export const propertyStyles = StyleSheet.create({
  list: {
    padding: 16,
  },
});

export default PropertyStatements;
