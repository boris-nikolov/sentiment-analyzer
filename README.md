# User Sentiment Analyzer

A Next.js application for real-time sentiment analysis and visualization of user feedback. This dashboard is designed to be displayed on a TV in the marketing team's office to track overall user sentiment in real-time.

## 🎯 Features

- **Real-time Dashboard**: Displays overall sentiment score and recent reviews
- **API Endpoint**: Receives new reviews via POST requests
- **Supabase Integration**: Stores reviews and sentiment data
- **n8n Webhook Integration**: Processes reviews through n8n for sentiment analysis
- **Auto-refresh**: Dashboard automatically updates when new reviews are added
- **Beautiful UI**: Gradient design with color-coded sentiment indicators

## 🏗️ Architecture

1. **Review Submission** → API endpoint receives review data
2. **Preprocessing** → Basic validation and sanitization
3. **n8n Processing** → Review sent to n8n webhook for sentiment analysis
4. **Database Storage** → n8n stores review and updates overall sentiment in Supabase
5. **Dashboard Update** → Real-time subscription triggers dashboard refresh

## 📊 Database Schema

### `reviews` Table
- `id` (UUID, Primary Key)
- `review_date` (TIMESTAMP)
- `user_email` (VARCHAR)
- `review_text` (TEXT)
- `sentiment_score` (DECIMAL) - Score from 1 to 10
- `created_at` (TIMESTAMP)

### `overall_sentiment` Table
- `id` (UUID, Primary Key)
- `total_score` (DECIMAL) - Average sentiment score
- `description` (TEXT) - Description of current sentiment
- `total_reviews` (INTEGER)
- `last_updated` (TIMESTAMP)

## 🚀 API Endpoint

### Submit a Review

**Endpoint:** `POST /api/reviews`

**Request Body:**
```json
{
  "review_date": "2024-11-04T14:30:00Z",
  "user_email": "user@example.com",
  "review_text": "This product is amazing! I love how easy it is to use."
}
```

**Example cURL Request:**
```bash
curl -X POST https://your-domain.vercel.app/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "review_date": "2024-11-04T14:30:00Z",
    "user_email": "user@example.com",
    "review_text": "This product is amazing! I love how easy it is to use."
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "error": "Missing required fields: review_date, user_email, review_text"
}
```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
N8N_WEBHOOK_URL=your_n8n_webhook_url
```

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/boris-nikolov/sentiment-analyzer.git
cd sentiment-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Sentiment Score Colors

- **8.0 - 10.0**: Green (Excellent)
- **6.0 - 7.9**: Yellow (Good)
- **4.0 - 5.9**: Orange (Fair)
- **1.0 - 3.9**: Red (Poor)

## 🔄 n8n Workflow Integration

The n8n workflow should:
1. Receive the review data from the webhook
2. Perform sentiment analysis (using AI/ML service)
3. Insert the review into Supabase `reviews` table with the sentiment score
4. Recalculate and update the `overall_sentiment` table
5. Return success response

**Note:** The n8n webhook URL is currently set to a placeholder. Update the `N8N_WEBHOOK_URL` environment variable when the workflow is ready.

## 🚢 Deployment

This application is designed to be deployed on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## 📝 Supabase Setup

The Supabase project has been created with:
- **Project ID**: jqfqljxkicxmjjuioklr
- **Region**: eu-west-1
- **Database**: PostgreSQL with two tables (reviews, overall_sentiment)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Automation**: n8n
- **Deployment**: Vercel

## 📄 License

MIT

## 👥 Author

Boris Nikolov
