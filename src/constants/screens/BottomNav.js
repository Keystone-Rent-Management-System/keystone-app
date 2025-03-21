import React from 'react';

import {Explore, Notifications} from '@/screens';
import {ExploreSvg, HomeSvg, MoreSvg, NotificationsSvg} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import NavOptions from '@/navigation/options';
import {Text, View} from 'react-native';
import {HomeStack} from '@/navigation';
import MoreStack from '../../navigation/MoreStack';

const screens = [
  {
    title: 'explore_stack',
    component: Explore,
    tab: {
      title: 'Explore',
      icon: isCurrent => (
        <ExploreSvg
          strokeWidth={isCurrent ? '0.8' : '0.4'}
          color={isCurrent ? COLORS.primary : COLORS.grey_1}
        />
      ),
    },
  },
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
    title: 'notifications',
    component: Notifications,
    tab: {
      title: 'Notifications',
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
