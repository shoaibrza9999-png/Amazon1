# Amazon India Price Tracker

A multi-user Amazon price tracker web application designed to be deployed on a free Hugging Face Docker Space.

## Features
- Track Amazon India product prices in the background.
- Set target price thresholds.
- View price history graphs.
- Receive alerts via Email and Telegram when the price drops below your target.

## Tech Stack
- **Backend:** Python 3, Flask, Flask-SQLAlchemy, APScheduler
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Database:** PostgreSQL (Designed for Neon.tech)
- **Scraping:** ScraperAPI using `requests` and `BeautifulSoup`
- **Visualization:** Chart.js

## Local Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the application:
   ```bash
   python app.py
   ```
   The app uses SQLite by default if `DATABASE_URL` is not provided.

## Deploying to Hugging Face Docker Space

1. Create a new Space on Hugging Face.
2. Select **Docker** as the Space SDK and choose the Blank template.
3. Upload all files from this directory to your Space repository.
4. Go to the **Settings** tab of your Space and add the following **Variables and secrets**:

   - `DATABASE_URL`: Your PostgreSQL connection string (e.g., from Neon.tech). Format: `postgresql://user:password@host/dbname`
   - `SMTP_SERVER`: The SMTP server for sending emails (e.g., `smtp.gmail.com`).
   - `SMTP_PORT`: The SMTP port (usually `587`).
   - `SMTP_USER`: The email address used to send alerts.
   - `SMTP_PASSWORD`: The app password or password for the SMTP user.
   - `TELEGRAM_BOT_TOKEN`: Your Telegram Bot token obtained from BotFather.

5. The Dockerfile is pre-configured to install dependencies and expose port `7860`. The Flask app will run on `host='0.0.0.0'` and `port=7860`, which is required by Hugging Face Spaces.

## Usage

1. **Register**: Sign up with a username, password, email, and your ScraperAPI key. Optionally, provide a Telegram Chat ID.
2. **Add Item**: Paste an Amazon India product URL and set your target price.
3. **Dashboard**: View your tracked items, current prices, and click "View Graph" to see price history.
4. **Alerts**: The background scheduler runs every hour, checks prices, and sends alerts if the price drops below your target.
