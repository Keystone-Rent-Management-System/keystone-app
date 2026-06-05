import React, {useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {useTenantHome} from '../../hooks/useTenantHome';
import {usd} from '../../utils/money';
import {Card, IconChip, Label, Amount, Divider, Row, Icon} from '../../components/premium';
import COLORS from '../../constants/Theme';

// The tenant's lease — everything about where they live, in one calm
// view. When the lease is still PENDING (landlord sent it, tenant hasn't
// signed), this is also where they review and accept it.

const fmtDate = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
};

const Lease = () => {
  const nav = useNavigation();
  const {home, isPending} = useTenantHome();
  const [accepting, setAccepting] = useState(false);

  const lease = home?.lease ?? {};
  const isPendingAccept = lease.agreementStatus === 'PENDING';
  const docs = lease.documents ?? [];

  const onAccept = () => {
    setAccepting(true);
    // PATCH /agreements/{id}/acceptance lands here.
    ToastAndroid.show('Lease accepted — welcome home!', ToastAndroid.LONG);
    setTimeout(() => nav.navigate('home'), 600);
  };

  if (isPending) {
    return (
      <View className="flex-1 bg-keystone_canvas items-center justify-center">
        <ActivityIndicator color={COLORS.keystone_navy} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}>
        {/* Property hero */}
        <View className="px-4 pt-5">
          <Card feature>
            <Label onDark>{isPendingAccept ? 'Lease offered' : 'Your home'}</Label>
            <Text className="text-white font-inter-bold text-2xl mt-2">
              {lease.property}
              {lease.unit ? ` · ${lease.unit}` : ''}
            </Text>
            <Text className="text-white/60 font-inter text-sm mt-1">
              {lease.address}
            </Text>
            <View className="flex-row items-center gap-2 mt-3">
              <View
                className="w-1.5 h-1.5 rounded-full"
                style={{backgroundColor: isPendingAccept ? COLORS.keystone_gold : COLORS.c_success}}
              />
              <Text className="text-white/70 font-inter-medium text-2xs uppercase tracking-wider">
                {isPendingAccept ? 'Awaiting your signature' : 'Active lease'}
              </Text>
            </View>
          </Card>
        </View>

        {/* Accept banner */}
        {isPendingAccept && (
          <View className="px-4 mt-3">
            <Card style={{padding: 14, borderColor: COLORS.keystone_gold, borderWidth: 1}}>
              <Text className="text-keystone_navy font-inter-semibold text-sm">
                Review and accept your lease
              </Text>
              <Text className="text-text_muted font-inter text-xs mt-1">
                Your landlord sent this lease. Read the terms below, then
                accept to activate your tenancy.
              </Text>
            </Card>
          </View>
        )}

        {/* Terms */}
        <View className="px-4 mt-4">
          <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
            Lease terms
          </Text>
          <Card>
            <Row label="Monthly rent" value={usd(lease.monthlyRent)} bold />
            <Divider />
            <Row label="Security deposit" value={usd(lease.deposit)} />
            <Divider />
            <Row label="Term" value={lease.term ?? '—'} />
            <Divider />
            <Row label="Start date" value={fmtDate(lease.startDate)} />
            <Divider />
            <Row
              label="End date"
              value={fmtDate(lease.endDate)}
              sub={lease.daysToEnd ? `in ${lease.daysToEnd} days` : null}
            />
            <Divider />
            <Row label="Managed by" value={lease.landlord ?? '—'} />
          </Card>
        </View>

        {/* Documents */}
        {docs.length > 0 && (
          <View className="px-4 mt-5">
            <Text className="text-text_muted font-inter-semibold text-xs uppercase tracking-widest ml-1 mb-3">
              Documents
            </Text>
            <Card style={{paddingVertical: 6}}>
              {docs.map((d, i) => (
                <View key={d.id}>
                  {i > 0 && <Divider style={{marginHorizontal: 12}} />}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      ToastAndroid.show('Opening document…', ToastAndroid.SHORT)
                    }
                    className="flex-row items-center px-3 py-3">
                    <IconChip size={36}>
                      <Icon name="reports" size={17} color={COLORS.keystone_gold} />
                    </IconChip>
                    <View className="flex-1 ml-3">
                      <Text className="text-keystone_navy font-inter-semibold text-sm">
                        {d.name}
                      </Text>
                      <Text className="text-text_muted font-inter text-xs mt-0.5">
                        {d.kind} · {fmtDate(d.date)}
                      </Text>
                    </View>
                    <Text className="text-text_muted font-inter-semibold text-base">
                      ›
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Card>
          </View>
        )}
      </ScrollView>

      {/* Accept CTA */}
      {isPendingAccept && (
        <View className="px-4 pb-6 pt-2 bg-keystone_canvas">
          <TouchableOpacity
            onPress={onAccept}
            disabled={accepting}
            activeOpacity={0.9}
            className="bg-keystone_navy rounded-2xl py-4 items-center">
            {accepting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-inter-bold text-base">
                Accept lease
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Lease;
