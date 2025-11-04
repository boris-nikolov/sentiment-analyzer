import { NextResponse } from 'next/server';

// This endpoint will be called by n8n after processing a review
// It triggers a revalidation of the dashboard data
export async function POST() {
  try {
    // In Next.js App Router, we can use revalidatePath or revalidateTag
    // For now, we'll just return success and let the client handle the refresh
    return NextResponse.json(
      {
        success: true,
        message: 'Refresh signal received',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing refresh:', error);
    return NextResponse.json(
      {
        error: 'Failed to process refresh',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

