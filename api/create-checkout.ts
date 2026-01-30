import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
)

// Price validation - matches the pricing in PricingModal.tsx
const VALID_PACKS = {
  'Starter': { credits: 10, price: 349 },   // $3.49
  'Basic': { credits: 30, price: 799 },     // $7.99
  'Popular': { credits: 75, price: 1699 },  // $16.99
  'Pro': { credits: 200, price: 3999 },     // $39.99
  'Ultimate': { credits: 500, price: 8499 }, // $84.99
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { packName, credits, amountCents } = req.body

  if (!packName || !credits || !amountCents) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Validate pack pricing
  const validPack = VALID_PACKS[packName as keyof typeof VALID_PACKS]
  if (!validPack) {
    return res.status(400).json({ error: 'Invalid pack name' })
  }

  if (validPack.credits !== credits || validPack.price !== amountCents) {
    return res.status(400).json({ error: 'Invalid pack configuration' })
  }

  // Get user from authorization header
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  try {
    // Verify the auth token with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid authentication token' })
    }

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
      success_url: `${req.headers.origin || 'http://localhost:3000'}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:3000'}`,
      metadata: {
        packName,
        credits: credits.toString(),
        userId: user.id, // Store user ID instead of auth token
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
