import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description, listingId, buyerId } = body;

    // Validate required fields
    if (!amount || !description || !listingId || !buyerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // PayMongo API endpoint for creating payment links
    const paymongoUrl = 'https://api.paymongo.com/v1/links';
    const paymongoSecretKey = process.env.PAYMONGO_SECRET_KEY;

    if (!paymongoSecretKey) {
      return NextResponse.json(
        { error: 'PayMongo secret key not configured' },
        { status: 500 }
      );
    }

    const paymentData = {
      data: {
        attributes: {
          amount: amount * 100, // PayMongo uses cents
          description,
          remarks: `Listing: ${listingId}, Buyer: ${buyerId}`,
        },
      },
    };

    const response = await fetch(paymongoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(paymongoSecretKey + ':').toString('base64')}`,
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.errors?.[0]?.detail || 'Failed to create payment' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
