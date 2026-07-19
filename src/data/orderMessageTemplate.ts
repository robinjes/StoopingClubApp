/**
 * Customize the auto message customers receive after checkout.
 * Placeholders: {{items}}, {{pickupDay}}, {{pickupLocation}}, {{pickupAddress}}
 */
export const ORDER_MESSAGE_TEMPLATE = {
  notificationTitle: 'Order placed — Stooping Club',
  headline: 'Your order has been placed',
  itemsIntro: 'Here is what you ordered:',
  pickupLine: 'Pickup on {{pickupDay}} at {{pickupLocation}}',
  pickupAddressLine: '{{pickupAddress}}',
  footer: 'We will see you at pickup. Thanks for stooping with us!',
} as const;
