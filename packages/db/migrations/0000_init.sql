CREATE TYPE "public"."language" AS ENUM('id', 'en');--> statement-breakpoint
CREATE TABLE "persons" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"language" "language" DEFAULT 'id' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
