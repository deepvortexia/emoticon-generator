import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { packName, credits, amountCents } = req.body

  if (!packName || !credits || !amountCents) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Get user from authorization header or cookie
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${packName} Pack - ${credits} Credits`,
              description: `Purchase ${credits} credits for generating emoticons`,
              images: ['https://em-content.zobj.net/source/apple/391/artist-palette_1f3a8.png'],
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}`,
      metadata: {
        packName,
        credits: credits.toString(),
        authHeader,
      },
    })

    return res.status(200).json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return res.status(500).json({
      error: error.message || 'Failed to create checkout session',
    })
  }
}
