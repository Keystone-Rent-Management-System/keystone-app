import React from 'react';
import {
  ActivityIndicator,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Icon from '../../../components/premium/icons';
import {
  HeroCard,
  PrimaryButton,
  SecondaryButton,
  eventDate,
  usd,
} from '../../../components/kit';
import COLORS from '../../../constants/Theme';
import {can} from '../../../constants/capabilities';
import {useSpecificInvoice} from '../../../hooks';

// invoice_view — deep-link pass (design 5g). Legacy invoice routes
// are cut; this modal survives only for old links (/app/invoices/:id):
// hero + one CTA that routes into the checkout, plus an exit to
// Activity. Modal presentation (✕, not a back label) because it
// arrives from outside the nav stack.

const InvoiceView = ({route: {params = {}}}) => {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const {invoiceIsPending, invoice} = useSpecificInvoice(params.id);

  const amount = invoice?.totalAmount ?? invoice?.amount ?? 0;
  const unpaid = (invoice?.status ?? 'UNPAID') !== 'PAID';
  const code = invoice?.code ?? `KS-INV-${params.id ?? ''}`;

  const goHome = () => nav.navigate('bottom-nav');
  const goPay = () =>
    nav.navigate('bottom-nav', {
      screen: 'pay_stack',
      params: {screen: 'pay_rent'},
    });
  const goActivity = () =>
    nav.navigate('bottom-nav', {
      screen: 'pay_stack',
      params: {screen: 'receipts'},
    });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.keystone_canvas,
        paddingTop: insets.top,
      }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2EC" />
      {/* Modal bar — ✕, not a back label (arrives from outside the stack) */}
      <View
        style={{
          minHeight: 48,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
        }}>
        <TouchableOpacity
          onPress={goHome}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={{width: 44}}>
          <Icon name="x" size={20} color={COLORS.keystone_navy} strokeWidth={2.2} />
        </TouchableOpacity>
        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            color: COLORS.keystone_navy,
            fontFamily: 'Inter-SemiBold',
            fontSize: 17,
          }}>
          Invoice
        </Text>
        <View style={{width: 44}} />
      </View>

      <View style={{flex: 1, padding: 20}}>
        {invoiceIsPending && params.id ? (
          <ActivityIndicator color={COLORS.keystone_navy} style={{marginTop: 40}} />
        ) : (
          <>
            <HeroCard
              label={`INVOICE ${code}`}
              badge={{
                text: unpaid ? 'Unpaid' : 'Paid',
                dot: unpaid ? 'pending' : 'success',
              }}
              amount={usd(amount)}
              amountSize={34}
              sub={
                invoice?.dueDate
                  ? eventDate('Due', invoice.dueDate)
                  : 'Rent invoice'
              }
            />
            <Text
              style={{
                color: COLORS.keystone_slate,
                fontFamily: 'Inter',
                fontSize: 15,
                lineHeight: 22,
                marginTop: 16,
              }}>
              You followed an invoice link. Paying in the app isn’t available
              yet — keep paying your landlord the way you do today.
            </Text>
            <View style={{marginTop: 20, gap: 12}}>
              {/* Was `Pay $X in Keystone`, which routed to the rent screen
                  that says payment is unavailable, under copy promising a
                  receipt would land in Activity. Another entry point into
                  the same broken promise, reached from an emailed link. */}
              {unpaid && can('rentPayments') && (
                <PrimaryButton label={`Pay ${usd(amount)} in Keystone`} onPress={goPay} />
              )}
              <SecondaryButton label="View rent details" onPress={goPay} />
              <SecondaryButton label="View in Activity" onPress={goActivity} />
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default InvoiceView;
