CREATE TABLE "shipping_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"estimated_delivery_time" text NOT NULL,
	"price" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_option_id" uuid;
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_option_id_shipping_options_id_fk" FOREIGN KEY ("shipping_option_id") REFERENCES "public"."shipping_options"("id") ON DELETE set null ON UPDATE no action;
