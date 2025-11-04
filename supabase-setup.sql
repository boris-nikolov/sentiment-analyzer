-- Sentiment Analyzer Database Setup
-- Run this script in your Supabase SQL Editor

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_date TIMESTAMP NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    review_text TEXT NOT NULL,
    sentiment_score DECIMAL(3,1),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create overall_sentiment table
CREATE TABLE IF NOT EXISTS overall_sentiment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_score DECIMAL(4,2) NOT NULL,
    description TEXT NOT NULL,
    total_reviews INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Initialize overall_sentiment table with default values
INSERT INTO overall_sentiment (total_score, description, total_reviews)
VALUES (0, 'No reviews yet', 0);

-- Create index on review_date for faster sorting
CREATE INDEX IF NOT EXISTS idx_reviews_review_date ON reviews(review_date DESC);

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE overall_sentiment ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access (for the dashboard)
CREATE POLICY "Allow public read access on reviews"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on overall_sentiment"
    ON overall_sentiment FOR SELECT
    USING (true);

-- Note: Write access should be controlled by your n8n workflow using service_role key
-- The anon key will only have read access for security

-- Verify tables were created
SELECT 'reviews table created' AS status, COUNT(*) AS row_count FROM reviews
UNION ALL
SELECT 'overall_sentiment table created' AS status, COUNT(*) AS row_count FROM overall_sentiment;

