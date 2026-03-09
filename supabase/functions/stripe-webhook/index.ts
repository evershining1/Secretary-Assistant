import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    // This is required by Stripe
    apiVersion: '2022-11-15',
    // Use the fetch API which is standard in Deno
    httpClient: Stripe.createFetchHttpClient(),
})

// Initialize Supabase client
const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_DB_URL') ?? Deno.env.get('MY_SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return new Response('No signature provided', { status: 400 })
    }

    try {
        const body = await req.text()

        // Verify the webhook signature to prove it came from Stripe
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
        let event
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        } catch (err) {
            console.error(`⚠️  Webhook signature verification failed: ${err.message}`)
            return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }

        // Handle the checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object

            // We stored the Supabase user ID here when we built the link!
            const userId = session.client_reference_id

            if (!userId) {
                throw new Error("No client_reference_id found in session.")
            }

            console.log(`Payment successful for user ${userId}. Upgrading to premium...`)

            // Update the user's tier in the database
            const { error } = await supabaseAdmin
                .from('user_profiles')
                .update({ tier: 'premium' })
                .eq('id', userId)

            if (error) {
                throw error
            }

            console.log(`Successfully upgraded user ${userId} to premium!`)
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        })

    } catch (err) {
        console.error(`Server error: ${err.message}`)
        return new Response(err.message, { status: 400 })
    }
})
