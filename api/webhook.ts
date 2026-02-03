import type { VercelRequest, VercelResponse } from '@vercel/node'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendPurchaseConfirmationEmail } from '../lib/emailService'

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

async function buffer(readable: NodeJS.ReadableStream) {
  const chunks: Buffer[] = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const buf = await buffer(req as any)
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
      const { packName, credits, userId } = session.metadata || {}

      if (!credits || !userId) {
        throw new Error('Missing metadata in session')
      }

      // Add credits to user profile
      // First, get current credits
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      const newCredits = (currentProfile?.credits || 0) + parseInt(credits)

      // Update with new total
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          credits: newCredits,
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

      // Send purchase confirmation email
      try {
        // Get user email from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', userId)
          .single()

        if (profileError) {
          console.error('Failed to fetch user profile for email:', profileError)
        } else if (profile?.email) {
          const emailSent = await sendPurchaseConfirmationEmail({
            to: profile.email,
            userName: profile.full_name || 'there',
            packName: packName || 'Credit',
            creditsPurchased: parseInt(credits),
            newCreditBalance: newCredits,
            amountPaid: `$${((session.amount_total || 0) / 100).toFixed(2)}`,
          })

          if (emailSent) {
            console.log(`Purchase confirmation email sent to ${profile.email}`)
          } else {
            console.error(`Failed to send email to ${profile.email}`)
          }
        }
      } catch (emailError) {
        // Don't fail the webhook if email fails
        console.error('Error sending purchase confirmation email:', emailError)
      }
    } catch (error: any) {
      console.error('Error processing webhook:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(200).json({ received: true })
}
