import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create client with user's token
    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    // Verify the user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, paymentId, signature } = body

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify signature
    const text = `${orderId}|${paymentId}`
    const secret = process.env.RAZORPAY_KEY_SECRET || ''
    
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex')

    if (generatedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Get order details from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('razorpay_order_id', orderId)

    if (updateError) {
      console.error('Failed to update order:', updateError)
    }

    // Calculate subscription dates
    const now = new Date()
    const endsAt = new Date(now)
    endsAt.setMonth(endsAt.getMonth() + 1) // 1 month subscription

    // Create or update subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    let subscriptionResult

    if (existingSubscription) {
      // Update existing subscription
      subscriptionResult = await supabase
        .from('subscriptions')
        .update({
          plan_type: order.plan_type,
          razorpay_payment_id: paymentId,
          status: 'active',
          starts_at: now.toISOString(),
          ends_at: endsAt.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()
    } else {
      // Create new subscription
      subscriptionResult = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: order.plan_type,
          razorpay_payment_id: paymentId,
          status: 'active',
          starts_at: now.toISOString(),
          ends_at: endsAt.toISOString()
        })
        .select()
        .single()
    }

    if (subscriptionResult.error) {
      console.error('Subscription error:', subscriptionResult.error)
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscriptionResult.data.id,
      message: 'Payment verified successfully'
    })
  } catch (error: any) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}


