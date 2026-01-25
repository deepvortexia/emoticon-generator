import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  const apiKey = process.env.REPLICATE_API_TOKEN

  if (!apiKey) {
    return res.status(500).json({ error: 'Replicate API key not configured' })
  }

  try {
    // Enhanced prompt for emoticon style
    const enhancedPrompt = `Create a cute emoticon illustration of: ${prompt}. Style: bold outlines, vibrant colors, simple shapes, cartoon style, flat design, centered composition, white background, emoji-like, icon style, professional emoticon design`

    // Create prediction with Stable Diffusion XL
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b', // SDXL 1.0
        input: {
          prompt: enhancedPrompt,
          width: 512,
          height: 512,
          num_outputs: 1,
          scheduler: 'K_EULER',
          num_inference_steps: 25,
          guidance_scale: 7.5,
          negative_prompt: 'blurry, bad quality, distorted, ugly, watermark, text, signature, realistic photo, 3d render',
        },
      }),
    })

    const prediction = await response.json()

    if (!response.ok) {
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
        throw new Error(`Failed to poll prediction status: ${pollResponse.status} ${pollResponse.statusText}`)
      }
      
      result = await pollResponse.json()
      
      // Timeout after 30 seconds
      if (Date.now() - pollStartTime > 30000) {
        throw new Error('Generation timeout')
      }
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Generation failed')
    }

    // Validate output exists
    if (!result.output || !Array.isArray(result.output) || result.output.length === 0) {
      throw new Error('No image generated')
    }

    // Return the first output image
    return res.status(200).json({
      image: result.output[0],
    })
  } catch (error: any) {
    console.error('Error generating image:', error)
    return res.status(500).json({
      error: error.message || 'Failed to generate image',
    })
  }
}
