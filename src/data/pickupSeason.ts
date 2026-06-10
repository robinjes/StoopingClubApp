export type PickupSite = {
  id: 'haas' | 'el-cerrito';
  name: string;
  address: string;
};

export const PICKUP_SITES: Record<PickupSite['id'], PickupSite> = {
  haas: {
    id: 'haas',
    name: 'Haas',
    address: 'Haas School of Business, UC Berkeley',
  },
  'el-cerrito': {
    id: 'el-cerrito',
    name: 'El Cerrito',
    address: 'El Cerrito pickup location',
  },
};

// Summer pickup runs June–August; school-year pickup is Haas the rest of the year.
export function getCurrentPickupSite(date = new Date()): PickupSite {
  const month = date.getMonth() + 1;

  if (month >= 6 && month <= 8) {
    return PICKUP_SITES['el-cerrito'];
  }

  return PICKUP_SITES.haas;
}
