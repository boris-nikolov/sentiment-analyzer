import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    const { review_date, user_email, review_text } = body;

    // Validate required fields
    if (!review_date || !user_email || !review_text) {
      return NextResponse.json(
        { error: 'Missing required fields: review_date, user_email, review_text' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate review_date format (ISO 8601 with timezone offset)
    // Accepts formats like: 2025-11-04T19:28:49.742+02:00 or 2024-01-15T10:30:00Z
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;
    if (!dateRegex.test(review_date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use ISO 8601 format (e.g., 2025-11-04T19:28:49.742+02:00)' },
        { status: 400 }
      );
    }

    // Validate that the date is actually parseable
    const parsedDate = new Date(review_date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date value. Date could not be parsed.' },
        { status: 400 }
      );
    }

    // Preprocess the review text (trim whitespace, basic sanitization)
    const preprocessedReviewText = review_text.trim();

    if (preprocessedReviewText.length === 0) {
      return NextResponse.json(
        { error: 'Review text cannot be empty' },
        { status: 400 }
      );
    }

    // Prepare data for n8n webhook
    const webhookData = {
      review_date,
      user_email,
      review_text: preprocessedReviewText,
    };

    // Send to n8n webhook
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'N8N webhook URL not configured' },
        { status: 500 }
      );
    }

    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });

    if (!webhookResponse.ok) {
      throw new Error(`N8N webhook failed with status ${webhookResponse.status}`);
    }

    const webhookResult = await webhookResponse.json();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Review submitted successfully',
        data: webhookResult,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing review:', error);
    return NextResponse.json(
      {
        error: 'Failed to process review',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

