import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, maskUrl } = await req.json()

    // Call Replicate or another AI service for Magic Eraser (Inpainting)
    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')
    
    if (!REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN is not set")
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "c185a068cd6701c60b5d56bdf114ea7d81e1948dbdb7dbff7da3b2cddfbdb388", // stable-diffusion-inpainting
        input: {
          image: imageUrl,
          mask: maskUrl,
          prompt: "background",
        }
      })
    });

    const prediction = await response.json()

    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
