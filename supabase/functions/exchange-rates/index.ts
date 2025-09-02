import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const baseCurrency = url.searchParams.get('base') || 'USD';
    const symbols = url.searchParams.get('symbols');
    
    const exchangeRatesApiKey = Deno.env.get('EXCHANGE_RATES_API_KEY');
    
    if (!exchangeRatesApiKey) {
      console.error('EXCHANGE_RATES_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Exchange rates API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Use exchangerate-api.com for live rates
    const apiUrl = symbols 
      ? `https://v6.exchangerate-api.com/v6/${exchangeRatesApiKey}/latest/${baseCurrency}`
      : `https://v6.exchangerate-api.com/v6/${exchangeRatesApiKey}/latest/${baseCurrency}`;

    console.log('Fetching exchange rates from:', apiUrl);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error('Exchange rate API error:', response.status, response.statusText);
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.result !== 'success') {
      console.error('Exchange rate API returned error:', data);
      throw new Error(data['error-type'] || 'Unknown API error');
    }

    // Filter rates if symbols specified
    let rates = data.conversion_rates;
    if (symbols) {
      const symbolsList = symbols.split(',');
      rates = Object.fromEntries(
        Object.entries(rates).filter(([key]) => symbolsList.includes(key))
      );
    }

    const result = {
      base: baseCurrency,
      rates,
      timestamp: data.time_last_update_unix,
      date: data.time_last_update_utc
    };

    console.log('Successfully fetched exchange rates for base:', baseCurrency);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in exchange-rates function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch exchange rates',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});