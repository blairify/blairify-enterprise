-- Migration: Add SSO/SAML Support for Multi-Tenant Architecture
-- Description: Adds tables and RLS policies for enterprise SSO authentication
-- Date: 2025-01-09

-- ============================================================================
-- 1. CREATE SSO CONFIGURATION TABLE
-- ============================================================================
-- Stores SAML/SSO configuration per enterprise
CREATE TABLE IF NOT EXISTS sso_connection (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL REFERENCES enterprise(id) ON DELETE CASCADE,
    
    -- Connection metadata
    name TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'saml', 'oidc', 'oauth2'
    enabled BOOLEAN NOT NULL DEFAULT true,
    
    -- SAML Configuration
    saml_entity_id TEXT,
    saml_sso_url TEXT,
    saml_certificate TEXT, -- X.509 certificate
    saml_sign_request BOOLEAN DEFAULT false,
    saml_signature_algorithm TEXT DEFAULT 'sha256',
    
    -- OIDC/OAuth2 Configuration
    oidc_client_id TEXT,
    oidc_client_secret TEXT, -- Encrypted in production
    oidc_issuer_url TEXT,
    oidc_authorization_url TEXT,
    oidc_token_url TEXT,
    oidc_userinfo_url TEXT,
    oidc_scopes TEXT[] DEFAULT ARRAY['openid', 'profile', 'email'],
    
    -- Attribute Mapping (JSON)
    attribute_mapping JSONB DEFAULT '{
        "email": "email",
        "firstName": "given_name",
        "lastName": "family_name",
        "displayName": "name"
    }'::jsonb,
    
    -- Domain restrictions
    allowed_domains TEXT[], -- e.g., ['company.com', 'subsidiary.com']
    
    -- Metadata
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_enterprise_sso_name UNIQUE (enterprise_id, name)
);

-- Indexes for SSO connections
CREATE INDEX idx_sso_connection_enterprise_id ON sso_connection(enterprise_id);
CREATE INDEX idx_sso_connection_enabled ON sso_connection(enabled) WHERE enabled = true;

-- ============================================================================
-- 2. CREATE SSO SESSION TABLE
-- ============================================================================
-- Tracks SSO authentication sessions and SAML requests
CREATE TABLE IF NOT EXISTS sso_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sso_connection_id UUID NOT NULL REFERENCES sso_connection(id) ON DELETE CASCADE,
    
    -- Session identifiers
    saml_request_id TEXT, -- SAML Request ID
    relay_state TEXT, -- SAML RelayState for redirect after auth
    
    -- Session state
    state TEXT NOT NULL, -- 'pending', 'authenticated', 'failed', 'expired'
    
    -- User information from SSO provider
    sso_user_id TEXT, -- External user ID from IdP
    sso_email TEXT,
    sso_attributes JSONB, -- All attributes from IdP
    
    -- Linked user (after JIT provisioning)
    user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
    
    -- Session metadata
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    authenticated_at TIMESTAMPTZ(6),
    expires_at TIMESTAMPTZ(6) NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
    
    CONSTRAINT valid_state CHECK (state IN ('pending', 'authenticated', 'failed', 'expired'))
);

-- Indexes for SSO sessions
CREATE INDEX idx_sso_session_connection_id ON sso_session(sso_connection_id);
CREATE INDEX idx_sso_session_user_id ON sso_session(user_id);
CREATE INDEX idx_sso_session_state ON sso_session(state);
CREATE INDEX idx_sso_session_expires_at ON sso_session(expires_at);
CREATE INDEX idx_sso_session_saml_request_id ON sso_session(saml_request_id) WHERE saml_request_id IS NOT NULL;

