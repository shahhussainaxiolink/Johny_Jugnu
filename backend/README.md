# Johnny & Jugnu Backend API

Node.js/Express backend API for the Johnny & Jugnu restaurant website.

## 🚀 Features

- **Menu Management**: CRUD operations for menu items and deals
- **Order Processing**: Complete order lifecycle management
- **Contact Form**: Handle customer inquiries
- **Email Notifications**: Automated emails for orders and contacts
- **MongoDB Integration**: NoSQL database for flexible data storage
- **Security**: Rate limiting, CORS, input validation
- **RESTful API**: Clean, documented endpoints

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Gmail account (for email notifications)

## 🚀 Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/johnny-jugnu
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   npm run dev  # Development mode with nodemon
   # or
   npm start    # Production mode
   ```

The API will be available at `http://localhost:5000`

## 📚 API Endpoints

### Menu Endpoints
- `GET /api/menu` - Get all menu items and deals
- `GET /api/menu/categories` - Get menu categories
- `GET /api/menu/popular` - Get popular items
- `GET /api/menu/:id` - Get specific menu item

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders/:orderNumber` - Get order status
- `PUT /api/orders/:orderNumber/status` - Update order status

### Contact Endpoints
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contact messages (admin)
- `PUT /api/contact/:id/reply` - Reply to contact message
- `PUT /api/contact/:id/status` - Update contact status

### Health Check
- `GET /api/health` - API health status

## 📧 Email Configuration

The API sends automated emails for:
- Order confirmations to customers
- Order notifications to restaurant
- Contact form responses

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate an App Password
3. Use App Password in `.env` (not your regular password)

## 🗄️ Database Schema

### Menu Items
```javascript
{
  id: Number,
  name: String,
  category: String,
  price: Number,
  rating: Number,
  img: String,
  description: String,
  available: Boolean,
  isPopular: Boolean
}
```

### Orders
```javascript
{
  orderNumber: String,
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  items: Array,
  total: Number,
  orderType: String,
  paymentMethod: String,
  orderStatus: String
}
```

### Contact Messages
```javascript
{
  name: String,
  email: String,
  message: String,
  subject: String,
  status: String,
  replyMessage: String
}
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server with auto-reload
- `npm run seed` - Populate database with sample data
- `npm start` - Start production server

### Project Structure
```
backend/
├── models/          # MongoDB schemas
├── routes/          # API route handlers
├── server.js        # Main server file
├── seed.js          # Database seeding script
├── .env.example     # Environment variables template
└── package.json     # Dependencies and scripts
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/johnny-jugnu
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
FRONTEND_URL=https://your-domain.com
```

### Recommended Hosting
- **Server**: Heroku, DigitalOcean, AWS EC2
- **Database**: MongoDB Atlas, AWS DocumentDB
- **Email**: SendGrid, Mailgun (for production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

© 2024 Johnny & Jugnu. All rights reserved.