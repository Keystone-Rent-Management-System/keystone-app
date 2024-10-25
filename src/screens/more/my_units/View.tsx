import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React, {useMemo} from 'react';
import {ExploreAmenity, LandlordItem, Layout} from '../../../components';
import {
  AgreementSvg,
  BedSvg,
  BuildingSvg,
  RightArrowSvg,
  TrashSvg,
  WaterBillSvg,
} from '../../../assets/icons';
import COLORS from '../../../constants/Theme';
import {useActiveAgrement} from '../../../hooks';
import {useActiveStatement} from '../../../hooks/useStatement';
import {ILandlord} from '../../../types/property.ts';
import AgreementModalSheet from '../../../components/modals/Agreement';

type ChargeKey = string;

const UnitView = () => {
  const {isPending, agreement} = useActiveAgrement();
  const {isPending: isPendingActive, activeStatement} = useActiveStatement();

  const landlord: ILandlord = useMemo(() => {
    return agreement?.propertyUnits?.property?.landlord || {};
  }, [agreement]);

  const charges: Record<ChargeKey, {amount: any; icon: React.JSX.Element}> =
    useMemo(() => {
      return {
        deposit: {
          amount: agreement?.propertyUnits?.deposit,
          icon: <BuildingSvg />,
        },
        rent: {
          amount: agreement?.propertyUnits?.rent,
          icon: <BuildingSvg />,
        },
        'rent due date': {
          amount: agreement?.rentDueDate,
          icon: <AgreementSvg />,
        },
        bedrooms: {
          amount: agreement?.propertyUnits?.numberOfBedrooms,
          icon: <BedSvg />,
        },
        bathroom: {
          amount: agreement?.propertyUnits?.numberOfBathrooms,
          icon: <BuildingSvg />,
        },
        'water bill': {
          amount: 'N/A',
          icon: <WaterBillSvg />,
        },
        trash: {
          amount: 'N/A',
          icon: <TrashSvg />,
        },
      };
    }, [agreement]);

  return (
    <Layout isScrollable={true} ClassName={'p-5'}>
      {isPending || isPendingActive ? (
        <View className={'flex flex-row justify-center py-16'}>
          <ActivityIndicator color={'#022374'} size="small" />
          <Text className={'text-primary font-inter-semibold text-sm'}>
            Loading...
          </Text>
        </View>
      ) : (
        <>
          {/* title section*/}
          <View className={'flex-row space-x-3 pb-3'}>
            <View className={''}>
              <Text className={'font-inter-bold text-base text-black mb-2'}>
                {agreement.propertyUnits.property.name}
              </Text>
              <Text className={'font-inter text-xs text-grey_1'}>
                Unit {agreement.propertyUnits.name}
              </Text>
            </View>
          </View>

          {/*seperator*/}
          <Line />

          {/*  balance section  */}
          <View className={'pb-3'}>
            <Text className={'text-black font-inter-semibold'}>Balance</Text>
            <Text className={'text-black font-inter-bold text-base mt-2'}>
              KES {activeStatement?.endingBalance}
            </Text>
          </View>

          {/*seperator*/}
          <Line />

          {/*Agreement section*/}
          <AgreementModalSheet>
            <View className={'flex-row space-x-3 items-center py-3'}>
              <AgreementSvg color={COLORS.primary} size={'25'} />

              <View className={'flex-1'}>
                <Text className={'text-sm text-primary font-inter-medium'}>
                  View Agreement
                </Text>
              </View>

              <RightArrowSvg />
            </View>
          </AgreementModalSheet>

          {/*seperator*/}
          <Line />

          {/*  location  */}
          <View className={'py-2'}>
            <Text className={'text-black font-inter-semibold'}>Location</Text>

            <Text className={'font-inter text-xs text-grey_1 mt-2'}>
              {agreement.propertyUnits.property?.address?.line},{' '}
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
                value={`${charge === 'rent due date' ? 'Date' : 'KES.'} ${
                  charges[charge]?.amount
                }`}
              />
            ))}
          </View>

          {/*seperator*/}
          <Line />

          {/*  landlord details  */}
          <LandlordItem
            name={`${landlord?.user?.firstName} ${landlord?.user?.lastName}`}
            phoneNumber={landlord?.user?.phoneNumber}
            rent={agreement?.propertyUnits?.rent?.toString()}
            ClassName={'px-0'}
          />

          <View className={'w-full h-8'} />
        </>
      )}
    </Layout>
  );
};

export default UnitView;

const Line = () => <View className={'my-3 h-[1px] bg-border_grey w-full'} />;

const styles = StyleSheet.create({
  chargeList: {
    gap: 18,
  },
});
