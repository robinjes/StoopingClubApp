import type { ImageSourcePropType } from 'react-native';

export type ImpactStat = {
  id: string;
  label: string;
  target: number;
  suffix?: string;
  prefix?: string;
};

export type HappyCustomerPhoto = {
  id: string;
  source: ImageSourcePropType;
};

export const IMPACT_STATS: ImpactStat[] = [
  {
    id: 'items',
    label: 'unique items diverted from landfill',
    target: 2000,
  },
  {
    id: 'customers',
    label: 'customers served',
    target: 360,
  },
  {
    id: 'co2',
    label: 'lbs of CO2e prevented',
    target: 15000,
    suffix: '+',
  },
  {
    id: 'savings',
    label: 'saved by our customers',
    target: 70000,
    prefix: '$',
    suffix: '+',
  },
];

export const HAPPY_CUSTOMER_PHOTOS: HappyCustomerPhoto[] = [
  {
    id: 'happy-customer-1',
    source: require('../../assets/happy-customer-1.png'),
  },
  {
    id: 'happy-customer-2',
    source: require('../../assets/happy-customer-2.png'),
  },
  {
    id: 'happy-customer-3',
    source: require('../../assets/happy-customer-3.png'),
  },
];
