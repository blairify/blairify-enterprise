-- Initial schema migration with RLS policies
-- Multi-tenant SaaS platform for AI interview system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('ENTERPRISE_ADMIN', 'ORG_ADMIN', 'RECRUITER', 'CANDIDATE');

-- Enterprise table (top-level tenant)
CREATE TABLE enterprise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Organisation table (sub-account under enterprise)
CREATE TABLE organisation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID NOT NULL REFERENCES enterprise(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    UNIQUE(enterprise_id, slug)
);

-- User table
CREATE TABLE "user" (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID NOT NULL REFERENCES enterprise(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organisation(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    UNIQUE(enterprise_id, email)
);

-- Job listing table
CREATE TABLE job_listing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID NOT NULL REFERENCES enterprise(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organisation(id) ON DELETE CASCADE,
    created_by_id UUID NOT NULL REFERENCES "user"(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Question template table
CREATE TABLE question_template (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID NOT NULL REFERENCES enterprise(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organisation(id),
    name TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Job template table (links jobs to question templates)
CREATE TABLE job_template (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID NOT NULL REFERENCES enterprise(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organisation(id) ON DELETE CASCADE,
    job_listing_id UUID NOT NULL REFERENCES job_listing(id) ON DELETE CASCADE,
    question_template_id UUID REFERENCES question_template(id) ON DELETE SET NULL,
    custom_questions JSONB,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Invite token table (single-use access codes)
-- Created before interview_session to avoid circular dependency
CREATE TABLE invite_token (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID NOT NULL REFERENCES enterprise(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organisation(id) ON DELETE CASCADE,
    job_listing_id UUID NOT NULL REFERENCES job_listing(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    max_uses INT NOT NULL DEFAULT 1,
    uses INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ(6) NOT NULL,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Interview session table
CREATE TABLE interview_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enterprise_id UUID NOT NULL REFERENCES enterprise(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organisation(id) ON DELETE CASCADE,
    job_listing_id UUID NOT NULL REFERENCES job_listing(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    invite_token_id UUID REFERENCES invite_token(id) ON DELETE SET NULL,
    questions_snapshot JSONB NOT NULL,
    responses JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    started_at TIMESTAMPTZ(6),
    completed_at TIMESTAMPTZ(6),
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_organisation_enterprise ON organisation(enterprise_id);
CREATE INDEX idx_user_enterprise ON "user"(enterprise_id);
CREATE INDEX idx_user_org ON "user"(org_id);
CREATE INDEX idx_user_email ON "user"(email);
CREATE INDEX idx_job_listing_enterprise_org ON job_listing(enterprise_id, org_id);
CREATE INDEX idx_job_listing_status ON job_listing(status);
CREATE INDEX idx_question_template_enterprise_org ON question_template(enterprise_id, org_id);
CREATE INDEX idx_job_template_job_listing ON job_template(job_listing_id);
CREATE INDEX idx_interview_session_enterprise_org ON interview_session(enterprise_id, org_id);
CREATE INDEX idx_interview_session_job_listing ON interview_session(job_listing_id);
CREATE INDEX idx_interview_session_candidate ON interview_session(candidate_id);
CREATE INDEX idx_interview_session_status ON interview_session(status);
CREATE INDEX idx_invite_token_code ON invite_token(code);
CREATE INDEX idx_invite_token_job_listing ON invite_token(job_listing_id);
CREATE INDEX idx_invite_token_expires ON invite_token(expires_at);

-- Enable Row Level Security on all tenant-scoped tables
ALTER TABLE organisation ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listing ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_token ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Organisation
CREATE POLICY organisation_tenant_isolation ON organisation
    USING (
        enterprise_id::text = current_setting('app.enterprise_id', true)
    );

-- RLS Policies for User
CREATE POLICY user_tenant_isolation ON "user"
    USING (
        enterprise_id::text = current_setting('app.enterprise_id', true)
        AND (
            org_id IS NULL 
            OR org_id::text = current_setting('app.organisation_id', true)
        )
    );

-- RLS Policies for Job Listing
CREATE POLICY job_listing_tenant_isolation ON job_listing
    USING (
        enterprise_id::text = current_setting('app.enterprise_id', true)
        AND org_id::text = current_setting('app.organisation_id', true)
    );

-- RLS Policies for Question Template
-- Enterprise-wide templates (org_id IS NULL) are visible to all orgs in enterprise
-- Org-specific templates only visible to that org
CREATE POLICY question_template_tenant_isolation ON question_template
    USING (
        enterprise_id::text = current_setting('app.enterprise_id', true)
        AND (
            org_id IS NULL 
            OR org_id::text = current_setting('app.organisation_id', true)
        )
    );

-- RLS Policies for Job Template
CREATE POLICY job_template_tenant_isolation ON job_template
    USING (
        enterprise_id::text = current_setting('app.enterprise_id', true)
        AND org_id::text = current_setting('app.organisation_id', true)
    );

-- RLS Policies for Interview Session
CREATE POLICY interview_session_tenant_isolation ON interview_session
    USING (
        enterprise_id::text = current_setting('app.enterprise_id', true)
        AND org_id::text = current_setting('app.organisation_id', true)
    );

-- RLS Policies for Invite Token
CREATE POLICY invite_token_tenant_isolation ON invite_token
    USING (
        enterprise_id::text = current_setting('app.enterprise_id', true)
        AND org_id::text = current_setting('app.organisation_id', true)
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_enterprise_updated_at BEFORE UPDATE ON enterprise
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organisation_updated_at BEFORE UPDATE ON organisation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "user"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_listing_updated_at BEFORE UPDATE ON job_listing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_template_updated_at BEFORE UPDATE ON question_template
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_template_updated_at BEFORE UPDATE ON job_template
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_session_updated_at BEFORE UPDATE ON interview_session
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invite_token_updated_at BEFORE UPDATE ON invite_token
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
