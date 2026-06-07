import React from 'react';

import {Notifications} from '@/screens';
import {
  HomeSvg,
  LeasesSvg,
  MoreSvg,
  NotificationsSvg,
  PaymentsSvg,
} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import NavOptions from '@/navigation/options';
import {Text, View} from 'react-native';
import {HomeStack} from '@/navigation';
import MoreStack from '../../navigation/MoreStack';
import PayStack from '../../navigation/tenant/PayStack';
import MyHomeStack from '../../navigation/tenant/MyHomeStack';

// Tenant bottom-nav — mirrors the landlord 5-tab command center.
// The Pallax-era Explore/listings marketplace was removed (too soon for
// a marketplace; tenants are provisioned, not browsing). Explore code is
// parked in ExploreStack/Main, just no longer a tenant tab.

const screens = [
  {
    title: 'home_stack',
    component: HomeStack,
    tab: {
      title: 'Home',
      icon: isCurrent => (
        <HomeSvg
          color={isCurrent ? COLORS.primary : COLORS.grey_1}
          strokeWidth={isCurrent ? '1.5' : '1'}
        />
      ),
    },
  },
  {
    title: 'pay_stack',
    component: PayStack,
    tab: {
      title: 'Pay',
      icon: isCurrent => (
        <PaymentsSvg
          strokeWidth={isCurrent ? '1.5' : '1.2'}
          color={isCurrent ? COLORS.primary : COLORS.grey_1}
        />
      ),
    },
  },
  {
    title: 'my_home_stack',
    component: MyHomeStack,
    tab: {
      title: 'My Home',
      icon: isCurrent => (
        <LeasesSvg
          strokeWidth={isCurrent ? '1.5' : '1.2'}
          color={isCurrent ? COLORS.primary : COLORS.grey_1}
        />
      ),
    },
  },
  {
    title: 'notifications',
    component: Notifications,
    tab: {
      title: 'Inbox',
      icon: isCurrent => (
        <NotificationsSvg
          color={isCurrent ? COLORS.primary : COLORS.grey_1}
          strokeWidth={isCurrent ? '1.5' : '0.8'}
        />
      ),
    },
    options: {
      ...NavOptions.defaultOptions,
      header: () => <CustomHeader title={'Notifications'} />,
    },
  },
  {
    title: 'more',
    component: MoreStack,
    tab: {
      title: 'More',
      icon: isCurrent => (
        <MoreSvg color={isCurrent ? COLORS.primary : COLORS.grey_1} />
      ),
    },
  },
];

export default screens;

const CustomHeader = ({title}) => (
  <View className={'shadow-xl p-4 bg-bg border-b border-slate-50'}>
    <Text className={'font-open-sauce-sans-semibold text-lg text-black '}>{title}</Text>
  </View>
);
