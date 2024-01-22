import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Nav from '@/constants/nav';
import {BottomTabBtn} from '@/components';
import {BottomNavScreens} from '@/constants';

const Tab = createBottomTabNavigator();

const renderTab = ({focused, scr}) => (
  <BottomTabBtn icon={scr.tab.icon} text={scr.tab.title} isCurrent={focused} />
);

const BottomNav = () => {
  return (
    <Tab.Navigator screenOptions={Nav.BottomNavOptions}>
      {BottomNavScreens.map((scr, ind) => (
        <Tab.Screen
          key={ind}
          name={scr.title}
          component={scr.component}
          options={{
            tabBarIcon: ({focused}) => renderTab({focused, scr}),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BottomNav;
