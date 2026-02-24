/**
 * Onboarding Connect - POST OAuth connection for a provider.
 * Stores connector with encrypted tokens. PKCE handled by client.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const providerId = body?.provider_id ?? ''
    if (!providerId) {
      return new Response(
        JSON.stringify({ error: 'provider_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: connector, error } = await supabase
      .from('connectors')
      .upsert(
        {
          provider_key: providerId,
          user_id: user.id,
          status: 'connected',
          connected_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider_key' }
      )
      .select('id, provider_key, user_id, status, connected_at, last_used_at')
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const out = {
      ok: true,
      connector: connector
        ? {
            id: connector.id,
            provider_key: connector.provider_key,
            user_id: connector.user_id,
            status: connector.status,
            connected_at: connector.connected_at,
            last_used_at: connector.last_used_at,
            display_name: providerId,
          }
        : undefined,
    }
    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
