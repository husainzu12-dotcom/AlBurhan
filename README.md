# Al-Burhan Industrial Drives - Web Application

A modern e-commerce web application for Al-Burhan Industrial Drives built with Node.js, Express, EJS, and Supabase.

## Features

- 🛒 Shopping cart functionality
- 👤 Admin login system
- 📊 Order management dashboard
- 💳 Product catalog with pricing
- 📱 Responsive design
- 🔒 Secure authentication

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Frontend**: EJS templates, CSS
- **Authentication**: bcrypt, express-session
- **Version Control**: Git, GitHub

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/husainzu12-dotcom/AlBurhan.git
cd AlBurhan
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and API keys
3. Create the following tables in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user'
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  specs TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'ordered',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);
```

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3000
NODE_ENV=development
```

### 5. Run the Application

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Admin Access

- **Username**: owner
- **Password**: admin123

## Project Structure

```
├── views/              # EJS templates
├── css/               # Stylesheets
├── js/                # JavaScript files
├── server.js          # Main application file
├── package.json       # Dependencies
├── .env              # Environment variables
└── README.md         # This file
```

## Features Overview

### Customer Features
- Browse product catalog
- Add products to shopping cart
- View cart contents
- Checkout (creates order)

### Admin Features
- Secure login
- View all orders
- Update order status
- View detailed order information
- Manage inventory (via database)

## Deployment

This application can be deployed to platforms like:
- Heroku
- Vercel
- Railway
- DigitalOcean App Platform

Make sure to set the environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary to Al-Burhan Industrial Drives.