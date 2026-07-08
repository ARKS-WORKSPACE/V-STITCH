# V-STITCH — Premium Vintage Wardrobe Staples

V-STITCH is a premium, modern minimalist e-commerce web application styled after modern curated boutiques. It supports custom apparel consignment submissions, seamless checkout, default shipping updates, and detailed order histories.

---

## Key Features

1. **Curated Catalog Shop**: Modern product display grid with standard sizing, color selectors, and sustainability indicators. Keeps all product images aligned with identical **4:5 aspect ratio frames**.
2. **Horizontal Tabbed User Account Panel**: Spacious row-tabbed user account dashboard including:
   - **Order History**: Clickable order headers with toggle chevrons showing collapsible invoices, payments, and shipping breakdowns.
   - **Default Shipping Details**: Automatic checkout form pre-filling using saved shipping configurations.
   - **Account Settings**: Dedicated profile details editor including a **Base64 Profile Picture Row Uploader** and a **Collapsible Change Password** container.
3. **Adaptive Responsiveness**: Crafted responsive design across laptop, desktop, tablet, and mobile dimensions, including a slide-in mobile navigation drawer and 2-column mobile catalog grids.
4. **Dual Database Failover System**: Programmed to hook into MongoDB via Mongoose, with a robust auto-failover mechanism that serves a local JSON database fallback (`db.json`) if the MongoDB connection is offline.
5. **Increased Payload Handling**: Configured Express body parser limits to `10mb` to enable base64 profile picture string uploads.

---

## Technology Stack

* **Frontend**: React (Vite, HMR, Context API, Framer Motion for smooth tab transitions, Remix Icons).
* **Backend**: Node.js, Express, JWT Authentication, BcryptJS.
* **Database**: MongoDB (Mongoose) + Local JSON Database fallback.

---

## API Endpoints List (12 routes)

### Authentication & Profile (`/api/auth`)
* `POST /api/auth/register` — Registers a new user.
* `POST /api/auth/login` — Authenticates a user and returns a token.
* `GET /api/auth/me` — Fetches current user details.
* `PUT /api/auth/profile` — Updates user profile, password, or base64 profile picture.

### Products Catalog (`/api/products`)
* `GET /api/products` — Lists all clothes (supports search, filters, and price/date sorting).
* `GET /api/products/:id` — Fetches details for a single item.
* `GET /api/products/:id/similar` — Pulls similar product recommendations.
* `POST /api/products` — Submits a new consignment clothing item (authenticated).

### Orders (`/api/orders`)
* `POST /api/orders` — Places a new order and decrements catalog stock (authenticated).
* `GET /api/orders/my-orders` — Returns order history for the active user (authenticated).

### General (`/api`)
* `GET /api/vendors` — Lists bespoke tailoring partners.
* `GET /api/status` — Returns database status (MongoDB vs. Local fallback).

---

## Setup & Running Locally

### Prerequisites
* **Node.js** (v16 or higher)
* **npm**
* **MongoDB** (Optional; runs on local JSON database if not connected)

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd "c:/Projects/Vintage Stitch"
   ```

2. Install dependencies for the root, client, and server:
   ```bash
   npm run install-all
   ```

3. Run the development environment:
   ```bash
   npm run dev
   ```
   * Client: http://localhost:5173
   * Backend Server: http://localhost:5000