-- ============================================================================
-- 3. CREATE SSO USER LINK TABLE
-- ============================================================================
-- Maps external SSO identities to internal users (for multiple SSO providers)
CREATE TABLE IF NOT EXISTS sso_user_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    sso_connection_id UUID NOT NULL REFERENCES sso_connection(id) ON DELETE CASCADE,
    
    -- External identity
    sso_user_id TEXT NOT NULL, -- User ID from external IdP
    sso_email TEXT NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ(6),
    
    CONSTRAINT unique_sso_user_per_connection UNIQUE (sso_connection_id, sso_user_id)
);

-- Indexes for SSO user links
CREATE INDEX idx_sso_user_link_user_id ON sso_user_link(user_id);
CREATE INDEX idx_sso_user_link_connection_id ON sso_user_link(sso_connection_id);
CREATE INDEX idx_sso_user_link_sso_email ON sso_user_link(sso_email);

-- ============================================================================
-- 4. ADD SSO COLUMNS TO USER TABLE
-- ============================================================================
-- Add SSO-related fields to existing user table
ALTER TABLE "user" 
    ADD COLUMN IF NOT EXISTS sso_enabled BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS sso_only BOOLEAN DEFAULT false, -- If true, password login disabled
    ADD COLUMN IF NOT EXISTS last_sso_login_at TIMESTAMPTZ(6);

-- Index for SSO users
CREATE INDEX IF NOT EXISTS idx_user_sso_enabled ON "user"(sso_enabled) WHERE sso_enabled = true;

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on SSO tables
ALTER TABLE sso_connection ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_user_link ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 6. CREATE RLS POLICIES FOR SSO TABLES
-- ============================================================================

-- Policy for sso_connection: Only accessible by same enterprise
CREATE POLICY sso_connection_tenant_isolation ON sso_connection
    FOR ALL
    USING (
        enterprise_id = NULLIF(current_setting('app.enterprise_id', true), '')::uuid
    );

-- Policy for sso_session: Accessible by enterprise of the connection
CREATE POLICY sso_session_tenant_isolation ON sso_session
    FOR ALL
    USING (
        sso_connection_id IN (
            SELECT id FROM sso_connection 
            WHERE enterprise_id = NULLIF(current_setting('app.enterprise_id', true), '')::uuid
        )
    );

-- Policy for sso_user_link: Accessible by enterprise of the user
CREATE POLICY sso_user_link_tenant_isolation ON sso_user_link
    FOR ALL
    USING (
        user_id IN (
            SELECT id FROM "user" 
            WHERE enterprise_id = NULLIF(current_setting('app.enterprise_id', true), '')::uuid
        )
    );

-- ============================================================================
-- 7. CREATE AUDIT LOG TABLE FOR SSO EVENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS sso_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id UUID NOT NULL REFERENCES enterprise(id) ON DELETE CASCADE,
    sso_connection_id UUID REFERENCES sso_connection(id) ON DELETE SET NULL,
    user_id UUID REFERENCES "user"(id) ON DELETE SET NULL,
    
    -- Event details
    event_type TEXT NOT NULL, -- 'login_success', 'login_failed', 'config_updated', etc.
    event_data JSONB,
    
    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_event_type CHECK (event_type IN (
        'login_success', 
        'login_failed', 
        'logout', 
        'config_created', 
        'config_updated', 
        'config_deleted',
        'user_provisioned',
        'session_expired'
    ))
);

-- Indexes for audit log
CREATE INDEX idx_sso_audit_log_enterprise_id ON sso_audit_log(enterprise_id);
CREATE INDEX idx_sso_audit_log_user_id ON sso_audit_log(user_id);
CREATE INDEX idx_sso_audit_log_event_type ON sso_audit_log(event_type);
CREATE INDEX idx_sso_audit_log_created_at ON sso_audit_log(created_at DESC);

-- Enable RLS on audit log
ALTER TABLE sso_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy for audit log
CREATE POLICY sso_audit_log_tenant_isolation ON sso_audit_log
    FOR ALL
    USING (
        enterprise_id = NULLIF(current_setting('app.enterprise_id', true), '')::uuid
    );

