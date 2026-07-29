import React from 'react';
import {
  RefreshControl,
  StatusBar,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {useInsurance} from '../../hooks/useInsurance';
import {mockInsuranceClaims} from '../../services/mocks';
import {Card} from '../../components/premium';
import {
  HeroCard,
  ListRow,
  Screen,
  SecondaryButton,
  SectionLabel,
  eventDate,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Rent insurance, landlord (design 7c). The hero answers "how much of
// my rent is protected"; claim rows verb-date the whole lifecycle
// (filed → payout → sent, D2). The education line covers the
// automatic-coverage model; File a claim is secondary — this is a
// monitoring screen, claims are rare.

const Insurance = () => {
  const {insurance, isRefetching, refetch} = useInsurance();

  return (
    <Screen
      title="Rent insurance"
      back="Reports"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <HeroCard
        label="Rent protected"
        badge={{text: 'Active', dot: 'success'}}
        amount={`${insurance?.insuredUnits ?? 0} units`}
        sub={`of ${insurance?.occupiedUnits ?? insurance?.totalUnits ?? 0} occupied · up to 2 months' rent per default`}
      />

      <View className="mt-5">
        <SectionLabel>Claims</SectionLabel>
        {mockInsuranceClaims.length === 0 ? (
          <Card>
            <Text className="text-c_success font-inter text-sm text-center py-4">
              ✓ No claims — coverage is working quietly.
            </Text>
          </Card>
        ) : (
          <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
            {mockInsuranceClaims.map((c, i) => (
              <ListRow
                key={c.id}
                icon="shield"
                title={c.unitName}
                sub={
                  c.status === 'PAID_OUT'
                    ? `${eventDate('Filed', c.filedOn)} · payout ${usd(c.payout)} · ${eventDate('sent', c.paidOn)}`
                    : `${eventDate('Filed', c.filedOn)} · under review`
                }
                chip={
                  c.status === 'PAID_OUT'
                    ? {label: 'Paid out', tone: 'success'}
                    : {label: 'In review', tone: 'pending'}
                }
                last={i === mockInsuranceClaims.length - 1}
              />
            ))}
          </Card>
        )}
        <Text className="text-keystone_slate font-inter text-xs mt-3 leading-5">
          Coverage applies automatically to every unit paying through Keystone
          — no enrollment per tenant.
        </Text>
      </View>

      <SecondaryButton
        label="File a claim"
        style={{marginTop: 16}}
        onPress={() =>
          ToastAndroid.show('Claims open with the insurance partner', ToastAndroid.SHORT)
        }
      />
    </Screen>
  );
};

export default Insurance;
