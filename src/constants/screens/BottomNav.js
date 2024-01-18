import {Explore, Home, More, Notifications} from '../../screens';
import {
  ExploreSvg,
  HomeSvg,
  MoreSvg,
  NotificationsSvg,
} from '../../assets/icons';
import COLORS from '../../constants/Theme';

const screens = [
  {
    title: 'explore',
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
    title: 'home',
    component: Home,
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
  },
  {
    title: 'more',
    component: More,
    tab: {
      title: 'More',
      icon: isCurrent => (
        <MoreSvg color={isCurrent ? COLORS.primary : COLORS.grey_1} />
      ),
    },
  },
];

export default screens;
