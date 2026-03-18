import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import time

from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import requests
from bs4 import BeautifulSoup
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)

# Configure Database
database_url = os.environ.get('DATABASE_URL', 'sqlite:///local.db')
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    scraper_api_key = db.Column(db.String(255), nullable=False)
    telegram_chat_id = db.Column(db.String(255), nullable=True)
    email = db.Column(db.String(255), nullable=False)

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(500), nullable=False)
    url = db.Column(db.Text, nullable=False)
    target_price = db.Column(db.Float, nullable=False)
    user = db.relationship('User', backref=db.backref('items', lazy=True))

class PriceHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    price = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    item = db.relationship('Item', backref=db.backref('history', lazy=True, cascade="all, delete-orphan"))

# Helper for Scraping
def fetch_amazon_price(url, scraper_api_key):
    payload = {
        'api_key': scraper_api_key,
        'url': url,
        'country_code': 'in' # specific to Amazon India as per prompt
    }
    try:
        r = requests.get('https://api.scraperapi.com/', params=payload, timeout=30)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            # Look for common Amazon price elements
            title_el = soup.select_one('#productTitle')
            title = title_el.text.strip() if title_el else "Unknown Product"

            # Find price
            price_el = soup.select_one('.a-price-whole')
            if price_el:
                price_text = price_el.text.strip().replace(',', '').replace('₹', '')
                price = float(price_text)
                return title, price

            # Alternative price elements
            price_el = soup.select_one('#priceblock_ourprice, #priceblock_dealprice, .a-color-price')
            if price_el:
                price_text = price_el.text.strip().replace(',', '').replace('₹', '')
                try:
                    price = float(price_text)
                    return title, price
                except ValueError:
                    pass
    except Exception as e:
        print(f"Error scraping {url}: {e}")
    return None, None

# Alerts
def send_email_alert(user_email, item_title, item_url, current_price, target_price):
    smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER')
    smtp_password = os.environ.get('SMTP_PASSWORD')

    if not (smtp_user and smtp_password):
        print("SMTP credentials not configured. Skipping email.")
        return

    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = user_email
    msg['Subject'] = f"Price Drop Alert: {item_title}"

    body = f"Good news! The price of {item_title} has dropped to ₹{current_price}, which is below your target of ₹{target_price}.\n\nBuy it here: {item_url}"
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        print(f"Sent email alert to {user_email} for {item_title}")
    except Exception as e:
        print(f"Failed to send email: {e}")

def send_telegram_alert(chat_id, item_title, item_url, current_price, target_price):
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token or not chat_id:
        return

    message = f"🚨 *Price Drop Alert!*\n\n*{item_title}*\nhas dropped to ₹{current_price} (Target: ₹{target_price})\n\n[Buy Now]({item_url})"
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'Markdown'
    }
    try:
        requests.post(url, json=payload)
        print(f"Sent telegram alert to {chat_id} for {item_title}")
    except Exception as e:
        print(f"Failed to send telegram message: {e}")

# Scheduler Task
def update_prices():
    with app.app_context():
        items = Item.query.all()
        for item in items:
            user = item.user
            print(f"Checking price for item {item.id}: {item.title}")
            _, current_price = fetch_amazon_price(item.url, user.scraper_api_key)

            if current_price is not None:
                new_history = PriceHistory(item_id=item.id, price=current_price)
                db.session.add(new_history)
                db.session.commit()

                # Check for alerts
                if current_price <= item.target_price:
                    send_email_alert(user.email, item.title, item.url, current_price, item.target_price)
                    if user.telegram_chat_id:
                        send_telegram_alert(user.telegram_chat_id, item.title, item.url, current_price, item.target_price)

# Start Background Scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(func=update_prices, trigger="interval", hours=1)
scheduler.start()

# Helper for extracting user from request
def get_current_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    user_id = auth_header.split(' ')[1]
    return User.query.get(user_id)


# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    scraper_api_key = data.get('scraper_api_key')
    telegram_chat_id = data.get('telegram_chat_id')

    if not all([username, password, email, scraper_api_key]):
        return jsonify({'error': 'Missing required fields'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    user = User(
        username=username,
        password_hash=generate_password_hash(password),
        email=email,
        scraper_api_key=scraper_api_key,
        telegram_chat_id=telegram_chat_id
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({
        'message': 'User created successfully',
        'user_id': user.id,
        'scraper_api_key': user.scraper_api_key
    }), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify({
            'message': 'Login successful',
            'user_id': user.id,
            'scraper_api_key': user.scraper_api_key
        }), 200

    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/items', methods=['GET'])
def get_items():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    items = Item.query.filter_by(user_id=user.id).all()
    result = []
    for item in items:
        history = PriceHistory.query.filter_by(item_id=item.id).order_by(PriceHistory.timestamp.asc()).all()
        history_data = [{'price': h.price, 'timestamp': h.timestamp.isoformat()} for h in history]

        current_price = history_data[-1]['price'] if history_data else None

        result.append({
            'id': item.id,
            'title': item.title,
            'url': item.url,
            'target_price': item.target_price,
            'current_price': current_price,
            'history': history_data
        })

    return jsonify({'items': result}), 200

@app.route('/api/add', methods=['POST'])
def add_item():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    url = data.get('url')
    target_price = data.get('target_price')
    scraper_api_key = data.get('scraper_api_key') # User passes this from frontend as well

    if not url or not target_price or not scraper_api_key:
        return jsonify({'error': 'Missing fields'}), 400

    try:
        target_price = float(target_price)
    except ValueError:
        return jsonify({'error': 'Invalid target price'}), 400

    # Fetch initial data
    title, current_price = fetch_amazon_price(url, scraper_api_key)
    if not title or current_price is None:
        return jsonify({'error': 'Failed to fetch product details. Check URL or ScraperAPI key.'}), 400

    item = Item(user_id=user.id, title=title, url=url, target_price=target_price)
    db.session.add(item)
    db.session.commit()

    history = PriceHistory(item_id=item.id, price=current_price)
    db.session.add(history)
    db.session.commit()

    return jsonify({'message': 'Item added successfully', 'item_id': item.id, 'title': title, 'current_price': current_price}), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=7860)
