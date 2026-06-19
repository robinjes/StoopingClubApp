export type PickupLocationDefinition = {
  id: string;
  label: string;
  description: string;
  tagMatches: string[];
};

export const PICKUP_LOCATIONS: PickupLocationDefinition[] = [
  {
    id: 'berkeley',
    label: 'Berkeley',
    description: 'Haas School of Business, UC Berkeley',
    tagMatches: ['Berkeley', 'Pickup: Berkeley', 'Haas'],
  },
];

export function getPickupLocationById(locationId: string | null): PickupLocationDefinition | null {
  if (!locationId) {
    return null;
  }

  return PICKUP_LOCATIONS.find((location) => location.id === locationId) ?? null;
}
