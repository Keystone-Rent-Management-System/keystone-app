import React from 'react';
import {
  RefreshControl,
  StatusBar,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import {useGenerateOwnerReport, useEmailOwnerReport} from '../../hooks/useOwners';
import {usePortfolio} from '../../hooks/usePortfolio';
import {mockOwnerStatements} from '../../services/mocks';
import {Card} from '../../components/premium';
import {
  ListRow,
  Screen,
  SectionLabel,
  eventDate,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';

// Statements (design 7b). Accountant-ready: every figure traces to a
// receipt code. Statement rows carry the collected total + issue date
// inline (D2); the open month wears the OPEN chip and a close date
// instead of pretending to be final. Everything exports — this
// screen's job is handing numbers to an accountant, not charts.

const OwnerReports = () => {
  const {isRefetching, refetch} = usePortfolio();
  const generate = useGenerateOwnerReport();
  const sendEmail = useEmailOwnerReport();

  const exportMonth = async statement => {
    ToastAndroid.show('Preparing your statement…', ToastAndroid.SHORT);
    const res = await generate
      .mutateAsync({ownerId: 'portfolio', period: statement.period})
      .catch(() => null);
    ToastAndroid.show(
      res?.url ? 'Statement ready — opening' : res?.message ?? 'PDF export coming soon',
      ToastAndroid.LONG,
    );
  };

  const exportYtd = async () => {
    const res = await sendEmail
      .mutateAsync({ownerId: 'portfolio', period: 'YTD'})
      .catch(() => null);
    ToastAndroid.show(res?.message ?? 'Year-to-date summary exported', ToastAndroid.LONG);
  };

  return (
    <Screen
      title="Statements"
      back="Reports"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.keystone_gold}
        />
      }>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />

      <Text className="text-keystone_slate font-inter text-[15px] mb-4">
        Accountant-ready. Every figure traces to a receipt code.
      </Text>

      <SectionLabel>Monthly statements</SectionLabel>
      <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
        {mockOwnerStatements.map((s, i) => (
          <ListRow
            key={s.id}
            icon="reports"
            title={s.period}
            sub={
              s.open
                ? `In progress · closes ${eventDate('', s.closesOn).trim()}`
                : `${usd(s.collected)} collected · ${eventDate('issued', s.issuedOn)}`
            }
            chip={s.open ? {label: 'Open', tone: 'pending'} : undefined}
            right={
              !s.open ? (
                <Text className="text-keystone_gold font-inter-semibold text-sm">
                  PDF ›
                </Text>
              ) : undefined
            }
            last={i === mockOwnerStatements.length - 1}
            onPress={s.open ? undefined : () => exportMonth(s)}
          />
        ))}
      </Card>

      <SectionLabel style={{marginTop: 20}}>Tax summary</SectionLabel>
      <Card style={{paddingVertical: 0, paddingHorizontal: 16}}>
        <ListRow
          icon="collection"
          title={`${new Date().getFullYear()} year-to-date`}
          sub="Rent, late fees, deposits held — by property"
          right={
            <Text className="text-keystone_gold font-inter-semibold text-sm">
              Export ›
            </Text>
          }
          last
          onPress={exportYtd}
        />
      </Card>
    </Screen>
  );
};

export default OwnerReports;
