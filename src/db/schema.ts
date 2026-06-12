import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const itemStatusEnum = pgEnum('item_status', [
  'draft',
  'active',
  'inactive',
])

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'preparing',
  'shipped',
  'ready_for_pickup',
  'complete',
  'cancelled',
])

export const deliveryTypeEnum = pgEnum('delivery_type', ['shipping', 'pickup'])

export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  sizes: text('sizes').array().notNull().default([]),
  status: itemStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const itemImages = pgTable('item_images', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: uuid('item_id')
    .notNull()
    .references(() => items.id, { onDelete: 'cascade' }),
  s3Key: text('s3_key').notNull(),
  url: text('url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const pickupLocations = pgTable('pickup_locations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const shippingOptions = pgTable('shipping_options', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  deliveryType: deliveryTypeEnum('delivery_type').notNull(),
  address: text('address'),
  city: text('city'),
  postalCode: text('postal_code'),
  country: text('country'),
  pickupLocationId: uuid('pickup_location_id').references(
    () => pickupLocations.id,
    { onDelete: 'set null' },
  ),
  shippingOptionId: uuid('shipping_option_id').references(
    () => shippingOptions.id,
    { onDelete: 'set null' },
  ),
  status: orderStatusEnum('status').notNull().default('pending'),
  isPaid: boolean('is_paid').notNull().default(false),
  notes: text('notes'),
  invoiceNumber: text('invoice_number'),
  invoiceIssuedAt: timestamp('invoice_issued_at'),
  invoiceDueAt: timestamp('invoice_due_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
})

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  itemId: uuid('item_id').references(() => items.id, { onDelete: 'set null' }),
  itemNameSnapshot: text('item_name_snapshot').notNull(),
  itemPriceSnapshot: integer('item_price_snapshot').notNull(),
  size: text('size').notNull(),
  quantity: integer('quantity').notNull(),
})

export const rateLimitWindows = pgTable('rate_limit_windows', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  windowStart: timestamp('window_start').defaultNow().notNull(),
})

export const invoiceCounters = pgTable('invoice_counters', {
  year: integer('year').primaryKey(),
  lastNumber: integer('last_number').notNull().default(0),
})

export const emailTypeEnum = pgEnum('email_type', [
  'order_confirmation',
  'order_shipped',
  'order_ready_for_pickup',
])

export const emailStatusEnum = pgEnum('email_status', ['sent', 'failed'])

export const emailLogs = pgTable('email_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  type: emailTypeEnum('type').notNull(),
  status: emailStatusEnum('status').notNull(),
  subject: text('subject').notNull(),
  resendId: text('resend_id'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
export type ItemImage = typeof itemImages.$inferSelect
export type PickupLocation = typeof pickupLocations.$inferSelect
export type ShippingOption = typeof shippingOptions.$inferSelect
export type Order = typeof orders.$inferSelect
export type OrderItem = typeof orderItems.$inferSelect
export type InvoiceCounter = typeof invoiceCounters.$inferSelect
export type EmailLog = typeof emailLogs.$inferSelect
