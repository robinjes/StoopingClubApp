export type CustomerOrderFulfillment = {
  id: string;
  status: string | null;
  isPickedUp: boolean;
};

export type CustomerOrder = {
  id: string;
  name: string;
  number: number;
  processedAt: string;
  fulfillmentStatus: string;
  fulfillments: CustomerOrderFulfillment[];
  pickupConfirmed: boolean;
  pickupConfirmedAt: string | null;
};

export type CustomerProfile = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

export type PickupStatus =
  | 'picked_up'
  | 'confirmed'
  | 'awaiting_confirmation'
  | 'no_show'
  | 'upcoming';
