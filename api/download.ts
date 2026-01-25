import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Image URL is required' })
  }

  try {
    // Fetch the image from OpenAI
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }

    const imageBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(imageBuffer)

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Disposition', `attachment; filename="emoticon-${Date.now()}.png"`)
    res.setHeader('Cache-Control', 'no-cache')
    
    return res.send(buffer)
  } catch (error: any) {
    console.error('Error downloading image:', error)
    return res.status(500).json({ error: 'Failed to download image' })
  }
}
