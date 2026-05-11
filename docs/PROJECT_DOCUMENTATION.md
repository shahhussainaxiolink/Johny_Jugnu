# Johnny & Jugnu Project Documentation

Version: 1.0  
Prepared for: Johnny & Jugnu Restaurant Website  
Stack: React, Vite, Express, MongoDB Atlas, Railway, Vercel

## 1. Project Overview

Johnny & Jugnu is a restaurant ordering website with a public storefront, cart/order flow, contact form, and a hidden admin order dashboard.

The project is split into two main applications:

- `Frontend/`: React and Vite single-page application deployed on Vercel.
- `backend/`: Express.js REST API deployed on Railway.

The frontend communicates with the backend through the public Railway API URL. The backend stores menu items, deals, orders, and contact messages in MongoDB Atlas.

## 2. Repository Structure

```text
Johny_Jugnu/
  Frontend/
    src/
      App.jsx
      App.css
      index.css
      main.jsx
      services/
        api.js
      assets/
        hero.png
    public/
    package.json
    vite.config.js
    vercel.json

  backend/
    models/
      Contact.js
      Menu.js
      Order.js
    routes/
      admin.js
      contact.js
      menu.js
      orders.js
    services/
      orderEmail.js
    package.json
    server.js
    seed.js
    .env.example

  railway.json
  package.json
  docs/
    PROJECT_DOCUMENTATION.md
    PROJECT_DOCUMENTATION.pdf
```

## 3. Frontend Application

The frontend is a React single-page application built with Vite.

Main file:

```text
Frontend/src/App.jsx
```

Important responsibilities:

- Displays the restaurant landing page.
- Fetches menu items and categories from the backend.
- Lets customers add items to cart.
- Lets customers place orders.
- Sends contact form messages.
- Opens the admin screen when the logo is clicked five times.

### Frontend API Configuration

The frontend API client is in:

```text
Frontend/src/services/api.js
```

It uses this environment variable:

```env
VITE_API_URL=https://johnyjugnu-production.up.railway.app/api
```

This value must be configured in Vercel under:

```text
Project Settings -> Environment Variables
```

### Frontend Deployment

The frontend is deployed on Vercel.

Current live frontend URL:

```text
https://johny-jugnu.vercel.app
```

Vercel build settings:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Root Directory: Frontend
```

### Vercel Route Rewrite

Because this is a React single-page application, direct visits to paths such as `/admin` must be rewritten to `index.html`.

This is handled by:

```text
Frontend/vercel.json
```

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Without this file, Vercel may show:

```text
404: NOT_FOUND
```

when opening:

```text
https://johny-jugnu.vercel.app/admin
```

## 4. Backend Application

The backend is an Express.js API using MongoDB through Mongoose.

Main file:

```text
backend/server.js
```

The backend handles:

- Menu item reads.
- Deal reads.
- Order creation.
- Order status lookup.
- Admin active order dashboard data.
- Contact form submissions.
- Optional email notifications.

### Backend Deployment

The backend is deployed on Railway.

Current backend URL:

```text
https://johnyjugnu-production.up.railway.app
```

API base URL:

```text
https://johnyjugnu-production.up.railway.app/api
```

Health check:

```text
https://johnyjugnu-production.up.railway.app/api/health
```

### Railway Configuration

The root file:

```text
railway.json
```

contains:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100
  }
}
```

The backend does not need a separate build step because it runs directly with Node.js.

## 5. Environment Variables

Secrets must not be committed to Git.

Use:

```text
backend/.env.example
```

as the template for required variables.

### Backend Variables on Railway

Required:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/johnny-jugnu?retryWrites=true&w=majority&appName=Cluster0
FRONTEND_URL=https://johny-jugnu.vercel.app
ADMIN_PIN=your-admin-pin
```

Optional email variables:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
RESTAURANT_EMAIL=restaurant-email@example.com
```

### Frontend Variables on Vercel

Required:

```env
VITE_API_URL=https://johnyjugnu-production.up.railway.app/api
```

## 6. CORS Setup

CORS is configured in:

```text
backend/server.js
```

Allowed origins include:

```text
https://johny-jugnu.vercel.app
http://localhost:5173
```

The backend also reads:

```env
FRONTEND_URL
```

from Railway variables.

Important rules:

- `FRONTEND_URL` should not include `/api`.
- `FRONTEND_URL` should not include a trailing slash.
- Correct value:

