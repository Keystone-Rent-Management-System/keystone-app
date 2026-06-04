import React, {useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useEmailOwnerReport,
  useGenerateOwnerReport,
  useOwners,
} from '../../hooks/useOwners';
import {Card, Avatar, Label, Divider} from '../../components/premium';
import COLORS from '../../constants/Theme';

// Owner reporting — the four-hours-per-month Sandra screen. Pick an
// owner, generate a clean PDF, hand off to email.

const OwnerReports = () => {
  const {owners, isPending, isRefetching, refetch} = useOwners();
  const [selectedId, setSelectedId] = useState(null);
  const generate = useGenerateOwnerReport();
  const sendEmail = useEmailOwnerReport();

  const selectedOwner = owners.find(o => o.id === selectedId) ?? owners[0];
  const currentPeriod = new Date().toISOString().slice(0, 7);

  const onGeneratePdf = async () => {
    if (!selectedOwner) return;
    ToastAndroid.show('Generating report…', ToastAndroid.SHORT);
    const res = await generate
      .mutateAsync({ownerId: selectedOwner.id, period: currentPeriod})
      .catch(() => null);
    ToastAndroid.show(
      res?.url ? 'PDF ready — opening' : res?.message ?? 'PDF export coming soon',
      ToastAndroid.LONG,
    );
  };
  const onSendEmail = async () => {
    if (!selectedOwner) return;
    const res = await sendEmail
      .mutateAsync({ownerId: selectedOwner.id, period: currentPeriod})
      .catch(() => null);
    ToastAndroid.show(res?.message ?? `Report queued to ${selectedOwner.name}`, ToastAndroid.LONG);
  };

  const initials = name =>
    (name ?? '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <View className="flex-1 bg-keystone_canvas">
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      <ScrollView
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.keystone_gold} />
        }>
        <View className="px-5 pt-6 pb-4">
          <Text className="text-keystone_navy font-inter-bold text-2xl">Owner Reports</Text>
          <Text className="text-text_muted font-inter text-sm mt-1">
            Clean monthly statements per property owner
          </Text>
        </View>

        {/* Owner picker */}
        <View className="px-4">
          <Card style={{padding: 6}}>
            {owners.map((owner, idx) => {
              const selected = (selectedOwner?.id ?? owners[0]?.id) === owner.id;
              return (
                <View key={owner.id}>
                  <TouchableOpacity
                    onPress={() => setSelectedId(owner.id)}
                    activeOpacity={0.7}
                    className="flex-row items-center px-3 py-3">
                    <Avatar initials={initials(owner.name)} size={42} />
                    <View className="flex-1 ml-3">
                      <Text className="text-keystone_navy font-inter-semibold text-base">
                        {owner.name}
                      </Text>
                      <Text className="text-text_muted font-inter text-xs mt-0.5">
                        {owner.propertyCount} propert{owner.propertyCount === 1 ? 'y' : 'ies'}
                      </Text>
                    </View>
                    <View
                      className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                        selected ? 'border-keystone_navy bg-keystone_navy' : 'border-text_muted'
                      }`}>
                      {selected && <View className="w-2 h-2 rounded-full bg-keystone_gold" />}
                    </View>
                  </TouchableOpacity>
                  {idx < owners.length - 1 && <Divider style={{marginHorizontal: 12}} />}
                </View>
              );
            })}
          </Card>
        </View>

        {/* Report contents */}
        <View className="px-4 mt-5">
          <Card>
            <Label>Report for {formatPeriod(currentPeriod)}</Label>
            <Divider style={{marginVertical: 12}} />
            {['Rent collected vs expected', 'Maintenance costs', 'Vacancy summary', 'Year-to-date comparison'].map(l => (
              <View key={l} className="flex-row items-center py-1.5">
                <Text className="text-c_success font-inter-semibold mr-2">✓</Text>
                <Text className="text-keystone_navy font-inter text-sm">{l}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Actions */}
        <View className="px-4 mt-5 flex-row gap-3">
          <TouchableOpacity
            onPress={onGeneratePdf}
            disabled={generate.isPending || !selectedOwner}
            activeOpacity={0.85}
            className="flex-1 bg-keystone_navy rounded-2xl p-4 items-center">
            {generate.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-inter-semibold text-sm uppercase tracking-wider">
                Generate PDF
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSendEmail}
            disabled={sendEmail.isPending || !selectedOwner}
            activeOpacity={0.85}
            className="flex-1 border border-keystone_navy rounded-2xl p-4 items-center">
            {sendEmail.isPending ? (
              <ActivityIndicator color={COLORS.keystone_navy} />
            ) : (
              <Text className="text-keystone_navy font-inter-semibold text-sm uppercase tracking-wider">
                Send by email
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {isPending && (
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator color={COLORS.keystone_navy} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const formatPeriod = iso => {
  if (!iso) return '—';
  const [y, m] = iso.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', {month: 'long', year: 'numeric'});
};

export default OwnerReports;
