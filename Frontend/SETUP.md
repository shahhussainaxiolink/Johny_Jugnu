# Johnny & Jugnu Full Stack Setup Guide

This guide will help you set up both the frontend and backend for the Johnny & Jugnu restaurant website.

## 🏗️ Project Structure

```
johnny-jugnu/
├── backend/          # Node.js/Express API
├── src/             # React frontend
├── public/          # Static assets
├── package.json     # Frontend dependencies
└── README.md        # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 2: Set Up Environment Variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/johnny-jugnu
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
The `.env` file is already created in the root directory.

### Step 3: Start MongoDB

**Option A: Local MongoDB**
```bash
# On Windows (PowerShell as Administrator)
mongod
```

**Option B: MongoDB Atlas (Cloud)**
- Create account at mongodb.com
- Create cluster and get connection string
- Update MONGODB_URI in backend/.env

### Step 4: Seed Database

```bash
cd backend
npm run seed
```

### Step 5: Start Both Servers

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

**Terminal 2: Frontend**
```bash
npm run dev
```
Frontend will run on: http://localhost:5173

## 🔧 Configuration

### Email Setup (Gmail)
1. Enable 2-factor authentication on Gmail
2. Generate App Password: https://support.google.com/accounts/answer/185833
3. Use App Password in EMAIL_PASS (not your regular password)

### MongoDB Atlas Setup
1. Create account at mongodb.com
2. Create new cluster
3. Get connection string
4. Update MONGODB_URI in backend/.env

## 📱 Features Overview

### Frontend Features
- ✅ Responsive menu display
- ✅ Shopping cart functionality
- ✅ Search and filter
- ✅ Contact form
- ✅ Order placement
- ✅ Real-time data from API

### Backend Features
- ✅ RESTful API endpoints
- ✅ Order management
- ✅ Contact form handling
- ✅ Email notifications
- ✅ MongoDB integration
- ✅ Input validation

## 🧪 Testing the Application

1. **Menu Loading**: Check if menu items load from database
2. **Search/Filter**: Test search and category filtering
3. **Cart Functionality**: Add items, check total calculation
4. **Order Placement**: Fill order form and submit
5. **Contact Form**: Send a test message
6. **Email Notifications**: Check if emails are sent (check console for now)

## 🚀 Production Deployment

### Backend Deployment
```bash
cd backend
npm run build  # If you add build script
npm start
```

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
EMAIL_USER=production-email@gmail.com

# Frontend
VITE_API_URL=https://your-backend-domain.com/api
```

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running locally or check Atlas connection string
- Verify network access if using Atlas

**Email Not Sending**
- Check Gmail App Password is correct
- Verify less secure app access is enabled

**CORS Errors**
- Check FRONTEND_URL in backend/.env matches your frontend URL

**API Calls Failing**
- Ensure backend is running on port 5000
- Check VITE_API_URL in frontend/.env

### Debug Commands

```bash
# Check backend health
curl http://localhost:5000/api/health

# Check MongoDB connection
cd backend && npm run seed

# View backend logs
cd backend && npm run dev
```

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure MongoDB is running
4. Check network connectivity for external services

## 🎯 Next Steps

After setup, you can:
- Add user authentication
- Integrate payment processing (Stripe)
- Add order tracking
- Implement admin dashboard
- Add real-time order updates
- Deploy to production hosting

Happy coding! 🍔