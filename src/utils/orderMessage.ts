import { ORDER_MESSAGE_TEMPLATE } from '../data/orderMessageTemplate';
import { getCurrentPickupSite } from '../data/pickupSeason';
import { getPickupSunday } from './noShow';

export type OrderMessageItem = {
  title: string;
  quantity: number;
};

export type OrderMessageContent = {
  notificationTitle: string;
  headline: string;
  itemsIntro: string;
  itemLines: string[];
  pickupLine: string;
  pickupAddressLine: string;
  footer: string;
  notificationBody: string;
};

function formatItemLines(items: OrderMessageItem[]): string[] {
  if (items.length === 0) {
    return ['No items listed'];
  }

  return items.map((item) =>
    item.quantity > 1 ? `${item.title} x${item.quantity}` : item.title,
  );
}

function formatItemsForNotification(items: OrderMessageItem[]): string {
  return formatItemLines(items).join(', ');
}

function formatPickupDay(orderDate: Date): string {
  return getPickupSunday(orderDate).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function applyTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? '');
}

export function buildOrderMessage(
  items: OrderMessageItem[],
  orderDate = new Date(),
): OrderMessageContent {
  const pickupSite = getCurrentPickupSite(orderDate);
  const pickupDay = formatPickupDay(orderDate);
  const itemLines = formatItemLines(items);

  const templateValues = {
    items: formatItemsForNotification(items),
    pickupDay,
    pickupLocation: pickupSite.name,
    pickupAddress: pickupSite.address,
  };

  const pickupLine = applyTemplate(ORDER_MESSAGE_TEMPLATE.pickupLine, templateValues);
  const pickupAddressLine = applyTemplate(
    ORDER_MESSAGE_TEMPLATE.pickupAddressLine,
    templateValues,
  );

  const notificationBody = [
    ORDER_MESSAGE_TEMPLATE.headline,
    `${ORDER_MESSAGE_TEMPLATE.itemsIntro} ${templateValues.items}.`,
    `${pickupLine}.`,
    pickupAddressLine,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    notificationTitle: ORDER_MESSAGE_TEMPLATE.notificationTitle,
    headline: ORDER_MESSAGE_TEMPLATE.headline,
    itemsIntro: ORDER_MESSAGE_TEMPLATE.itemsIntro,
    itemLines,
    pickupLine,
    pickupAddressLine,
    footer: ORDER_MESSAGE_TEMPLATE.footer,
    notificationBody,
  };
}
