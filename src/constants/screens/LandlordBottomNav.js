import React from 'react';

import {
  DashboardSvg,
  LeasesSvg,
  MoreSvg,
  ReportsSvg,
} from '@/assets/icons';
import COLORS from '@/constants/Theme';
import {Icon as KitIcon} from '@/components/premium';
import DashboardStack from '@/navigation/landlord/DashboardStack';
import PaymentsStack from '@/navigation/landlord/PaymentsStack';
import LeasesStack from '@/navigation/landlord/LeasesStack';
import ReportsStack from '@/navigation/landlord/ReportsStack';
import MoreStack from '@/navigation/MoreStack';

// Landlord-mode bottom-nav tabs. The role split lives in BottomNav.jsx
// — when the authenticated profile has ROLE_LANDLORD this array is
// used; tenants get the original BottomNav.js config.

const landlordScreens = [
  {
    title: 'dashboard_stack',
    component: DashboardStack,
    tab: {
      title: 'Dashboard',
      icon: isCurrent => (
        <DashboardSvg
          strokeWidth={isCurrent ? '1.5' : '1.2'}
          color={isCurrent ? COLORS.primary : COLORS.grey_1}
        />
      ),
    },
  },
  {
    title: 'payments_stack',
    component: PaymentsStack,
    tab: {
      title: 'Payments',
      icon: isCurrent => (
        <KitIcon
          name="card"
          size={23}
          strokeWidth={isCurrent ? 1.9 : 1.5}
          color={isCurrent ? COLORS.primary : COLORS.grey_1}
        />
      ),
    },
  },
  {
    title: 'leases_stack',
    component: LeasesStack,
    tab: {
      title: 'Leases',
      icon: isCurrent => (
        <LeasesSvg
          strokeWidth={isCurrent ? '1.5' : '1.2'}
          color={isCurrent ? COLORS.primary : COLORS.grey_1}
        />
      ),
    },
  },
  {
    title: 'reports_stack',
    component: ReportsStack,
    tab: {
      title: 'Reports',
      icon: isCurrent => (
        <ReportsSvg
          strokeWidth={isCurrent ? '1.5' : '1.2'}
          color={isCurrent ? COLORS.primary : COLORS.grey_1}
        />
      ),
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

export default landlordScreens;
