# Coupon Management System

[![CI](https://github.com/Kiranpjk/coupon-management/actions/workflows/ci.yml/badge.svg)](https://github.com/Kiranpjk/coupon-management/actions/workflows/ci.yml)
[![Docker](https://github.com/Kiranpjk/coupon-management/actions/workflows/docker.yml/badge.svg)](https://github.com/Kiranpjk/coupon-management/actions/workflows/docker.yml)

A comprehensive e-commerce coupon management system with advanced eligibility rules and intelligent best-coupon selection algorithm.

## 🚀 Project Overview

This system provides REST APIs to create coupons with complex eligibility criteria and automatically find the best matching coupon for a user's shopping cart. Built with a modern tech stack and featuring a beautiful admin dashboard for testing.

**Key Features:**
- Create coupons with flexible discount types (FLAT/PERCENT)
- Advanced eligibility rules (user-based & cart-based)
- Intelligent best-coupon selection with tie-breaking logic
- Beautiful, responsive admin dashboard
- In-memory data storage with seed coupons
- Comprehensive API validation and error handling

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 22+
- **Framework:** Express.js
- **Language:** JavaScript (ES Modules)
- **Validation:** Custom middleware
- **CORS:** Enabled for frontend integration
- **Testing:** `node:test` + supertest, built-in coverage

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** TailwindCSS 3 with custom animations
- **HTTP Client:** Axios
- **UI:** Modern glassmorphism design with gradients

### DevOps
- **Containers:** Multi-stage Dockerfiles (non-root), docker-compose
- **CI/CD:** GitHub Actions (tests + coverage, client build, Docker smoke test, image publish to GHCR)
- **Dependencies:** Dependabot (npm + GitHub Actions)
- **Hosting:** Render / Vercel (planned, not set up)

---

## 📋 How to Run

### Prerequisites
- Node.js 22 or higher
- npm or yarn package manager
- Git (for cloning)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kiranpjk/coupon-management.git
   cd coupon-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Default configuration:
   # PORT=5000
   # NODE_ENV=development
   # FRONTEND_URL=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

   The backend will start at `http://localhost:5000`

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The frontend will start at `http://localhost:5173`

### Access the Application

- **Frontend Dashboard:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### 1. Create Coupon

**Endpoint:** `POST /api/coupons`

**Request Body:**
```json
{
  "code": "WELCOME100",
  "description": "Welcome offer - Flat ₹100 off for new users",
  "discountType": "FLAT",
  "discountValue": 100,
  "maxDiscountAmount": null,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "usageLimitPerUser": 1,
  "eligibility": {
    "firstOrderOnly": true,
    "minCartValue": 500
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "code": "WELCOME100",
    "description": "Welcome offer - Flat ₹100 off for new users",
    "discountType": "FLAT",
    "discountValue": 100,
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "usageLimitPerUser": 1,
    "eligibility": {
      "firstOrderOnly": true,
      "minCartValue": 500
    }
  },
  "message": "Coupon created successfully"
}
```

### 2. Get All Coupons

**Endpoint:** `GET /api/coupons`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "code": "WELCOME100",
      "description": "Welcome offer - Flat ₹100 off for new users",
      "discountType": "FLAT",
      "discountValue": 100,
      "startDate": "2025-01-01",
      "endDate": "2025-12-31",
      "eligibility": {
        "firstOrderOnly": true,
        "minCartValue": 500
      }
    }
  ],
  "count": 1
}
```

### 3. Get Best Coupon

**Endpoint:** `POST /api/coupons/best`

**Request Body:**
```json
{
  "user": {
    "userId": "u123",
    "userTier": "GOLD",
    "country": "IN",
    "lifetimeSpend": 6000,
    "ordersPlaced": 8
  },
  "cart": {
    "items": [
      {
        "productId": "p1",
        "category": "electronics",
        "unitPrice": 2500,
        "quantity": 1
      },
      {
        "productId": "p2",
        "category": "fashion",
        "unitPrice": 800,
        "quantity": 2
      }
    ]
  }
}
```

**Response (200) - Coupon Found:**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "code": "LOYAL25",
      "description": "25% off for loyal customers",
      "discountType": "PERCENT",
      "discountValue": 25,
      "maxDiscountAmount": 1000,
      "startDate": "2025-01-01",
      "endDate": "2030-12-31",
      "eligibility": {
        "minLifetimeSpend": 5000,
        "minOrdersPlaced": 5
      }
    },
    "discountAmount": 1000,
    "originalPrice": 4100,
    "finalPrice": 3100
  }
}
```

**Response (200) - No Coupon Found:**
```json
{
  "success": true,
  "data": null,
  "message": "No eligible coupon found for this user and cart"
}
```

### cURL Examples

**Create a Coupon:**
```bash
curl -X POST http://localhost:5000/api/coupons \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE20",
    "description": "20% off on all orders",
    "discountType": "PERCENT",
    "discountValue": 20,
    "maxDiscountAmount": 500,
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "eligibility": {
      "minCartValue": 1000
    }
  }'
```

**Get Best Coupon:**
```bash
curl -X POST http://localhost:5000/api/coupons/best \
  -H "Content-Type: application/json" \
  -d '{
    "user": {
      "userId": "u123",
      "userTier": "NEW",
      "country": "IN",
      "lifetimeSpend": 0,
      "ordersPlaced": 0
    },
    "cart": {
      "items": [
        {
          "productId": "p1",
          "category": "electronics",
          "unitPrice": 1500,
          "quantity": 1
        }
      ]
    }
  }'
```

---

## 🎯 Eligibility Rules

### User-Based Attributes

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `allowedUserTiers` | Array | User tier must be in this list | `["NEW", "REGULAR", "GOLD"]` |
| `minLifetimeSpend` | Number | Minimum total historical spend | `5000` |
| `minOrdersPlaced` | Number | Minimum completed orders | `3` |
| `firstOrderOnly` | Boolean | Only for first-time orders | `true` |
| `allowedCountries` | Array | User country must be in list | `["IN", "US"]` |

### Cart-Based Attributes

| Attribute | Type | Description | Example |
|-----------|------|-------------|---------|
| `minCartValue` | Number | Minimum cart total | `500` |
| `applicableCategories` | Array | At least one item must be from these categories | `["electronics", "fashion"]` |
| `excludedCategories` | Array | No items from these categories | `["books"]` |
| `minItemsCount` | Number | Minimum total items (sum of quantities) | `2` |

All eligibility attributes are **optional**. If not specified, that condition is ignored.

---

## 🏆 Best Coupon Selection Algorithm

The system evaluates all eligible coupons and selects the best one using this logic:

1. **Filter eligible coupons:**
   - Within validity period (startDate ≤ now ≤ endDate)
   - Not exceeding `usageLimitPerUser`
   - All eligibility criteria satisfied

2. **Calculate discount:**
   - **FLAT:** discount = discountValue
   - **PERCENT:** discount = (cartValue × discountValue / 100), capped by `maxDiscountAmount`

3. **Select best with tie-breaking:**
   - **Primary:** Highest discount amount
   - **Tie-breaker 1:** Earliest end date
   - **Tie-breaker 2:** Lexicographically smaller code

---

## 🎨 Seed Data

The system comes pre-loaded with 7 demo coupons:

1. **WELCOME100** - ₹100 off for first orders (min cart: ₹500)
2. **SAVE20** - 20% off (min cart: ₹1000, max discount: ₹500)
3. **GOLD50** - ₹50 off for GOLD tier users
4. **FASHION15** - 15% off on fashion items
5. **ELECTRONICS200** - ₹200 off on electronics (min cart: ₹2000)
6. **LOYAL25** - 25% off for loyal customers (5+ orders, ₹5000+ spend)
7. **INDIA10** - 10% off for Indian customers

---

## ✅ Running Tests

```bash
npm test                # unit + API tests (node:test + supertest)
npm run test:coverage   # same, with a coverage table
```

- `test/DiscountService.test.js`, `EligibilityService.test.js`, `BestCouponService.test.js`, `CouponStore.test.js`: unit tests for every service, including all eligibility rules and tie-breakers.
- `test/api.test.js`: HTTP tests for every route, including validation errors.

### Bugs found by tests

Writing the tests surfaced these bugs, which are now fixed:

1. **Negative final price:** a FLAT coupon larger than the cart (e.g. ₹200 off a ₹150 cart) gave `finalPrice: -50`. Discounts are now capped at the cart value.
2. **`maxDiscountAmount: null` zeroed PERCENT discounts:** the API docs show `"maxDiscountAmount": null`, but `Math.min(discount, null)` is `0`. `null` now means "no cap".
3. **`usageLimitPerUser: null` disabled the coupon:** `0 >= null` is `true`, so the coupon was always skipped. `null` now means "unlimited".
4. **Missing user fields bypassed rules:** if `lifetimeSpend` or `ordersPlaced` was omitted, `undefined < 5000` is `false`, so the user passed `minLifetimeSpend` / `minOrdersPlaced` checks (e.g. got LOYAL25). Missing values now count as `0`.
5. **Timezone-dependent end date:** `startDate` was parsed as UTC midnight but the end of `endDate` was set in the server's local timezone, so validity depended on where the server ran. Both now use UTC.
6. **All seed coupons had expired:** they ended on 2025-12-31, so `/api/coupons/best` always returned `null`. Seed end dates are now 2030-12-31.
7. **Floating point noise:** e.g. 15% of 999.99 returned 149.9985. Discounts and final prices are rounded to 2 decimals.

Input validation was also added (`discountValue` must be a number ≥ 0 and ≤ 100 for PERCENT, valid dates with `startDate ≤ endDate`, numeric `unitPrice`, integer `quantity`). Bad input now returns `400` instead of silently producing `NaN` prices or coupons that can never match.

---

## 🐳 Run with Docker

```bash
docker compose up --build
```

- Dashboard: http://localhost:8080 (nginx serves the built React app and proxies `/api` to the API container)
- API: http://localhost:5000 (health check: `/health`)

Both images are multi-stage and run as non-root users (`node` for the API, `nginx-unprivileged` for the client). The API image has a Docker `HEALTHCHECK` on `/health`.

The API image is published on every push to `main`:

```bash
docker run -p 5000:5000 ghcr.io/kiranpjk/coupon-management:latest
```

---

## 🔄 CI/CD

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| [`ci.yml`](.github/workflows/ci.yml) | push to `main`, pull requests | `npm ci`, tests with coverage (table in the job summary), client `npm run build`, `docker compose build` + smoke test of the running stack |
| [`docker.yml`](.github/workflows/docker.yml) | push to `main`, manual | Builds the API image and pushes `latest` and `sha-<commit>` tags to `ghcr.io/kiranpjk/coupon-management` using `GITHUB_TOKEN` |

Dependabot checks npm dependencies (root and `client/`) and GitHub Actions weekly.

---

## 🔒 Security

Dependency audit (Nov 2026): `npm audit` went from 22 advisories to 0 (API 8 → 0, including 1 critical; client 14 → 0). Fixed with `npm audit fix`, plus upgrading the client's Vite 5 → 6.4.6 (the patched release; no config changes needed).

---

## 🧪 Testing Guide

### Using the Dashboard

1. Open http://localhost:5173
2. **Create Coupon Tab:**
   - Fill in coupon details
   - Set eligibility rules
   - Submit to create

3. **Test Best Coupon Tab:**
   - Enter user details (tier, spend, orders, country)
   - Add cart items (category, price, quantity)
   - Click "Load Sample Data" for a quick test
   - Submit to find best coupon

### Manual Testing Scenarios

**Scenario 1: First-time user**
```json
{
  "user": {"userId": "u1", "userTier": "NEW", "country": "IN", "lifetimeSpend": 0, "ordersPlaced": 0},
  "cart": {"items": [{"productId": "p1", "category": "electronics", "unitPrice": 600, "quantity": 1}]}
}
```
Expected: **WELCOME100** (first order only, min cart ₹500)

**Scenario 2: GOLD tier user**
```json
{
  "user": {"userId": "u2", "userTier": "GOLD", "country": "IN", "lifetimeSpend": 3000, "ordersPlaced": 4},
  "cart": {"items": [{"productId": "p1", "category": "fashion", "unitPrice": 400, "quantity": 1}]}
}
```
Expected: **GOLD50** (GOLD tier, min cart ₹300)

**Scenario 3: Loyal customer**
```json
{
  "user": {"userId": "u3", "userTier": "REGULAR", "country": "IN", "lifetimeSpend": 6000, "ordersPlaced": 8},
  "cart": {"items": [{"productId": "p1", "category": "electronics", "unitPrice": 2500, "quantity": 1}]}
}
```
Expected: **LOYAL25** (25% off = ₹625 discount)

---

## 📁 Project Structure

```
coupon-management/
├── .github/
│   ├── workflows/ci.yml             # Tests, coverage, client build, Docker smoke test
│   ├── workflows/docker.yml         # Publish API image to GHCR
│   └── dependabot.yml
├── src/
│   ├── controllers/
│   │   └── couponController.js      # API request handlers
│   ├── routes/
│   │   └── couponRoutes.js          # Express routes
│   ├── services/
│   │   ├── CouponStore.js           # In-memory storage + seed data
│   │   ├── EligibilityService.js    # Eligibility validation logic
│   │   ├── DiscountService.js       # Discount calculation
│   │   └── BestCouponService.js     # Best coupon selection
│   ├── middleware/
│   │   └── errorHandler.js          # Error handling middleware
│   ├── app.js                       # Express app (imported by tests)
│   └── index.js                     # Server entry point (app.listen)
├── test/                            # Unit tests (services) + API tests (supertest)
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CouponForm.jsx       # Create coupon UI
│   │   │   └── BestCouponTester.jsx # Test best coupon UI
│   │   ├── App.jsx                  # Main React component
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # TailwindCSS styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile                   # Vite build -> unprivileged nginx
│   ├── nginx.conf                   # Serves the SPA, proxies /api to the API
│   └── package.json
├── Dockerfile                       # API image (multi-stage, non-root)
├── docker-compose.yml               # API + client
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🤖 AI Usage Note

### Tools Used
- **ChatGPT/Claude AI** for:
  - Project structure planning and architecture design
  - Boilerplate code generation for Express routes and React components
  - TailwindCSS styling suggestions and modern UI patterns
  - Best practices for REST API design
  - Code review and optimization suggestions

### Example Prompts Used

1. **Architecture Planning:**
   ```
   "Design a Node.js backend architecture for an e-commerce coupon system with 
   eligibility rules including user tier, cart value, categories, and order history. 
   Use clean separation of concerns with services, controllers, and routes."
   ```

2. **Business Logic:**
   ```
   "Create a JavaScript function to evaluate coupon eligibility based on multiple 
   criteria: user tier, lifetime spend, cart value, product categories. Handle 
   optional fields gracefully."
   ```

3. **Best Coupon Algorithm:**
   ```
   "Implement a best-coupon selection algorithm with tie-breaking: 
   1) highest discount, 2) earliest expiry, 3) lexicographic code order"
   ```

4. **Frontend Design:**
   ```
   "Create a React component with TailwindCSS for a coupon management dashboard 
   using glassmorphism, gradients, and smooth animations. Include form validation 
   and API integration with axios."
   ```

5. **Styling:**
   ```
   "Generate TailwindCSS configuration with custom purple/indigo theme, 
   gradient backgrounds, and micro-animations for a premium e-commerce admin panel"
   ```

---

## 🚀 Deployment

### Backend (Render)

1. Create new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV=production`
     - `FRONTEND_URL=<your-vercel-frontend-url>`

### Frontend (Vercel)

1. Import project to Vercel
2. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Note:** the client calls relative `/api/...` URLs, so add a Vercel rewrite from `/api/*` to the backend URL.

