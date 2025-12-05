CREATE TABLE "candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255),
	"headline" text,
	"location" text,
	"seniority" varchar(100),
	"current_company" text,
	"linkedin_url" text,
	"github_url" text,
	"cv_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "candidates_enterprise_id_idx" ON "candidates" USING btree ("enterprise_id");