```env
FRONTEND_URL=https://johny-jugnu.vercel.app
```

The backend also normalizes a trailing slash if one is accidentally added.

## 7. Railway Proxy and Rate Limiting

Railway runs the app behind a proxy and sends `X-Forwarded-For`.

Express must trust that proxy so `express-rate-limit` can identify client IPs correctly.

This is configured in:

```text
backend/server.js
```

```js
app.set('trust proxy', 1);
```

Without this setting, Railway logs may show:

```text
ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
```

## 8. MongoDB Atlas Setup

The backend connects to MongoDB Atlas using:

```env
MONGODB_URI
```

MongoDB Atlas must allow Railway to connect.

In MongoDB Atlas:

```text
Network Access -> Add IP Address
```

Allow access from anywhere:

```text
0.0.0.0/0
```

Status must be:

```text
Active
```

If this is not active, Railway may log:

```text
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster
```

Also confirm the database user exists in:

```text
Database Access
```

and that the password in Railway matches the Atlas password.

## 9. Backend API Endpoints

All backend routes are prefixed with:

```text
/api
```

### Health

```http
GET /api/health
```

Returns a simple status response confirming the API is running.

### Menu

```http
GET /api/menu
```

Returns available menu items and deals.

```http
GET /api/menu/categories
```

Returns all available menu categories.

```http
GET /api/menu/popular
```

Returns popular menu items.

```http
GET /api/menu/:id
```

Returns a single menu item by numeric item ID.

### Orders

```http
POST /api/orders
```

Creates a new customer order.

Expected body:

```json
{
  "customerInfo": {
    "name": "Customer Name",
    "email": "customer@example.com",
    "phone": "03000000000",
    "address": "Delivery address"
  },
  "items": [
    {
      "menuItemId": 1,
      "name": "Burger",
      "price": 500,
      "quantity": 1
    }
  ],
  "orderType": "delivery",
  "paymentMethod": "cash",
  "specialInstructions": "Optional notes"
}
```

```http
GET /api/orders/:orderNumber
```

Returns order status details for a customer order.

```http
PUT /api/orders/:orderNumber/status
```

Updates order status.

### Admin

Admin requests require this request header:

```http
x-admin-pin: your-admin-pin
```

```http
GET /api/admin/orders/active
```

Returns active orders with statuses:

```text
pending, confirmed, preparing, ready
```

```http
GET /api/admin/orders
```

Returns all orders.

```http
GET /api/admin/orders/stats
```

Returns total order counts and revenue statistics.

```http
PUT /api/admin/orders/:orderNumber/status
```

Updates an order status from the admin dashboard.

### Contact

```http
POST /api/contact
```

Creates a contact message.

Expected body:

```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "message": "Message text",
  "subject": "General Inquiry"
}
```

```http
GET /api/contact
```

Returns contact messages.

```http
PUT /api/contact/:id/reply
```

Stores a reply and optionally sends a reply email.

```http
PUT /api/contact/:id/status
```

Updates contact message status.

## 10. Database Models

### MenuItem

Stored in:

```text
backend/models/Menu.js
```

Fields:

- `id`: numeric menu item ID.
- `name`: item name.
- `category`: one of `Burgers`, `Fries`, `Wraps`, `Drinks`, `Deals`.
- `price`: item price.
- `rating`: number between 0 and 5.
- `img`: image URL.
- `description`: optional description.
- `available`: whether item is visible.
- `isPopular`: whether item appears in popular listings.

### Deal

Stored in:

```text
backend/models/Menu.js
```

Fields:

- `id`: numeric deal ID.
- `name`: deal name.
- `desc`: deal description.
- `oldPrice`: previous price.
- `newPrice`: discounted price.
- `img`: image URL.
- `available`: whether deal is visible.
- `expiresAt`: optional expiry date.

### Order

Stored in:

```text
backend/models/Order.js
```

Fields:

- `orderNumber`: generated order number such as `JJ123456789`.
- `customerInfo`: name, email, phone, and optional address.
- `items`: ordered menu items.
- `subtotal`: item total before tax and delivery.
- `tax`: calculated as 10 percent of subtotal.
- `deliveryFee`: Rs. 150 for delivery orders.
- `total`: final order total.
- `orderType`: `delivery` or `pickup`.
- `paymentMethod`: `cash`, `card`, or `online`.
- `paymentStatus`: `pending`, `paid`, or `failed`.
- `orderStatus`: `pending`, `confirmed`, `preparing`, `ready`, `delivered`, or `cancelled`.
- `estimatedTime`: estimated preparation time in minutes.
- `specialInstructions`: optional order notes.

