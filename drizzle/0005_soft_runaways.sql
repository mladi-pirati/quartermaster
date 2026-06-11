ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
UPDATE "orders" SET "status" = 'preparing' WHERE "status" = 'confirmed';--> statement-breakpoint
UPDATE "orders" SET "status" = 'complete' WHERE "status" = 'completed';--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'preparing', 'shipped', 'ready_for_pickup', 'complete', 'cancelled');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_paid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "invoice_issued_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "invoice_due_at" timestamp;--> statement-breakpoint
ALTER TABLE "shipping_options" DROP COLUMN "estimated_delivery_time";