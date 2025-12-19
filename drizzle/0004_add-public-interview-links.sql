CREATE TYPE "public"."public_interview_attempt_status" AS ENUM('started', 'completed');--> statement-breakpoint

CREATE TABLE "public_interview_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"recruiter_id" uuid NOT NULL,
	"public_id" varchar(64) NOT NULL,
	"title" varchar(255) NOT NULL,
	"plan" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "public_interview_links_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint

ALTER TABLE "public_interview_links" ADD CONSTRAINT "public_interview_links_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_interview_links" ADD CONSTRAINT "public_interview_links_recruiter_id_users_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "public_interview_links_enterprise_id_idx" ON "public_interview_links" USING btree ("enterprise_id");--> statement-breakpoint
CREATE INDEX "public_interview_links_recruiter_id_idx" ON "public_interview_links" USING btree ("recruiter_id");--> statement-breakpoint

CREATE TABLE "public_interview_candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"public_interview_link_id" uuid NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"location" text NOT NULL,
	"cv_file_name" varchar(255),
	"cv_mime" varchar(100),
	"cv_base64" text,
	"cv_size_bytes" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "public_interview_candidates_link_email_unique" UNIQUE("public_interview_link_id","email")
);
--> statement-breakpoint

ALTER TABLE "public_interview_candidates" ADD CONSTRAINT "public_interview_candidates_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_interview_candidates" ADD CONSTRAINT "public_interview_candidates_public_interview_link_id_public_interview_links_id_fk" FOREIGN KEY ("public_interview_link_id") REFERENCES "public"."public_interview_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "public_interview_candidates_enterprise_id_idx" ON "public_interview_candidates" USING btree ("enterprise_id");--> statement-breakpoint
CREATE INDEX "public_interview_candidates_link_id_idx" ON "public_interview_candidates" USING btree ("public_interview_link_id");--> statement-breakpoint

CREATE TABLE "public_interview_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enterprise_id" uuid NOT NULL,
	"public_interview_link_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"status" "public_interview_attempt_status" DEFAULT 'started' NOT NULL,
	"interviewer_id" varchar(64),
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"answers" jsonb,
	"scores" jsonb,
	"analysis" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "public_interview_attempts_link_candidate_unique" UNIQUE("public_interview_link_id","candidate_id")
);
--> statement-breakpoint

ALTER TABLE "public_interview_attempts" ADD CONSTRAINT "public_interview_attempts_enterprise_id_enterprises_id_fk" FOREIGN KEY ("enterprise_id") REFERENCES "public"."enterprises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_interview_attempts" ADD CONSTRAINT "public_interview_attempts_public_interview_link_id_public_interview_links_id_fk" FOREIGN KEY ("public_interview_link_id") REFERENCES "public"."public_interview_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_interview_attempts" ADD CONSTRAINT "public_interview_attempts_candidate_id_public_interview_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."public_interview_candidates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

CREATE INDEX "public_interview_attempts_enterprise_id_idx" ON "public_interview_attempts" USING btree ("enterprise_id");--> statement-breakpoint
CREATE INDEX "public_interview_attempts_link_id_idx" ON "public_interview_attempts" USING btree ("public_interview_link_id");
