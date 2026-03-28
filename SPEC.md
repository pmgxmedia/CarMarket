# CarMarket - Specification Document

## Overview
A two-sided marketplace (similar to Cars24) connecting car sellers with buyers through a structured bidding and inspection process.

---

## 1. User Roles & Registration

### 1.1 Seller Registration
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | String | Yes | Min 2 chars |
| businessName | String | No | If dealer |
| email | String | Yes | Valid email format |
| phone | String | Yes | 10 digits |
| location | String | Yes | City/Town only |
| password | String | Yes | Min 8 chars |
| productTypes | Array | Yes | ['car', 'bike', 'commercial'] |

### 1.2 Buyer Registration
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | String | Yes | Min 2 chars |
| businessName | String | No | If dealer |
| email | String | Yes | Valid email format |
| phone | String | Yes | 10 digits |
| location | String | Yes | City/Town only |
| password | String | Yes | Min 8 chars |
| category | Array | Yes | ['car', 'bike', 'commercial'] |
| buyerType | Enum | Yes | 'dealer' or 'individual' |
| gstin | String | Yes | 15 char format (dealers only) |

### 1.3 Admin
- Pre-seeded in database
- Manages platform-wide content moderation
- Can view all transactions and ads
- Can suspend users

---

## 2. Database Models

### 2.1 User Model
```javascript
{
  _id: ObjectId,
  role: 'seller' | 'buyer' | 'admin',
  name: String,
  email: String,
  phone: String,
  password: String (hashed),
  location: String,
  businessName: String,
  productTypes: ['car', 'bike', 'commercial'], // sellers
  category: ['car', 'bike', 'commercial'], // buyers
  buyerType: 'dealer' | 'individual', // buyers only
  gstin: String, // dealers only
  
  // Constraints
  activeAds: [{ type: ObjectId, ref: 'Ad' }],
  maxActiveAds: 3,
  pendingDocuments: Boolean,
  
  // Payment Settings (sellers)
  paymentMethod: 'bank_transfer' | 'cash' | 'upi',
  bankDetails: {
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String
  },
  
  // Status
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 Ad Model
```javascript
{
  _id: ObjectId,
  sellerId: { type: ObjectId, ref: 'User' },
  images: [{
    url: String,
    order: Number
  }],
  
  // Vehicle Details
  category: 'car' | 'bike' | 'commercial',
  make: String,
  model: String,
  year: Number,
  variant: String,
  fuelType: String,
  transmission: String,
  kmDriven: Number,
  color: String,
  
  // Pricing & Location
  location: String,
  askingPrice: Number,
  description: String,
  
  // Targeting
  targetAudience: 'dealer' | 'individual' | 'both',
  locationFilter: String,
  
  // Workflow Status
  status: {
    type: String,
    enum: ['draft', 'published', 'bidding', 'inspection_phase', 
           'final_bidding', 'winner_selected', 'completed', 'closed']
  },
  
  // Inspection
  inspectionDateStart: Date,
  inspectionDateEnd: Date,
  selectedBuyers: [{ type: ObjectId, ref: 'User' }],
  
  // Final Transaction
  winningBuyer: { type: ObjectId, ref: 'User' },
  finalPrice: Number,
  pickupDate: Date,
  paymentDeadline: Date,
  
  // Bids
  initialBids: [BidSchema],
  finalBids: [BidSchema],
  
  createdAt: Date,
  updatedAt: Date
}
```

### 2.3 Bid Model (Embedded)
```javascript
{
  _id: ObjectId,
  buyerId: { type: ObjectId, ref: 'User' },
  amount: Number,
  message: String,
  createdAt: Date
}
```

### 2.4 Transaction Model
```javascript
{
  _id: ObjectId,
  adId: { type: ObjectId, ref: 'Ad' },
  sellerId: { type: ObjectId, ref: 'User' },
  buyerId: { type: ObjectId, ref: 'User' },
  finalPrice: Number,
  
  saleDocument: { url: String, uploadedAt: Date },
  deliveryPhoto: { url: String, uploadedAt: Date },
  
  status: 'pending' | 'document_pending' | 'photo_pending' | 'completed',
  
  createdAt: Date,
  updatedAt: Date
}
```

### 2.5 Notification Model
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User' },
  type: String,
  title: String,
  message: String,
  relatedAdId: { type: ObjectId, ref: 'Ad' },
  read: Boolean,
  createdAt: Date
}
```

---

## 3. Core Features

### 3.1 Ad Posting (Seller)
- Multi-image upload with drag-drop reordering (max 10 images, min 3)
- Vehicle details form
- Set asking price
- Select target audience
- Preview before publishing
- Cannot post if pendingDocuments or activeAds >= 3

