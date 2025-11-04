'use client';

import { useEffect, useState } from 'react';
import { supabase, Review, OverallSentiment } from '@/lib/supabase';

export default function Dashboard() {
  const [overallSentiment, setOverallSentiment] = useState<OverallSentiment | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overall sentiment
      const { data: sentimentData, error: sentimentError } = await supabase
        .from('overall_sentiment')
        .select('*')
        .single();

      if (sentimentError) throw sentimentError;

      // Fetch reviews sorted by review_date descending (latest first)
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('review_date', { ascending: false });

      if (reviewsError) throw reviewsError;

      setOverallSentiment(sentimentData);
      setReviews(reviewsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscription for new reviews
    const reviewsSubscription = supabase
      .channel('reviews-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    // Set up real-time subscription for overall sentiment changes
    const sentimentSubscription = supabase
      .channel('sentiment-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'overall_sentiment',
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      reviewsSubscription.unsubscribe();
      sentimentSubscription.unsubscribe();
    };
  }, []);

  const getSentimentColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSentimentBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 border-green-300';
    if (score >= 6) return 'bg-yellow-100 border-yellow-300';
    if (score >= 4) return 'bg-orange-100 border-orange-300';
    return 'bg-red-100 border-red-300';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-8 py-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            User Sentiment Dashboard
          </h1>
          <p className="text-gray-600 text-lg">Real-time customer feedback analysis</p>
        </div>

        {/* Overall Sentiment Section */}
        {overallSentiment && (
          <div
            className={`${getSentimentBgColor(
              overallSentiment.total_score
            )} border-2 rounded-2xl p-8 mb-8 shadow-lg`}
          >
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Overall Sentiment Score
              </h2>
              <div
                className={`text-8xl font-bold ${getSentimentColor(
                  overallSentiment.total_score
                )} mb-4`}
              >
                {overallSentiment.total_score.toFixed(1)}
                <span className="text-4xl text-gray-600">/10</span>
              </div>
              <p className="text-2xl text-gray-700 mb-4">
                {overallSentiment.description}
              </p>
              <div className="flex justify-center gap-8 text-gray-600">
                <div>
                  <span className="font-semibold">Total Reviews:</span>{' '}
                  {overallSentiment.total_reviews}
                </div>
                <div>
                  <span className="font-semibold">Last Updated:</span>{' '}
                  {formatDate(overallSentiment.last_updated)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Recent Reviews</h2>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl">No reviews yet</p>
              <p className="mt-2">Reviews will appear here as they are submitted</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{review.user_email}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.review_date)}
                      </p>
                    </div>
                    {review.sentiment_score !== null && (
                      <div
                        className={`text-2xl font-bold ${getSentimentColor(
                          review.sentiment_score
                        )}`}
                      >
                        {review.sentiment_score.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchData}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
