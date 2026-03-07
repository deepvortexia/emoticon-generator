import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { url, filename } = req.query
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing url' })
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'download'}"`)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream')
    res.send(Buffer.from(buffer))
}
