import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "ENTERPRISE_ADMIN",
  "RECRUITER",
  "READ_ONLY",
]);

export const enterprises = pgTable("enterprises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const organisations = pgTable(
  "organisations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    enterpriseId: uuid("enterprise_id")
      .notNull()
      .references(() => enterprises.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    industry: text("industry"),
    location: text("location"),
    size: varchar("size", { length: 64 }),
    website: text("website"),
    hiringFocus: text("hiring_focus"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    enterpriseNameUnique: uniqueIndex(
      "organisations_enterprise_name_unique",
    ).on(table.enterpriseId, table.name),
  }),
);

export const candidates = pgTable("candidates", {
  id: uuid("id").defaultRandom().primaryKey(),
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprises.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  headline: text("headline"),
  location: text("location"),
  seniority: varchar("seniority", { length: 100 }),
  currentCompany: text("current_company"),
  linkedInUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  cvUrl: text("cv_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    enterpriseId: uuid("enterprise_id")
      .notNull()
      .references(() => enterprises.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    jobTitle: varchar("job_title", { length: 255 }),
    role: userRoleEnum("role").notNull().default("RECRUITER"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    emailEnterpriseUnique: uniqueIndex("users_email_enterprise_unique").on(
      table.enterpriseId,
      table.email,
    ),
  }),
);

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  enterpriseId: uuid("enterprise_id")
    .notNull()
    .references(() => enterprises.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
});

export const publicInterviewAttemptStatusEnum = pgEnum(
  "public_interview_attempt_status",
  ["started", "completed"],
);

export const publicInterviewLinks = pgTable(
  "public_interview_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    enterpriseId: uuid("enterprise_id")
      .notNull()
      .references(() => enterprises.id, { onDelete: "cascade" }),
    recruiterId: uuid("recruiter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    publicId: varchar("public_id", { length: 64 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    plan: jsonb("plan").$type<unknown>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    publicIdUnique: uniqueIndex("public_interview_links_public_id_unique").on(
      table.publicId,
    ),
    enterpriseIdx: index("public_interview_links_enterprise_id_idx").on(
      table.enterpriseId,
    ),
    recruiterIdx: index("public_interview_links_recruiter_id_idx").on(
      table.recruiterId,
    ),
  }),
);

export const publicInterviewCandidates = pgTable(
  "public_interview_candidates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    enterpriseId: uuid("enterprise_id")
      .notNull()
      .references(() => enterprises.id, { onDelete: "cascade" }),
    publicInterviewLinkId: uuid("public_interview_link_id")
      .notNull()
      .references(() => publicInterviewLinks.id, { onDelete: "cascade" }),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    location: text("location").notNull(),
    cvFileName: varchar("cv_file_name", { length: 255 }),
    cvMime: varchar("cv_mime", { length: 100 }),
    cvBase64: text("cv_base64"),
    cvSizeBytes: integer("cv_size_bytes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    linkEmailUnique: uniqueIndex(
      "public_interview_candidates_link_email_unique",
    ).on(table.publicInterviewLinkId, table.email),
    enterpriseIdx: index("public_interview_candidates_enterprise_id_idx").on(
      table.enterpriseId,
    ),
    linkIdx: index("public_interview_candidates_link_id_idx").on(
      table.publicInterviewLinkId,
    ),
  }),
);

export const publicInterviewAttempts = pgTable(
  "public_interview_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    enterpriseId: uuid("enterprise_id")
      .notNull()
      .references(() => enterprises.id, { onDelete: "cascade" }),
    publicInterviewLinkId: uuid("public_interview_link_id")
      .notNull()
      .references(() => publicInterviewLinks.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => publicInterviewCandidates.id, { onDelete: "cascade" }),
    status: publicInterviewAttemptStatusEnum("status")
      .notNull()
      .default("started"),
    interviewerId: varchar("interviewer_id", { length: 64 }),
    startedAt: timestamp("started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    answers: jsonb("answers").$type<unknown>(),
    scores: jsonb("scores").$type<unknown>(),
    analysis: jsonb("analysis").$type<unknown>(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    linkCandidateUnique: uniqueIndex(
      "public_interview_attempts_link_candidate_unique",
    ).on(table.publicInterviewLinkId, table.candidateId),
    enterpriseIdx: index("public_interview_attempts_enterprise_id_idx").on(
      table.enterpriseId,
    ),
    linkIdx: index("public_interview_attempts_link_id_idx").on(
      table.publicInterviewLinkId,
    ),
  }),
);

export const permissionKeyEnum = pgEnum("permission_key", [
  "manage_users",
  "manage_jobs",
  "manage_candidates",
  "view_reports",
  "manage_organisations",
]);

export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: permissionKeyEnum("key").notNull().unique(),
  description: text("description"),
});

export const rolePermissions = pgTable("role_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  role: userRoleEnum("role").notNull(),
  permissionId: uuid("permission_id")
    .notNull()
    .references(() => permissions.id, { onDelete: "cascade" }),
});

export type Enterprise = typeof enterprises.$inferSelect;
export type Organisation = typeof organisations.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type PublicInterviewLink = typeof publicInterviewLinks.$inferSelect;
export type PublicInterviewCandidate =
  typeof publicInterviewCandidates.$inferSelect;
export type PublicInterviewAttempt =
  typeof publicInterviewAttempts.$inferSelect;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
