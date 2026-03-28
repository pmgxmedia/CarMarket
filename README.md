# CarMarket

A two-sided marketplace for buying and selling vehicles (cars, bikes, commercial vehicles) with a structured bidding and inspection process.

## Features

- **Multi-category listings**: Cars, bikes, and commercial vehicles
- **Image gallery**: Up to 10 photos with drag-drop reordering
- **Targeted distribution**: Share ads with specific buyer categories (dealers/individuals/both)
- **Two-phase bidding**: Initial bids → Inspection → Final bids
- **Top bid selection**: Sellers can select top 3-5 bids for inspection
- **Transaction workflow**: Document upload, delivery photo, and completion tracking
- **Ad limits**: 3 active ads per seller, restrictions until pending documents are uploaded
- **Real-time notifications**: Socket.io for instant updates
- **PWA support**: Progressive web app with push notifications

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose
- JWT authentication
- Socket.io for real-time
- Multer for file uploads

### Frontend
- React 18 + Vite
- TailwindCSS
- React Router v6
- Socket.io-client
- React Beautiful DnD for drag-drop
- React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and other settings

npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Default Admin Account

After first run, create an admin user manually through the registration API or directly in MongoDB:

```javascript
{
  role: 'admin',
  name: 'Admin',
  email: 'admin@carmarket.com',
  password: 'admin123', // Will be hashed
  location: 'Mumbai'
}
```

## API Endpoints

### Authentication
- `POST /api/auth/seller/register` - Seller registration
- `POST /api/auth/buyer/register` - Buyer registration
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile

### Ads
- `POST /api/ads` - Create ad
- `GET /api/ads` - List ads
- `GET /api/ads/:id` - Get ad details
- `PUT /api/ads/:id` - Update ad
- `POST /api/ads/:id/publish` - Publish ad

### Bids
- `POST /api/bids/:id/bid` - Place initial bid
- `GET /api/bids/:id/bids` - Get all bids (seller)
- `POST /api/bids/:id/select` - Select buyers for inspection
- `POST /api/bids/:id/final-bid` - Place final bid
- `POST /api/bids/:id/winner` - Select winning bid

### Transactions
- `GET /api/transactions` - Get transactions
- `POST /api/transactions/:id/document` - Upload sale document
- `POST /api/transactions/:id/delivery-photo` - Upload delivery photo

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/suspend` - Suspend/activate user
- `GET /api/admin/ads` - List all ads
- `DELETE /api/admin/ads/:id` - Delete ad

## Workflow

### Seller Flow
1. Register as seller
2. Post ad with photos and details
3. Publish ad (notifies matching buyers)
4. Receive initial bids
5. Select top 3-5 buyers for inspection
6. Receive final bids after inspection
7. Select winner
8. Complete transaction (upload sale document)

### Buyer Flow
1. Register as buyer (individual or dealer)
2. Receive notifications for matching ads
3. Browse available ads
4. Place initial bid
5. If selected, confirm inspection
6. Place final bid after inspection
7. If won, complete payment and pickup
8. Upload delivery photo

## License

MIT
