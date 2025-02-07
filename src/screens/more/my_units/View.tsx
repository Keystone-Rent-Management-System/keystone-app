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
import {IPropertyContacts} from '../../../types/property.ts';
import AgreementModalSheet from '../../../components/modals/Agreement';
import {formatToKES} from '../../../utils/Helper';

type ChargeKey = string;

const UnitView = () => {
  const {isPending, agreement} = useActiveAgrement();
  const {isPending: isPendingActive, activeStatement} = useActiveStatement();

  const propertyContactPerson: IPropertyContacts = useMemo(() => {
    return agreement?.propertyUnits?.property?.propertyContacts || {};
  }, [agreement]);

  const charges: Record<ChargeKey, {amount: any; icon: React.JSX.Element}> =
    useMemo(() => {
      return {
        deposit: {
          amount: formatToKES(Number(agreement?.propertyUnits?.deposit)),
          icon: <BuildingSvg />,
        },
        rent: {
          amount: formatToKES(Number(agreement?.propertyUnits?.rent)),
          icon: <BuildingSvg />,
        },
        'rent due date': {
          amount: agreement?.rentDueDate,
          icon: <AgreementSvg />,
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

  const amenities: Record<ChargeKey, {amount: any; icon: React.JSX.Element}> =
    useMemo(() => {
      return {
        bedrooms: {
          amount: agreement?.propertyUnits?.numberOfBedrooms,
          icon: <BedSvg />,
        },
        bathroom: {
          amount: agreement?.propertyUnits?.numberOfBathrooms,
          icon: <BuildingSvg />,
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
            <Text className={'text-black font-inter-semibold'}>
              {activeStatement?.endingBalance < 0
                ? 'Advance Balance'
                : 'Arrears'}{' '}
            </Text>
            <Text className={'text-black font-inter-bold text-base mt-2'}>
              {formatToKES(Number(activeStatement?.endingBalance || 0))}
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
                value={`${charge === 'rent due date' ? 'Date' : ''} ${
                  charges[charge]?.amount
                }`}
              />
            ))}
          </View>

          {/*seperator*/}
          <Line />

          {/*  list of amenities  */}
          <View style={styles.chargeList} className={'py-2'}>
            <Text className={'text-black font-inter-medium'}>Amenities</Text>

            {Object.keys(amenities)?.map((charge, ind) => (
              <ExploreAmenity
                key={ind}
                showCheckBox={false}
                icon={amenities[charge]?.icon}
                title={charge}
                value={`${amenities[charge]?.amount} ${
                  typeof amenities[charge]?.amount === 'number'
                    ? amenities[charge]?.amount > 1
                      ? !charge?.endsWith('s')
                        ? `${charge}s`
                        : charge
                      : charge
                    : ''
                }`}
              />
            ))}
          </View>

          {/*seperator*/}
          <Line />

          <Text className={'text-black font-inter-semibold'}>Contacts</Text>
          {/*  landlord details  */}
          <LandlordItem
            name={`${propertyContactPerson?.contactName}`}
            phoneNumber={propertyContactPerson?.phoneNumber}
            rent={formatToKES(Number(agreement?.propertyUnits?.rent))}
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
