import React from 'react';

/**
 * @type {Listing[]}
 */
import {
  AgreementSvg,
  BabyCareSvg,
  BuildingSvg,
  CarSvg,
  GymSvg,
  SecuritySvg,
  SwimmingPoolSvg,
  TrashSvg,
  WaterAvailableSvg,
  WaterBillSvg,
  WifiSvg,
} from '../assets/icons';

const listings = [
  {
    id: 1,
    image:
      'https://cdn.pixabay.com/photo/2016/11/23/14/29/living-room-1853203_1280.jpg',
    title: 'Blissful Retreats',
    location: 'Karen, Kiambu',
    coordinates: {
      latitude: -1.3082267348831669,
      longitude: 36.689035416536356,
    },
    user: 'landlord', // agent,landlord
    price: '62,000',
    category: 'bedroom',
    properties: {
      bedrooms: '3',
      bathrooms: '3',
      balconies: '2',
    },
    charges: {
      deposit: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      rent: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      agreement: {
        amount: '2,000',
        icon: <AgreementSvg />,
      },
      'water bill': {
        amount: '150/unit',
        icon: <WaterBillSvg />,
      },
      trash: {
        amount: '150/month',
        icon: <TrashSvg />,
      },
    },
    amenities: [
      {
        icon: <WaterAvailableSvg />,
        text: 'Available Water 24/7',
      },
      {
        icon: <WifiSvg />,
        text: 'Wifi',
      },
      {
        icon: <CarSvg />,
        text: 'Parking',
      },
      {
        icon: <SecuritySvg />,
        text: 'Security',
      },
      {
        icon: <GymSvg />,
        text: 'Gym',
      },
      {
        icon: <SwimmingPoolSvg />,
        text: 'Swimming Pool',
      },
      {
        icon: <BabyCareSvg />,
        text: 'Baby Care',
      },
    ],
  },
  {
    id: 2,
    image:
      'https://cdn.pixabay.com/photo/2016/08/26/15/06/home-1622401_1280.jpg',
    title: 'Ample Apartments',
    location: 'Ruiru, Kiambu',
    user: 'agent', // agent,landlord
    price: '50,000',
    category: 'bedroom',
    coordinates: {
      latitude: -1.142932449633917,
      longitude: 36.987845509501284,
    },
    properties: {
      bedrooms: '2',
      bathrooms: '1',
      balconies: '1',
    },
    charges: {
      deposit: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      rent: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      agreement: {
        amount: '2,000',
        icon: <AgreementSvg />,
      },
      'water bill': {
        amount: '150/unit',
        icon: <WaterBillSvg />,
      },
      trash: {
        amount: '150/month',
        icon: <TrashSvg />,
      },
    },
    amenities: [
      {
        icon: <WaterAvailableSvg />,
        text: 'Available Water 24/7',
      },
      {
        icon: <WifiSvg />,
        text: 'Wifi',
      },
      {
        icon: <CarSvg />,
        text: 'Parking',
      },
      {
        icon: <SecuritySvg />,
        text: 'Security',
      },
      {
        icon: <GymSvg />,
        text: 'Gym',
      },
      {
        icon: <SwimmingPoolSvg />,
        text: 'Swimming Pool',
      },
      {
        icon: <BabyCareSvg />,
        text: 'Baby Care',
      },
    ],
  },
  {
    id: 3,
    image:
      'https://cdn.pixabay.com/photo/2018/01/26/08/15/dining-room-3108037_1280.jpg',
    title: 'Discovery Point',
    location: 'Ruaka, Kiambu',
    coordinates: {
      latitude: -1.2062954731235718,
      longitude: 36.77367447769135,
    },
    user: 'agent', // agent,landlord
    price: '74,000',
    category: 'bedroom',
    properties: {
      bedrooms: '3',
      bathrooms: '3',
      balconies: '3',
    },
    charges: {
      deposit: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      rent: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      agreement: {
        amount: '2,000',
        icon: <AgreementSvg />,
      },
      'water bill': {
        amount: '150/unit',
        icon: <WaterBillSvg />,
      },
      trash: {
        amount: '150/month',
        icon: <TrashSvg />,
      },
    },
    amenities: [
      {
        icon: <WaterAvailableSvg />,
        text: 'Available Water 24/7',
      },
      {
        icon: <WifiSvg />,
        text: 'Wifi',
      },
      {
        icon: <CarSvg />,
        text: 'Parking',
      },
      {
        icon: <SecuritySvg />,
        text: 'Security',
      },
      {
        icon: <GymSvg />,
        text: 'Gym',
      },
      {
        icon: <SwimmingPoolSvg />,
        text: 'Swimming Pool',
      },
      {
        icon: <BabyCareSvg />,
        text: 'Baby Care',
      },
    ],
  },
  {
    id: 4,
    image:
      'https://cdn.pixabay.com/photo/2015/11/07/21/29/living-1032732_1280.jpg',
    title: 'Harmony Estates',
    location: 'Ngara, Nairobi',
    coordinates: {
      latitude: -1.2757009333559883,
      longitude: 36.82789897171097,
    },
    user: 'landlord', // agent,landlord
    price: '30,000',
    category: 'bedroom',
    properties: {
      bedrooms: '1',
      bathrooms: '2',
      balconies: '0',
    },
    charges: {
      deposit: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      rent: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      agreement: {
        amount: '2,000',
        icon: <AgreementSvg />,
      },
      'water bill': {
        amount: '150/unit',
        icon: <WaterBillSvg />,
      },
      trash: {
        amount: '150/month',
        icon: <TrashSvg />,
      },
    },
    amenities: [
      {
        icon: <WaterAvailableSvg />,
        text: 'Available Water 24/7',
      },
      {
        icon: <WifiSvg />,
        text: 'Wifi',
      },
      {
        icon: <CarSvg />,
        text: 'Parking',
      },
      {
        icon: <SecuritySvg />,
        text: 'Security',
      },
      {
        icon: <GymSvg />,
        text: 'Gym',
      },
      {
        icon: <SwimmingPoolSvg />,
        text: 'Swimming Pool',
      },
      {
        icon: <BabyCareSvg />,
        text: 'Baby Care',
      },
    ],
  },
  {
    id: 5,
    image:
      'https://cdn.pixabay.com/photo/2016/11/30/08/46/living-room-1872191_1280.jpg',
    title: 'Maplewood Apartments',
    location: 'Karen, Kiambu',
    coordinates: {
      latitude: -1.3196964970431557,
      longitude: 36.664080066691305,
    },
    user: 'landlord', // agent,landlord
    price: '100,000',
    category: 'bedroom',
    properties: {
      bedrooms: '4',
      bathrooms: '5',
      balconies: '3',
    },
    charges: {
      deposit: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      rent: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      agreement: {
        amount: '2,000',
        icon: <AgreementSvg />,
      },
      'water bill': {
        amount: '150/unit',
        icon: <WaterBillSvg />,
      },
      trash: {
        amount: '150/month',
        icon: <TrashSvg />,
      },
    },
    amenities: [
      {
        icon: <WaterAvailableSvg />,
        text: 'Available Water 24/7',
      },
      {
        icon: <WifiSvg />,
        text: 'Wifi',
      },
      {
        icon: <CarSvg />,
        text: 'Parking',
      },
      {
        icon: <SecuritySvg />,
        text: 'Security',
      },
      {
        icon: <GymSvg />,
        text: 'Gym',
      },
      {
        icon: <SwimmingPoolSvg />,
        text: 'Swimming Pool',
      },
      {
        icon: <BabyCareSvg />,
        text: 'Baby Care',
      },
    ],
  },
  {
    id: 6,
    image:
      'https://cdn.pixabay.com/photo/2015/04/18/13/23/living-room-728736_1280.jpg',
    title: 'Astra Heights',
    location: 'Ruaka, Kiambu',
    coordinates: {
      latitude: -1.204232152472298,
      longitude: 36.76742870319201,
    },
    user: 'agent', // agent,landlord
    price: '50,000',
    category: 'bedroom',
    properties: {
      bedrooms: '2',
      bathrooms: '1',
      balconies: '1',
    },
    charges: {
      deposit: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      rent: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      agreement: {
        amount: '2,000',
        icon: <AgreementSvg />,
      },
      'water bill': {
        amount: '150/unit',
        icon: <WaterBillSvg />,
      },
      trash: {
        amount: '150/month',
        icon: <TrashSvg />,
      },
    },
    amenities: [
      {
        icon: <WaterAvailableSvg />,
        text: 'Available Water 24/7',
      },
      {
        icon: <WifiSvg />,
        text: 'Wifi',
      },
      {
        icon: <CarSvg />,
        text: 'Parking',
      },
      {
        icon: <SecuritySvg />,
        text: 'Security',
      },
      {
        icon: <GymSvg />,
        text: 'Gym',
      },
      {
        icon: <SwimmingPoolSvg />,
        text: 'Swimming Pool',
      },
      {
        icon: <BabyCareSvg />,
        text: 'Baby Care',
      },
    ],
  },
  {
    id: 7,
    image:
      'https://cdn.pixabay.com/photo/2015/04/18/13/23/living-room-728731_1280.jpg',
    title: 'Gallery Gardens',
    location: "Kenol, Murang'a",
    coordinates: {
      latitude: -0.9520639921056704,
      longitude: 37.10865041093279,
    },
    user: 'agent', // agent,landlord
    price: '40,000',
    category: 'bedroom',
    properties: {
      bedrooms: '2',
      bathrooms: '2',
      balconies: '1',
    },
    charges: {
      deposit: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      rent: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      agreement: {
        amount: '2,000',
        icon: <AgreementSvg />,
      },
      'water bill': {
        amount: '150/unit',
        icon: <WaterBillSvg />,
      },
      trash: {
        amount: '150/month',
        icon: <TrashSvg />,
      },
    },
    amenities: [
      {
        icon: <WaterAvailableSvg />,
        text: 'Available Water 24/7',
      },
      {
        icon: <WifiSvg />,
        text: 'Wifi',
      },
      {
        icon: <CarSvg />,
        text: 'Parking',
      },
      {
        icon: <SecuritySvg />,
        text: 'Security',
      },
      {
        icon: <GymSvg />,
        text: 'Gym',
      },
      {
        icon: <SwimmingPoolSvg />,
        text: 'Swimming Pool',
      },
      {
        icon: <BabyCareSvg />,
        text: 'Baby Care',
      },
    ],
  },
  {
    id: 8,
    image:
      'https://cdn.pixabay.com/photo/2020/02/02/17/06/living-room-modern-tv-4813589_1280.jpg',
    title: 'Regal Residence',
    location: "Kenol, Murang'a",
    coordinates: {
      latitude: -0.9595431020464211,
      longitude: 37.11866961513062,
    },
    user: 'agent', // agent,landlord
    price: '80,000',
    category: 'villa',
    properties: {
      bedrooms: '5',
      bathrooms: '4',
      balconies: '2',
    },
    charges: {
      deposit: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      rent: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      agreement: {
        amount: '2,000',
        icon: <AgreementSvg />,
      },
      'water bill': {
        amount: '150/unit',
        icon: <WaterBillSvg />,
      },
      trash: {
        amount: '150/month',
        icon: <TrashSvg />,
      },
    },
    amenities: [
      {
        icon: <WaterAvailableSvg />,
        text: 'Available Water 24/7',
      },
      {
        icon: <WifiSvg />,
        text: 'Wifi',
      },
      {
        icon: <CarSvg />,
        text: 'Parking',
      },
      {
        icon: <SecuritySvg />,
        text: 'Security',
      },
      {
        icon: <GymSvg />,
        text: 'Gym',
      },
      {
        icon: <SwimmingPoolSvg />,
        text: 'Swimming Pool',
      },
      {
        icon: <BabyCareSvg />,
        text: 'Baby Care',
      },
    ],
  },
  {
    id: 9,
    image:
      'https://assets-global.website-files.com/61d451660d7f41e5024d0b9d/628252b20fc0dd528331c5ee_ourdomain-rotterdam-blaak-standard-studio-rotterdam-living-bedroom.jpg',
    title: 'Furnished Studio',
    location: "Kenol, Murang'a",
    coordinates: {
      latitude: -0.9442056254416549,
      longitude: 37.12792992309176,
    },
    user: 'agent', // agent,landlord
    price: '20,000',
    category: 'studio',
    properties: {
      bedrooms: '0',
      bathrooms: '1',
      balconies: '1',
    },
    charges: {
      deposit: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      rent: {
        amount: '30,000',
        icon: <BuildingSvg />,
      },
      agreement: {
        amount: '2,000',
        icon: <AgreementSvg />,
      },
      'water bill': {
        amount: '150/unit',
        icon: <WaterBillSvg />,
      },
      trash: {
        amount: '150/month',
        icon: <TrashSvg />,
      },
    },
    amenities: [
      {
        icon: <WaterAvailableSvg />,
        text: 'Available Water 24/7',
      },
      {
        icon: <WifiSvg />,
        text: 'Wifi',
      },
      {
        icon: <CarSvg />,
        text: 'Parking',
      },
      {
        icon: <SecuritySvg />,
        text: 'Security',
      },
      {
        icon: <GymSvg />,
        text: 'Gym',
      },
      {
        icon: <SwimmingPoolSvg />,
        text: 'Swimming Pool',
      },
      {
        icon: <BabyCareSvg />,
        text: 'Baby Care',
      },
    ],
  },
];

export default listings;

/**
 * @typedef {{
 *     id:number,
 *     image: string,
 *     price: string,
 *     location: string,
 *     coordinates:{latitude:float,longitude:float}
 *     title: string,
 *     category: string,
 *     user: string,
 *     properties: {
 *      bedrooms: string,
 *      balconies: string,
 *      bathrooms: string
 *   }
 * }} Listing
 */
