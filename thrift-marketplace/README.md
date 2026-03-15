# ThreadMarket — Thrift Clothes Marketplace

A full-stack, production-ready marketplace where users can buy and sell pre-loved clothing. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, MongoDB, and JWT authentication.

---

## Features

### 🛍 Buyer
- Browse approved product listings with filters (size, condition, price range)
- Search by title or brand
- Product detail pages with image gallery and star ratings
- Add to cart (localStorage) or Buy Now
- Order history

### 🏷 Seller
- Dashboard with stats (total, pending, approved, rejected products, orders)
- Submit products for admin review with Cloudinary image upload
- View and manage own product listings

### 🛡 Admin
- Dashboard with platform-wide stats
- Approve / reject pending product listings
- Block / unblock user accounts
- View all orders

### 🔐 Security
- JWT stored in `httpOnly` cookies (7-day expiry)
- Password hashing with bcrypt (cost factor 12)
- Role-based route protection via Next.js middleware
- Zod input validation on all API routes
- IP-based rate limiting on auth endpoints (10 req/15min) and API (100 req/15min)
- Sellers cannot buy their own products
- Admins cannot block themselves

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | Zod |
| Image Hosting | Cloudinary |
| Icons | Lucide React |

---

## Getting Started

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd thrift-marketplace
npm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string (Atlas or local) |
| `JWT_SECRET` | Long random string for signing JWTs |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `NEXTAUTH_URL` | Your app URL (e.g., `http://localhost:3000`) |

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Create Admin User

After registering a user via the UI, update their role in MongoDB:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

---

## Building for Production

```bash
npm run build
npm start
```

---

## Deploying to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables in the Vercel dashboard
4. Deploy

Vercel auto-detects Next.js — no additional config needed.

---

## Project Structure

```
thrift-marketplace/
├── app/
│   ├── (auth)/login & register     # Auth pages
│   ├── (buyer)/                    # Buyer-facing pages
│   │   ├── page.tsx                # Homepage / product listing
│   │   ├── products/[id]/          # Product detail
│   │   ├── cart/                   # Shopping cart
│   │   └── orders/                 # Order history
│   ├── (seller)/seller/            # Seller dashboard & product mgmt
│   ├── (admin)/admin/              # Admin dashboard, users, orders
│   ├── api/                        # API route handlers
│   ├── layout.tsx                  # Root layout with Navbar
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── FilterSidebar.tsx
│   ├── ImageUpload.tsx
│   └── OrderCard.tsx
├── lib/
│   ├── mongodb.ts                  # DB connection singleton
│   ├── jwt.ts                      # Token sign/verify
│   ├── cloudinary.ts               # Image upload helper
│   └── rateLimit.ts                # IP-based rate limiter
├── models/
│   ├── User.ts
│   ├── Product.ts
│   ├── Order.ts
│   └── Review.ts
├── middleware.ts                   # Route protection
└── .env.local.example
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register buyer/seller |
| POST | `/api/auth/login` | Public | Login, returns JWT cookie |
| POST | `/api/auth/logout` | Public | Clear auth cookie |
| GET | `/api/products` | Public | List approved products (filterable) |
| POST | `/api/products` | Seller | Create product (pending review) |
| GET | `/api/products/:id` | Public | Get product + reviews |
| DELETE | `/api/products/:id` | Seller/Admin | Delete product |
| GET | `/api/seller/products` | Seller | Seller's own products + stats |
| GET | `/api/admin/products` | Admin | All products + platform stats |
| PATCH | `/api/admin/products/:id` | Admin | Approve/reject product |
| DELETE | `/api/admin/products/:id` | Admin | Delete product |
| GET | `/api/admin/users` | Admin | All users |
| PATCH | `/api/admin/users/:id` | Admin | Block/unblock user |
| GET | `/api/admin/orders` | Admin | All orders |
| GET | `/api/orders` | Auth | User's orders (role-aware) |
| POST | `/api/orders` | Buyer | Place order |
| POST | `/api/upload` | Auth | Upload image to Cloudinary |
| POST | `/api/reviews` | Auth | Submit product review |

---

## License

MIT
