import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('paymongo-signature');

    // Verify webhook signature
    const paymongoWebhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (!paymongoWebhookSecret) {
      console.error('PayMongo webhook secret not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Extract timestamp and signature from header
    const [timestamp, receivedSignature] = signature?.split(',') || [];
    
    // Construct the expected signature
    const payload = `${timestamp}.${JSON.stringify(body)}`;
    const expectedSignature = crypto
      .createHmac('sha256', paymongoWebhookSecret)
      .update(payload)
      .digest('hex');

    if (receivedSignature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data: { type, attributes } } = body;

    // Handle different webhook events
    if (type === 'payment.paid') {
      const { data, reference } = attributes;
      const paymentId = data.id;
      const amount = data.attributes.amount / 100; // Convert from cents
      const remarks = data.attributes.remarks;

      // Extract listingId and buyerId from remarks
      const listingMatch = remarks?.match(/Listing:\s*(\w+)/);
      const buyerMatch = remarks?.match(/Buyer:\s*(\w+)/);
      const listingId = listingMatch?.[1];
      const buyerId = buyerMatch?.[1];

      if (listingId && buyerId) {
        // Create payment record
        await supabase.from('payments').insert({
          id: paymentId,
          listing_id: listingId,
          buyer_id: buyerId,
          amount,
          status: 'paid',
          payment_method: 'paymongo',
          reference: reference,
          created_at: new Date().toISOString(),
        });

        // Update listing status to sold
        await supabase.from('listings').update({ status: 'sold' }).eq('id', listingId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
