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
    // Simplified prompt optimized for Ideogram v2 (specialized for icons/emojis)
    const enhancedPrompt = `${prompt} emoji icon, simple flat design, minimalist, clean, suitable for discord or slack`

    // Create prediction with Ideogram v2
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '4c3c75ab66ee968a77b0101adb086e9ae6f8906b909477ea0df46e3f6c64f5a8', // Ideogram v2
        input: {
          prompt: enhancedPrompt,
          aspect_ratio: '1:1',
          magic_prompt_option: 'OFF', // Don't auto-enhance, we control the style
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
