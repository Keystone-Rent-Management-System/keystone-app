import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {ExploreAmenity, LandlordItem, Layout} from '../../../components';
import Badge from '../../../components/screens/explore/Badge';
import {
  AgreementSvg,
  BuildingSvg,
  RightArrowSvg,
  TrashSvg,
  WaterBillSvg,
} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';
import {useNavigation} from '@react-navigation/native';

const UnitView = () => {
  const navigation = useNavigation();

  const handleViewPrevious = () => {
    navigation.navigate('my_units__top_nav', {screen: 'my_units__previous'});
  };

  return (
    <Layout isScrollable={true} ClassName={'p-5'}>
      {/* title section*/}
      <View className={'flex-row space-x-3 pb-3'}>
        <View className={''}>
          <Text className={'font-inter-bold text-base text-black mb-2'}>
            Purple Haze Apartment
          </Text>
          <Text className={'font-inter text-xs text-grey_1'}>Unit 03</Text>
        </View>

        <View>
          <Badge ClassName={'flex-row bg-bg_green space-x-1'}>
            <Text className={'font-inter text-2xs text-c_green'}>
              Green Zone
            </Text>
          </Badge>
        </View>
      </View>

      {/*seperator*/}
      <Line />

      {/*  balance section  */}
      <View className={'pb-3'}>
        <Text className={'text-black font-inter-semibold'}>Balance</Text>
        <Text className={'text-black font-inter-bold text-base mt-2'}>
          KES 35,000
        </Text>
      </View>

      {/*seperator*/}
      <Line />

      {/*Agreement section*/}
      <View className={'flex-row space-x-3 items-center py-3'}>
        <AgreementSvg color={COLORS.primary} size={25} />

        <View className={'flex-1'}>
          <Text className={'text-sm text-primary font-inter-medium'}>
            View Agreement
          </Text>
        </View>

        <RightArrowSvg />
      </View>

      {/*seperator*/}
      <Line />

      {/*  location  */}
      <View className={'py-2'}>
        <Text className={'text-black font-inter-semibold'}>Location</Text>

        <Text className={'font-inter text-xs text-grey_1 mt-2'}>
          Lavington, Nairobi
        </Text>
      </View>

      {/*seperator*/}
      <Line />

      {/*  list of charges  */}
      <View style={styles.chargeList} className={'py-2'}>
        <Text className={'text-black font-inter-medium'}>Charges</Text>

        {Object.keys(charges)?.map((charge, ind) => (
          <ExploreAmenity
            key={ind}
            showCheckBox={false}
            icon={charges[charge]?.icon}
            title={charge}
            value={`KES. ${charges[charge]?.amount}`}
          />
        ))}
      </View>

      {/*seperator*/}
      <Line />

      {/*  landlord details  */}
      <LandlordItem userName={'Landlord'} ClassName={'px-0'} />

      {/*  previous units view */}
      <View className={'py-7'}>
        <TouchableOpacity
          className={'flex-row justify-between items-center'}
          onPress={handleViewPrevious}>
          <Text className={'text-primary font-inter-medium'}>
            View Previous Units
          </Text>

          <RightArrowSvg />
        </TouchableOpacity>
      </View>

      <View className={'w-full h-8'} />
    </Layout>
  );
};

export default UnitView;

const Line = () => <View className={'my-3 h-[1px] bg-border_grey w-full'} />;
const charges = {
  deposit: {
    amount: '30,000',
    icon: <BuildingSvg />,
  },
  rent: {
    amount: '30,000',
    icon: <BuildingSvg />,
  },
  agreement: {
    amount: '2,000',
    icon: <AgreementSvg />,
  },
  'water bill': {
    amount: '150/unit',
    icon: <WaterBillSvg />,
  },
  trash: {
    amount: '150/month',
    icon: <TrashSvg />,
  },
};

const styles = StyleSheet.create({
  chargeList: {
    gap: 18,
  },
});
