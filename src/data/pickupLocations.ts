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
    description: 'North Berkeley pickup',
    tagMatches: ['Berkeley', 'Pickup: Berkeley'],
  },
  {
    id: 'oakland',
    label: 'Oakland',
    description: 'Downtown Oakland pickup',
    tagMatches: ['Oakland', 'Pickup: Oakland'],
  },
];

export function getPickupLocationById(locationId: string | null): PickupLocationDefinition | null {
  if (!locationId) {
    return null;
  }

  return PICKUP_LOCATIONS.find((location) => location.id === locationId) ?? null;
}
