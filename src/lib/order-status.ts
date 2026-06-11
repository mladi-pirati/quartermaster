export const ALL_STATUSES = ['pending', 'preparing', 'shipped', 'ready_for_pickup', 'complete', 'cancelled'] as const
export type OrderStatus = (typeof ALL_STATUSES)[number]

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  preparing: 'Preparing',
  shipped: 'Shipped',
  ready_for_pickup: 'Ready for Pickup',
  complete: 'Complete',
  cancelled: 'Cancelled',
}
