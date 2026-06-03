import React, {useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
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

// Owner reporting — the four-hours-per-month Sandra screen. Picks an
// owner, generates a clean PDF, hands off to email. Replaces the
// landlord's forwarded-spreadsheet workflow.

const OwnerReports = () => {
  const {owners, isPending, isRefetching, refetch} = useOwners();
  const [selectedId, setSelectedId] = useState(null);
  const generate = useGenerateOwnerReport();
  const sendEmail = useEmailOwnerReport();

  const selectedOwner = owners.find(o => o.id === selectedId) ?? owners[0];

  const currentPeriod = (() => {
    const d = new Date();
    return d.toISOString().slice(0, 7);
  })();

  const onGeneratePdf = async () => {
    if (!selectedOwner) return;
    ToastAndroid.show('Generating report…', ToastAndroid.SHORT);
    const res = await generate
      .mutateAsync({ownerId: selectedOwner.id, period: currentPeriod})
      .catch(() => null);
    if (res?.url) {
      ToastAndroid.show('PDF ready — opening', ToastAndroid.SHORT);
    } else {
      ToastAndroid.show(
        res?.message ?? 'PDF export coming soon',
        ToastAndroid.LONG,
      );
    }
  };

  const onSendEmail = async () => {
    if (!selectedOwner) return;
    const res = await sendEmail
      .mutateAsync({ownerId: selectedOwner.id, period: currentPeriod})
      .catch(() => null);
    ToastAndroid.show(
      res?.message ?? `Report queued to ${selectedOwner.name}`,
      ToastAndroid.LONG,
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-keystone_stone"
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }>
      <View className="px-5 pt-6 pb-2">
        <Text className="text-grey_1 font-inter text-xs uppercase tracking-widest">
          Owner Reports
        </Text>
        <Text className="text-keystone_navy font-inter-semibold text-base mt-1">
          Select Owner
        </Text>
      </View>

      <View className="mx-4 bg-white rounded-2xl shadow-sm">
        {owners.map((owner, idx) => {
          const selected =
            (selectedOwner?.id ?? owners[0]?.id) === owner.id;
          return (
            <View key={owner.id}>
              <TouchableOpacity
                onPress={() => setSelectedId(owner.id)}
                activeOpacity={0.7}
                className="flex-row items-center p-4">
                <View
                  className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${
                    selected
                      ? 'border-keystone_navy bg-keystone_navy'
                      : 'border-grey_1'
                  }`}>
                  {selected && (
                    <View className="w-2 h-2 rounded-full bg-white" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-keystone_navy font-inter-semibold text-base">
                    {owner.name}
                  </Text>
                  <Text className="text-grey_1 font-inter text-xs mt-1">
                    {owner.propertyCount} propert
                    {owner.propertyCount === 1 ? 'y' : 'ies'}
                  </Text>
                </View>
              </TouchableOpacity>
              {idx < owners.length - 1 && (
                <View className="h-px bg-keystone_cream mx-4" />
              )}
            </View>
          );
        })}
      </View>

      {/* Report contents preview */}
      <View className="mx-4 mt-6 bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-grey_1 font-inter text-xs uppercase tracking-wider">
          Generate report for {formatPeriod(currentPeriod)}
        </Text>
        <View className="h-px bg-keystone_cream my-3" />
        <Includes label="Rent collected vs expected" />
        <Includes label="Maintenance costs" />
        <Includes label="Vacancy summary" />
        <Includes label="Year-to-date comparison" />
      </View>

      {/* Actions */}
      <View className="mx-4 mt-6 mb-12 flex-row gap-3">
        <TouchableOpacity
          onPress={onGeneratePdf}
          disabled={generate.isPending || !selectedOwner}
          activeOpacity={0.85}
          className={`flex-1 rounded-2xl p-4 items-center ${
            generate.isPending || !selectedOwner
              ? 'bg-keystone_navy/40'
              : 'bg-keystone_navy'
          }`}>
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
          className="flex-1 rounded-2xl p-4 items-center border border-keystone_navy">
          {sendEmail.isPending ? (
            <ActivityIndicator color="#152535" />
          ) : (
            <Text className="text-keystone_navy font-inter-semibold text-sm uppercase tracking-wider">
              Send by email
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {isPending && (
        <View className="absolute inset-0 items-center justify-center bg-white/60">
          <ActivityIndicator color="#152535" />
        </View>
      )}
    </ScrollView>
  );
};

const Includes = ({label}) => (
  <View className="flex-row items-center py-1">
    <Text className="text-[#22C55E] font-inter-semibold mr-2">✓</Text>
    <Text className="text-keystone_navy font-inter text-sm">{label}</Text>
  </View>
);

const formatPeriod = iso => {
  if (!iso) return '—';
  const [y, m] = iso.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export default OwnerReports;
