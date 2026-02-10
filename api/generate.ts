import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
)

// fofr/sdxl-emoji - Specialized emoji model (actually works on Replicate!)
const EMOJI_MODEL_VERSION = 'dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e'
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('[generate] Request received:', { method: req.method, hasPrompt: !!req.body?.prompt })
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  // Check authentication
  const authHeader = req.headers.authorization
  console.log('[generate] Auth check:', { hasAuthHeader: !!authHeader })
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Please sign in to generate emoticons' })
  }

  const apiKey = process.env.REPLICATE_API_TOKEN

  if (!apiKey) {
    return res.status(500).json({ error: 'Replicate API key not configured' })
  }

  // Verify user and check credits
  let userId: string
  let currentCredits: number
  
  try {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication token' })
    }

    userId = user.id
    console.log('[generate] User verified:', { userId: user.id })

    // Get user's profile with credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    console.log('[generate] Profile fetched:', { credits: profile?.credits, hasProfile: !!profile })

    if (profileError) {
      return res.status(500).json({ error: 'Failed to fetch user profile' })
    }

    // Check if user has enough credits
    if (!profile || profile.credits < 1) {
      return res.status(402).json({ error: 'Insufficient credits. Please purchase more credits to continue.' })
    }

    currentCredits = profile.credits

    // Deduct credit before generation using atomic operation
    // This prevents race conditions by ensuring credits don't go below 0
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        credits: profile.credits - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .eq('credits', profile.credits) // Only update if credits haven't changed (optimistic locking)
      .select()
      .single()

    if (updateError || !updatedProfile) {
      // If update failed, it means credits were changed by another request
      return res.status(409).json({ error: 'Credit check failed, please try again' })
    }
  } catch (error: any) {
    console.error('Error verifying credits:', error)
    return res.status(500).json({ error: 'Failed to verify credits' })
  }

  // Now attempt to generate the image
  let generationFailed = false

  try {
    // Simplified prompt optimized for emoji generation
    const enhancedPrompt = `${prompt.trim()} emoji icon, simple flat design, minimalist, clean, suitable for discord or slack`

    // Create prediction with fofr/sdxl-emoji
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: EMOJI_MODEL_VERSION,
        input: {
          prompt: enhancedPrompt,
          width: 1024,
          height: 1024,
          apply_watermark: false,
          negative_prompt: "gradient, shading, 3D, realistic, photograph, complex background"
        }
      }),
    })

    const prediction = await response.json()

    console.log('[generate] Replicate response:', { status: response.status, ok: response.ok })

    if (!response.ok) {
      generationFailed = true
      throw new Error(prediction.detail || 'Failed to create prediction')
    }

    // Poll for completion (Replicate is async)
    let result = prediction
    const pollStartTime = Date.now()
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      
      const pollResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${result.id}`,
        {
          headers: {
            'Authorization': `Token ${apiKey}`,
          },
        }
      )
      
      if (!pollResponse.ok) {
        generationFailed = true
        throw new Error(`Failed to poll prediction status: ${pollResponse.status} ${pollResponse.statusText}`)
      }
      
      result = await pollResponse.json()
      
      console.log('[generate] Poll result:', { status: result.status, id: result.id })
      
      // Timeout after 30 seconds
      if (Date.now() - pollStartTime > 30000) {
        generationFailed = true
        throw new Error('Generation timeout')
      }
    }

    if (result.status === 'failed') {
      generationFailed = true
      console.log('[generate] Generation failed:', { error: result.error })
      throw new Error(result.error || 'Generation failed')
    }

    // Validate output exists
    if (!result.output || !Array.isArray(result.output) || result.output.length === 0) {
      generationFailed = true
      throw new Error('No image generated')
    }

    // Return the first output image
    return res.status(200).json({
      image: result.output[0],
    })
  } catch (error: any) {
    console.log('[generate] Error:', error?.message || 'Unknown error')
    console.error('Error generating image:', error)
    
    // Refund the credit if generation failed
    if (generationFailed) {
      try {
        await supabase
          .from('profiles')
          .update({
            credits: currentCredits, // Restore original credits
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
        
        console.log(`Refunded credit to user ${userId} due to generation failure`)
      } catch (refundError) {
        console.error('Failed to refund credit:', refundError)
      }
    }
    
    return res.status(500).json({
      error: error.message || 'Failed to generate image',
    })
  }
}
