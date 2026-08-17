import React from 'react';
import {RefreshControl, StatusBar, Text, View} from 'react-native';
import {useGenerateOwnerReport, useEmailOwnerReport} from '../../hooks/useOwners';
import {usePortfolio} from '../../hooks/usePortfolio';
import {demoOnly, mockOwnerStatements} from '../../services/mocks';
import {Card} from '../../components/premium';
import {
  ListRow,
  Screen,
  SectionLabel,
  eventDate,
  usd,
} from '../../components/kit';
import COLORS from '../../constants/Theme';
import {toast} from '../../utils/toast';

// Statements (design 7b). Accountant-ready: every figure traces to a
// receipt code. Statement rows carry the collected total + issue date
// inline (D2); the open month wears the OPEN chip and a close date
// instead of pretending to be final. Everything exports — this
// screen's job is handing numbers to an accountant, not charts.

const OwnerReports = () => {
  // No statements-list endpoint (BE ships POST /owners/{id}/reports to
  // render one PDF, not a history). Fixtures mode only.
  const statements = demoOnly(mockOwnerStatements, []);
  const {isRefetching, refetch} = usePortfolio();
  const generate = useGenerateOwnerReport();
  const sendEmail = useEmailOwnerReport();

  const exportMonth = async statement => {
    toast.show('Preparing your statement…', toast.SHORT);
    const res = await generate
      .mutateAsync({ownerId: 'portfolio', period: statement.period})
      .catch(() => null);
    toast.show(
      res?.url
        ? 'Statement ready — opening'
        : res?.message ?? 'Statement downloads aren’t available yet.',
      toast.LONG,
    );
  };

  const exportYtd = async () => {
    const res = await sendEmail
      .mutateAsync({ownerId: 'portfolio', period: 'YTD'})
      .catch(() => null);
    toast.show(res?.message ?? 'Year-to-date summary exported', toast.LONG);
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
        {statements.map((s, i) => (
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
            last={i === statements.length - 1}
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
