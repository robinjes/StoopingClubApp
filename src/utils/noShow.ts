import { MAX_NO_SHOWS_BEFORE_RESTRICTION } from '../constants/noShow';
import type { CustomerOrder, PickupStatus } from '../types/customer';

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

/** Sunday end-of-day for the pickup week of the given order date. */
export function getPickupSunday(orderDate: Date): Date {
  const date = startOfDay(orderDate);
  const day = date.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const pickupSunday = new Date(date);
  pickupSunday.setDate(date.getDate() + daysUntilSunday);
  pickupSunday.setHours(23, 59, 59, 999);
  return pickupSunday;
}

export function isOrderPickedUp(order: CustomerOrder): boolean {
  if (order.fulfillmentStatus === 'FULFILLED') {
    return true;
  }

  return order.fulfillments.some((fulfillment) => fulfillment.isPickedUp);
}

export function getOrderPickupStatus(order: CustomerOrder, now = new Date()): PickupStatus {
  if (isOrderPickedUp(order)) {
    return 'picked_up';
  }

  const pickupSunday = getPickupSunday(new Date(order.processedAt));
  const pickupPassed = now.getTime() > pickupSunday.getTime();

  if (pickupPassed) {
    return 'no_show';
  }

  if (order.pickupConfirmed) {
    return 'confirmed';
  }

  return 'awaiting_confirmation';
}

export function countNoShows(orders: CustomerOrder[], now = new Date()): number {
  return orders.filter((order) => getOrderPickupStatus(order, now) === 'no_show').length;
}

export function isCheckoutRestricted(orders: CustomerOrder[], now = new Date()): boolean {
  return countNoShows(orders, now) >= MAX_NO_SHOWS_BEFORE_RESTRICTION;
}

export function getPickupStatusLabel(status: PickupStatus): string {
  switch (status) {
    case 'picked_up':
      return 'Picked up';
    case 'confirmed':
      return 'Confirmed for pickup';
    case 'awaiting_confirmation':
      return 'Confirm pickup';
    case 'no_show':
      return 'No-show';
    case 'upcoming':
      return 'Upcoming pickup';
    default:
      return status;
  }
}

export function formatPickupSunday(order: CustomerOrder): string {
  const pickupSunday = getPickupSunday(new Date(order.processedAt));
  return pickupSunday.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}