-- ============================================================================
-- 8. CREATE UPDATED_AT TRIGGER FOR SSO TABLES
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sso_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sso_connection
CREATE TRIGGER sso_connection_updated_at
    BEFORE UPDATE ON sso_connection
    FOR EACH ROW
    EXECUTE FUNCTION update_sso_updated_at();

-- ============================================================================
-- 9. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get SSO connection for a domain
CREATE OR REPLACE FUNCTION get_sso_connection_for_email(p_email TEXT)
RETURNS TABLE (
    connection_id UUID,
    enterprise_id UUID,
    provider TEXT,
    enabled BOOLEAN
) AS $$
DECLARE
    v_domain TEXT;
BEGIN
    -- Extract domain from email
    v_domain := SPLIT_PART(p_email, '@', 2);
    
    -- Find matching SSO connection
    RETURN QUERY
    SELECT 
        sc.id,
        sc.enterprise_id,
        sc.provider,
        sc.enabled
    FROM sso_connection sc
    WHERE sc.enabled = true
      AND v_domain = ANY(sc.allowed_domains)
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create or update SSO user (JIT provisioning)
CREATE OR REPLACE FUNCTION provision_sso_user(
    p_enterprise_id UUID,
    p_sso_connection_id UUID,
    p_sso_user_id TEXT,
    p_email TEXT,
    p_name TEXT,
    p_attributes JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_org_id UUID;
BEGIN
    -- Check if user already exists
    SELECT id INTO v_user_id
    FROM "user"
    WHERE enterprise_id = p_enterprise_id
      AND email = p_email;
    
    -- If user doesn't exist, create them
    IF v_user_id IS NULL THEN
        -- Get default organization for enterprise (if any)
        SELECT id INTO v_org_id
        FROM organisation
        WHERE enterprise_id = p_enterprise_id
        ORDER BY created_at
        LIMIT 1;
        
        -- Create new user
        INSERT INTO "user" (
            enterprise_id,
            org_id,
            email,
            name,
            role,
            sso_enabled,
            sso_only,
            last_sso_login_at
        ) VALUES (
            p_enterprise_id,
            v_org_id,
            p_email,
            p_name,
            'RECRUITER', -- Default role for SSO users
            true,
            true,
            NOW()
        )
        RETURNING id INTO v_user_id;
    ELSE
        -- Update existing user's SSO login time
        UPDATE "user"
        SET last_sso_login_at = NOW(),
            sso_enabled = true
        WHERE id = v_user_id;
    END IF;
    
    -- Create or update SSO user link
    INSERT INTO sso_user_link (
        user_id,
        sso_connection_id,
        sso_user_id,
        sso_email,
        last_login_at
    ) VALUES (
        v_user_id,
        p_sso_connection_id,
        p_sso_user_id,
        p_email,
        NOW()
    )
    ON CONFLICT (sso_connection_id, sso_user_id)
    DO UPDATE SET
        last_login_at = NOW(),
        sso_email = EXCLUDED.sso_email;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to application user (adjust role name as needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON sso_connection TO neondb_owner;
GRANT SELECT, INSERT, UPDATE, DELETE ON sso_session TO neondb_owner;
GRANT SELECT, INSERT, UPDATE, DELETE ON sso_user_link TO neondb_owner;
GRANT SELECT, INSERT ON sso_audit_log TO neondb_owner;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_sso_connection_for_email(TEXT) TO neondb_owner;
GRANT EXECUTE ON FUNCTION provision_sso_user(UUID, UUID, TEXT, TEXT, TEXT, JSONB) TO neondb_owner;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Add migration record
COMMENT ON TABLE sso_connection IS 'Stores SSO/SAML configuration per enterprise for federated authentication';
COMMENT ON TABLE sso_session IS 'Tracks SSO authentication sessions and SAML requests';
COMMENT ON TABLE sso_user_link IS 'Maps external SSO identities to internal users';
COMMENT ON TABLE sso_audit_log IS 'Audit log for SSO-related events';