### 3.2 Buyer Matching & Notifications
- Match buyers by category, location, buyer type
- Real-time notification via Socket.io
- Push notification if PWA enabled

### 3.3 Bidding Flow
```
Initial Bids → Select top 3-5 → Inspection Phase → Final Bids → Winner Selected → Transaction Complete
```

### 3.4 Ad Viewing Rules
- Buyer can view new ads only if no incomplete transaction
- Seller can view buyer profiles only after selecting for inspection

### 3.5 Payment Settings (Seller)
- Seller can set preferred payment method: Bank Transfer, UPI, or Cash
- Bank Transfer requires: Account Holder Name, Bank Name, Account Number, IFSC Code
- UPI requires: UPI ID
- Payment details are visible to winning bidder on Active Deal page

---

## 4. API Endpoints

### Authentication
- `POST /api/auth/seller/register`
- `POST /api/auth/buyer/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `GET /api/auth/payment-settings`
- `PUT /api/auth/payment-settings`

### Ads
- `POST /api/ads` - Create ad
- `GET /api/ads` - List ads
- `GET /api/ads/:id` - Get ad details
- `PUT /api/ads/:id` - Update ad
- `DELETE /api/ads/:id` - Delete ad
- `POST /api/ads/:id/publish` - Publish ad

### Bids
- `POST /api/bids/:id/bid` - Place initial bid
- `GET /api/bids/:id/bids` - Get all bids
- `POST /api/bids/:id/select` - Select buyers for inspection
- `POST /api/bids/:id/final-bid` - Place final bid
- `GET /api/bids/:id/final-bids` - Get final bids
- `POST /api/bids/:id/winner` - Select winning bid
- `GET /api/bids/my-bids` - Get my bids

### Transactions
- `GET /api/transactions` - Get transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions/:id/document` - Upload sale document
- `POST /api/transactions/:id/delivery-photo` - Upload delivery photo

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/suspend` - Suspend/activate user
- `GET /api/admin/ads` - List all ads
- `DELETE /api/admin/ads/:id` - Delete ad
- `GET /api/admin/transactions` - List all transactions

---

## 5. Frontend Pages

### Public
- `/` - Landing page
- `/login` - Login
- `/register` - Registration

### Seller Portal
- `/seller/dashboard` - Overview
- `/seller/post-ad` - Create/edit ad
- `/seller/my-ads` - List of ads
- `/seller/my-ads/:id` - Manage bids
- `/seller/transactions` - Transactions
- `/seller/payment-settings` - Payment method & bank details

### Buyer Portal
- `/buyer/dashboard` - Overview
- `/buyer/available-ads` - Browse ads
- `/buyer/available-ads/:id` - Ad details
- `/buyer/my-bids` - Bids placed
- `/buyer/active-deal` - Current transaction

### Admin Portal
- `/admin/dashboard` - Stats
- `/admin/users` - User management
- `/admin/ads` - Ad moderation
- `/admin/transactions` - Transactions

---

## 6. Real-time (Socket.io Events)

| Event | Direction | Description |
|-------|-----------|-------------|
| `ad:new` | Server → Client | New matching ad |
| `bid:received` | Server → Client | New bid |
| `bid:selected` | Server → Client | Selected for inspection |
| `bid:won` | Server → Client | Won the auction |
| `notification:new` | Server → Client | General notification |

---

## 7. PWA

- Service Worker for offline caching
- Push notifications
- Manifest for installability

---

## 8. Project Structure

```
CarMarket/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── socket/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
├── SPEC.md
└── README.md
```

---

## 9. Performance Optimizations

### 9.1 Caching Strategy
- In-memory cache service with TTL support
- Cache invalidation on data mutations
- Response caching for list endpoints

### 9.2 Pagination
- Standardized pagination across all list endpoints
- Query params: `page`, `limit` (max 50)
- Response includes: `data`, `pagination` object with total, pages, hasNext, hasPrev

### 9.3 Response Optimization
- Field selection via query params (`fields=default|detailed`)
- `.select()` to return only needed fields
- `.lean()` for read-only queries
- `.populate()` with specific field selection

### 9.4 Reduced Round Trips
- `Promise.all()` for parallel queries
- Batch notifications with `insertMany()`
- Parallel document fetches

### 9.5 Response Compression
- gzip compression via compression middleware
- JSON payload size limits: 10mb

---

## 10. Dependencies

### Backend
- express, mongoose, cors, dotenv
- jsonwebtoken, bcryptjs
- socket.io, multer
- express-validator, express-rate-limit
- compression, multer-storage-cloudinary

### Frontend
- react, react-dom, react-router-dom
- vite, tailwindcss
- axios, socket.io-client
- @hello-pangea/dnd (drag-drop)
- react-hot-toast