### Contact

Stored in:

```text
backend/models/Contact.js
```

Fields:

- `name`: customer name.
- `email`: customer email.
- `message`: message body.
- `subject`: message subject.
- `status`: `new`, `read`, `replied`, or `closed`.
- `replyMessage`: optional staff reply.
- `repliedAt`: reply timestamp.

## 11. Admin Dashboard

The admin screen is built into the React app.

Access method:

1. Open the public frontend.
2. Click the Johnny & Jugnu logo five times.
3. The app navigates to:

```text
/admin
```

4. Enter the admin PIN.

The admin PIN is checked by the backend through:

```http
x-admin-pin
```

The PIN value comes from:

```env
ADMIN_PIN
```

on Railway.

## 12. Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

Default local backend URL:

```text
http://localhost:5001
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Default local frontend URL:

```text
http://localhost:5173
```

For local frontend development, set:

```env
VITE_API_URL=http://localhost:5001/api
```

## 13. Deployment Checklist

### Backend on Railway

1. Push backend changes to GitHub.
2. Confirm Railway service root is correct.
3. Confirm variables:

```env
MONGODB_URI=...
FRONTEND_URL=https://johny-jugnu.vercel.app
ADMIN_PIN=...
NODE_ENV=production
```

4. Redeploy Railway.
5. Test:

```text
https://johnyjugnu-production.up.railway.app/api/health
```

### Frontend on Vercel

1. Push frontend changes to GitHub.
2. Confirm Vercel root directory is:

```text
Frontend
```

3. Confirm variable:

```env
VITE_API_URL=https://johnyjugnu-production.up.railway.app/api
```

4. Redeploy Vercel.
5. Test:

```text
https://johny-jugnu.vercel.app
```

6. Click logo five times and test:

```text
https://johny-jugnu.vercel.app/admin
```

## 14. Common Errors and Fixes

### Vercel 404 on `/admin`

Cause:

Vercel does not know `/admin` is handled by React.

Fix:

Add `Frontend/vercel.json` with a rewrite to `/index.html`.

### CORS Error

Example:

```text
No 'Access-Control-Allow-Origin' header is present
```

Fix:

Set Railway variable:

```env
FRONTEND_URL=https://johny-jugnu.vercel.app
```

Then redeploy Railway.

### MongoDB Atlas Connection Error

Example:

```text
Could not connect to any servers in your MongoDB Atlas cluster
```

Fix:

- Add `0.0.0.0/0` in Atlas Network Access.
- Confirm it is Active.
- Confirm Railway `MONGODB_URI` is correct.
- Confirm Atlas database user password is correct.
- Redeploy Railway.

### Railway Rate Limit Proxy Error

Example:

```text
ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
```

Fix:

Use:

```js
app.set('trust proxy', 1);
```

before the rate limiter middleware.

### Railway Build Command Error

Cause:

Railway ran a build command from the backend folder, but the script did not exist in `backend/package.json`.

Fix:

Remove the custom `buildCommand` from `railway.json`. The backend runs directly using:

```bash
npm start
```

## 15. Security Notes

- Do not commit `.env` files.
- Rotate any exposed database passwords.
- Use a strong `ADMIN_PIN`.
- Do not use a personal Gmail password for email. Use a Gmail App Password.
- Keep `MONGODB_URI`, `EMAIL_PASS`, and `ADMIN_PIN` only in hosting environment variables.
- The current admin system is PIN-based. For a production restaurant dashboard, a full login system would be stronger.

## 16. Maintenance Notes

To add menu items:

1. Update seed data in `backend/seed.js`, or add records directly in MongoDB Atlas.
2. Confirm `available` is `true`.
3. Redeploy or refresh the frontend.

To change backend URL:

1. Update Vercel `VITE_API_URL`.
2. Redeploy frontend.

To change frontend URL:

1. Update Railway `FRONTEND_URL`.
2. Redeploy backend.

## 17. Important URLs

Frontend:

```text
https://johny-jugnu.vercel.app
```

Backend:

```text
https://johnyjugnu-production.up.railway.app
```

API base:

```text
https://johnyjugnu-production.up.railway.app/api
```

Health check:

```text
https://johnyjugnu-production.up.railway.app/api/health
```

Admin page:

```text
https://johny-jugnu.vercel.app/admin
```

