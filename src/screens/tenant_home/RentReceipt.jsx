import React from 'react';
import {StatusBar, Text, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {Card, Divider, Row} from '../../components/premium';
import {
  HeroCard,
  PrimaryButton,
  Screen,
  SecondaryButton,
  eventDate,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {useTenantHome} from '../../hooks/useTenantHome';
import {toast} from '../../utils/toast';

// Receipt (design 5b; quality bar, structure kept). D3 applied: "For"
// (period) and "Paid" (event) are separate rows — the one date/period
// ambiguity the screen had. Buttons de-shouted to sentence case at K2
// geometry; detail rows get min-width guards so long landlord names
// ellipsize instead of wrapping.

const fmtTime = iso => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const RentReceipt = () => {
  const nav = useNavigation();
  const {params = {}} = useRoute();
  // Receipts opened from the Activity list carry only payment fields —
  // fill landlord/property from the lease so 5b's rows never go blank.
  const {home} = useTenantHome();
  const {
    amount = 0,
    method = 'Your bank',
    date,
    code = '—',
    period,
    landlord = home?.lease?.landlord,
    property = home?.lease?.property,
    unit = home?.lease?.unit,
  } = params;

  return (
    <Screen title="Receipt" back="Pay">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      {/* Success */}
      <View className="items-center pt-4 pb-2 px-6">
        <View
          style={{backgroundColor: 'rgba(5,166,96,0.12)'}}
          className="w-16 h-16 rounded-full items-center justify-center">
          <Text style={{color: COLORS.c_success, fontSize: 30}}>✓</Text>
        </View>
        <Text className="text-keystone_navy font-inter-bold text-2xl mt-4">
          Rent paid
        </Text>
        <Text className="text-keystone_slate font-inter text-[15px] mt-1 text-center leading-5">
          Sent to {landlord ?? 'your landlord'}. You're all set
          {period ? ` for ${period.split(' ')[0]}` : ''}.
        </Text>
      </View>

      <View className="mt-4">
        <HeroCard
          label={period ? `AMOUNT PAID · ${period.toUpperCase()}` : 'AMOUNT PAID'}
          amount={usd(amount)}
          amountSize={34}
          sub={`Confirmation ${code}`}
        />
      </View>

      {/* Details — D3: period ("For") and event ("Paid") separated */}
      <View className="mt-5">
        <Card>
          <Row label="Paid to" value={landlord ?? '—'} />
          <Divider />
          <Row
            label="Property"
            value={`${property ?? ''}${unit ? ` · ${unit}` : ''}`}
          />
          <Divider />
          <Row label="For" value={period ? `${period} rent` : 'Rent'} />
          <Divider />
          <Row label="Paid from" value={method} />
          <Divider />
          <Row
            label="Paid"
            value={
              date ? `${eventDate('', date, true).trim()} · ${fmtTime(date)}` : '—'
            }
          />
          <Divider />
          <Row label="Confirmation" value={code} />
        </Card>
      </View>

      <View className="mt-5 flex-row gap-3">
        <SecondaryButton
          label="Save PDF"
          style={{flex: 1}}
          // Claimed the receipt was saved; no file was ever written.
          onPress={() =>
            toast.show(
              'Saving a copy isn’t available yet — take a screenshot if you need a record.',
              toast.LONG,
            )
          }
        />
        <PrimaryButton
          label="Done"
          style={{flex: 1}}
          onPress={() => nav.navigate('home')}
        />
      </View>
    </Screen>
  );
};

export default RentReceipt;
