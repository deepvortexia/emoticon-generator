import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export const config = {
  api: {
    bodyParser: false,
  },
}

async function buffer(readable: any) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req)
  const sig = req.headers['stripe-signature']

  if (!sig) {
    return res.status(400).json({ error: 'Missing stripe-signature header' })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('Stripe webhook secret not configured')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const { packName, credits, authHeader } = session.metadata || {}

      if (!credits || !authHeader) {
        throw new Error('Missing metadata in session')
      }

      // Extract user ID from auth header (format: Bearer <token>)
      // In production, you would verify this token with Supabase
      const parts = authHeader.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid auth token format')
      }

      // Decode the JWT payload to get user ID
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
      const userId = payload.sub

      if (!userId) {
        throw new Error('No user ID in token')
      }

      // Add credits to user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          credits: supabase.raw(`credits + ${parseInt(credits)}`),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)

      if (updateError) {
        throw updateError
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
          pack_name: packName || 'Unknown',
          amount_cents: session.amount_total || 0,
          credits_purchased: parseInt(credits),
          status: 'completed',
        })

      if (transactionError) {
        throw transactionError
      }

      console.log(`Successfully added ${credits} credits to user ${userId}`)
    } catch (error: any) {
      console.error('Error processing webhook:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(200).json({ received: true })
}
