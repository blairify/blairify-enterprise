ALTER TYPE "public"."permission_key" ADD VALUE 'manage_users' BEFORE 'manage_jobs';--> statement-breakpoint
ALTER TYPE "public"."permission_key" ADD VALUE 'manage_organisations';--> statement-breakpoint
CREATE TABLE "organisations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organisations_enterprise_name_unique" ON "organisations" USING btree ("enterprise_id","name");