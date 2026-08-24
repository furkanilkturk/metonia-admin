CREATE TYPE "public"."user_status" AS ENUM ('active', 'invited', 'disabled');
--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM ('admin', 'editor', 'viewer');
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"status" "user_status" DEFAULT 'invited' NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
