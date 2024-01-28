import moment from 'moment';

const invoiceData = {
  unpaid: [
    {
      title: 'Purple Haze Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(3, 'months'),
      amount: 40000,
    },
    {
      title: 'Weelow Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(1, 'months'),
      amount: 10000,
    },
    {
      title: 'Purple Haze Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(3, 'months'),
      amount: 20000,
    },
    {
      title: 'Weelow Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(1, 'months'),
      amount: 30000,
    },
    {
      title: 'Purple Haze Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(2, 'months'),
      amount: 40000,
    },
    {
      title: 'Weelow Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(1, 'months'),
      amount: 50000,
    },
    {
      title: 'Purple Haze Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(4, 'months'),
      amount: 60000,
    },
    {
      title: 'Weelow Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(5, 'months'),
      amount: 70000,
    },
    {
      title: 'Purple Haze Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(3, 'months'),
      amount: 80000,
    },
    {
      title: 'Weelow Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(6, 'months'),
      amount: 40000,
    },
  ],
  paid: [
    {
      title: 'Paid Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(3, 'months'),
      amount: 40000,
    },
    {
      title: 'Rubyz Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(1, 'months'),
      amount: 10000,
    },
    {
      title: 'Paid Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(3, 'months'),
      amount: 20000,
    },
    {
      title: 'Rubyz Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(1, 'months'),
      amount: 30000,
    },
    {
      title: 'Paid Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(2, 'months'),
      amount: 40000,
    },
    {
      title: 'Rubyz Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(1, 'months'),
      amount: 50000,
    },
    {
      title: 'Paid Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(4, 'months'),
      amount: 60000,
    },
    {
      title: 'Rubyz Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(5, 'months'),
      amount: 70000,
    },
    {
      title: 'Paid Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(3, 'months'),
      amount: 80000,
    },
    {
      title: 'Rubyz Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(6, 'months'),
      amount: 40000,
    },
  ],

  pending: [
    {
      title: 'Pending Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(3, 'months'),
      amount: 40000,
    },
    {
      title: 'Pallax Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(1, 'months'),
      amount: 10000,
    },
    {
      title: 'Pending Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(3, 'months'),
      amount: 20000,
    },
    {
      title: 'Pallax Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(1, 'months'),
      amount: 30000,
    },
    {
      title: 'Pending Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(2, 'months'),
      amount: 40000,
    },
    {
      title: 'Pallax Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(1, 'months'),
      amount: 50000,
    },
    {
      title: 'Pending Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(4, 'months'),
      amount: 60000,
    },
    {
      title: 'Pallax Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(5, 'months'),
      amount: 70000,
    },
    {
      title: 'Pending Apartments',
      unit: 'Unit 08',
      date: moment().clone().subtract(3, 'months'),
      amount: 80000,
    },
    {
      title: 'Pallax Apartments',
      unit: 'Unit 508',
      date: moment().clone().subtract(6, 'months'),
      amount: 40000,
    },
  ],
};
export default invoiceData;
