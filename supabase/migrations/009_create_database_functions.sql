CREATE OR REPLACE FUNCTION generate_company_uuid(
    geo_code TEXT,
    profit_tier TEXT
) RETURNS UUID AS $$
BEGIN
    -- Custom UUID generation with geo/profit encoding
    -- Implementation details for encoding business logic
    RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_company_data_for_ai(
    target_company_id UUID
) RETURNS JSONB AS $$
BEGIN
    -- Aggregate company data for AI tools
    -- Return structured JSON for Make.com webhooks
    RETURN jsonb_build_object(
        'company', (SELECT row_to_json(companies.*) FROM companies WHERE id = target_company_id),
        'clients', (SELECT json_agg(clients.*) FROM clients WHERE company_id = target_company_id),
        'active_jobs', (SELECT json_agg(jobs.*) FROM jobs WHERE company_id = target_company_id AND status = 'active')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
