import React from 'react';

import {Text, View} from 'react-native';
import {BillItem, Layout, StatementsFilterBtn} from '../../components';
import CBarChart from '../../components/screens/bills/Chart';
import COLORS from '../../constants/Theme';
import {HomeSvg, SecuritySvg, TrashSvg, WaterBillSvg} from '../../assets/icons';

const Bills = () => {
  return (
    <Layout ClassName={'p-5'} isScrollable>
      <View className={'flex-row justify-end mb-2'}>
        <StatementsFilterBtn />
      </View>

      <CBarChart cData={data} />

      {/*  bills categories */}

      <Text className={'font-inter-semibold text-base text-black mt-2'}>
        Bill Categories
      </Text>

      {bills?.map(({icon, value, title}, ind) => (
        <BillItem icon={icon} title={title} amount={value} key={ind} />
      ))}

      <View className={'w-full h-10'} />
    </Layout>
  );
};

export default Bills;

const colors = {
  rent: '#42ADE2',
  water: '#DEABFF',
  trash: '#B7FDCF',
  security: COLORS.primary,
};

const data = {
  labels: ['January', 'February', 'March', 'April', 'May'],
  legend: ['Rent', 'Water', 'Trash', 'Security'],
  data: [
    [
      Math.ceil(Math.random() / 4) * 100,
      Math.ceil(Math.random() / 4) * 100,
      Math.ceil(Math.random() / 5) * 100,
      Math.random() * 100,
    ],
    [
      Math.ceil(Math.random() / 4) * 100,
      Math.ceil(Math.random() / 4) * 100,
      Math.ceil(Math.random() / 5) * 100,
      Math.random() * 100,
    ],
    [
      Math.ceil(Math.random() / 4) * 100,
      Math.ceil(Math.random() / 4) * 100,
      Math.ceil(Math.random() / 5) * 100,
      Math.random() * 100,
    ],
    [
      Math.ceil(Math.random() / 4) * 100,
      Math.ceil(Math.random() / 4) * 100,
      Math.ceil(Math.random() / 5) * 100,
      Math.random() * 100,
    ],
    [
      Math.ceil(Math.random() / 4) * 100,
      Math.ceil(Math.random() / 4) * 100,
      Math.ceil(Math.random() / 5) * 100,
      Math.random() * 100,
    ],
  ],
  barColors: Object?.values(colors),
};

const bills = [
  {
    icon: <HomeSvg />,
    title: 'Rent',
    value: '50,000',
  },
  {
    icon: <WaterBillSvg />,
    title: 'Water',
    value: '2,000',
  },
  {
    icon: <TrashSvg />,
    title: 'Trash',
    value: '1,000',
  },
  {
    icon: <SecuritySvg />,
    title: 'Security',
    value: '5,000',
  },
];
