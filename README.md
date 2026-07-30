# 🚗 CarHub — Full-Stack Car Database Inventory System

> A production-ready MERN Stack Car Inventory Management System with JWT authentication, role-based access, real-time dashboard analytics, image uploads, and a premium Apple-inspired UI.

---

## 📸 Screenshots

> _Run the app and take screenshots to add here._

---

## ✨ Features

### 🔐 Authentication & Security
- JWT authentication with HTTP-only cookies + localStorage
- Bcrypt password hashing (12 salt rounds)
- Role-based access control (Admin / User)
- Rate limiting (10 auth / 100 API requests per 15 min)
- Helmet, CORS, MongoDB sanitization, input validation

### 🚗 Car Management (Admin)
- Add, Edit, Delete cars with image upload (Multer)
- Duplicate car prevention (name + brand + model + year)
- Auto stock status update (available / out_of_stock)
- Full text search with MongoDB indexes

### 📦 Inventory System
- Purchase cars (decrements stock, rejects if stock = 0)
- Restock cars with quantity and notes
- Complete inventory history (admin: all events, user: own purchases)
- Email confirmation on purchase (Nodemailer)

### 📊 Dashboard (Admin Only)
- Total Cars, Stock, Inventory Value, Cars Sold, Out of Stock
- Bar Chart: Stock by Category
- Pie Chart: Cars by Category & Fuel Type
- Line Chart: Monthly Revenue
- Recently Added Cars
- Recent Purchase Feed

### 🔍 Search & Filter
- Full-text search (name, brand, model)
- Filter by category, fuel type, price range, availability
- Sort: Newest, Oldest, Price Low→High, Price High→Low
- Pagination (12 per page)

### 💻 Frontend Pages
| Page | Route | Access |
|------|--------|--------|
| Landing | `/` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Cars Browse | `/cars` | Public |
| Car Detail | `/cars/:id` | Public |
| Add Car | `/cars/add` | Admin |
| Edit Car | `/cars/:id/edit` | Admin |
| Dashboard | `/dashboard` | Admin |
| Inventory | `/inventory` | Authenticated |
| Profile | `/profile` | Authenticated |
| Not Found | `*` | Public |

---

## 🛠️ Tech Stack

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication |
| Bcrypt | Password hashing |
| Multer | Image uploads |
| Express Validator | Request validation |
| Morgan | HTTP logging |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| Nodemailer | Email notifications |

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 + Vite 5 | UI framework + build tool |
| Tailwind CSS 3 | Utility-first styling |
| React Router DOM | Client-side routing |
| Axios | HTTP client |
| React Hook Form | Form management |
| React Toastify | Toast notifications |
| Framer Motion | Animations |
| Recharts | Dashboard charts |
| Lucide React | Icon library |

---

## 📁 Folder Structure

```
car-inventory/
├── server/                    # Backend
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── carController.js
│   │   ├── dashboardController.js
│   │   └── inventoryController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT verify
│   │   ├── authorize.js      # RBAC
│   │   ├── errorHandler.js   # Global error handler
│   │   ├── rateLimiter.js
│   │   └── upload.js         # Multer config
│   ├── models/
│   │   ├── User.js
│   │   ├── Car.js
│   │   └── InventoryHistory.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── carRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── inventoryRoutes.js
│   ├── seed/
│   │   └── seed.js           # 20 cars + 2 users
│   ├── utils/
│   │   ├── apiFeatures.js    # Search/filter/sort/paginate
│   │   ├── generateToken.js
│   │   └── sendEmail.js
│   ├── validators/
│   │   ├── authValidator.js
│   │   └── carValidator.js
│   ├── uploads/              # Uploaded car images
│   ├── app.js
│   └── server.js
│
└── client/                   # Frontend
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── CarCard.jsx
        │   ├── CarForm.jsx
        │   ├── ConfirmDialog.jsx
        │   ├── EmptyState.jsx
        │   ├── ErrorState.jsx
        │   ├── LoadingSkeleton.jsx
        │   ├── Pagination.jsx
        │   ├── ProtectedRoute.jsx
        │   └── AdminRoute.jsx
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── ThemeContext.jsx
        │   └── WishlistContext.jsx
        ├── hooks/
        │   └── useDebounce.js
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── CarsPage.jsx
        │   ├── CarDetailPage.jsx
        │   ├── AddCarPage.jsx
        │   ├── EditCarPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── InventoryPage.jsx
        │   ├── ProfilePage.jsx
        │   └── NotFoundPage.jsx
        ├── routes/
        │   └── AppRoutes.jsx
        ├── services/
        │   ├── api.js
        │   ├── authService.js
        │   ├── carService.js
        │   ├── dashboardService.js
        │   └── inventoryService.js
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### 1. Clone the Repository
```bash
git clone <repo-url>
cd car-inventory
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/car-inventory
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Database (Optional but Recommended)
```bash
cd server
npm run seed
```
This creates:
- **Admin:** `admin@carinventory.com` / `Admin@1234`
- **User:** `user@carinventory.com` / `User@1234`
- 20 premium cars across all categories

### 5. Run the Application

**Backend (Terminal 1):**
```bash
cd server
npm run dev
```
Server starts at `http://localhost:5000`

**Frontend (Terminal 2):**
```bash
cd client
npm run dev
```
App opens at `http://localhost:5173`

---

## 📡 API Documentation

### Authentication Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Public | Logout |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |
| POST | `/api/auth/wishlist/:carId` | Private | Toggle wishlist |

### Car Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/cars` | Public | Get all cars (with query params) |
| GET | `/api/cars/:id` | Public | Get single car |
| POST | `/api/cars` | Admin | Create car |
| PUT | `/api/cars/:id` | Admin | Update car |
| DELETE | `/api/cars/:id` | Admin | Delete car |
| POST | `/api/cars/:id/purchase` | Private | Purchase car |
| POST | `/api/cars/:id/restock` | Admin | Restock car |

### Query Parameters for GET /api/cars
```
?keyword=bmw          # Text search
?category=SUV         # Filter by category
?fuelType=Electric    # Filter by fuel type
?minPrice=10000       # Price range min
?maxPrice=100000      # Price range max
?available=true       # In-stock only
?sort=price_asc       # Sort options: price_asc, price_desc, newest, oldest
?page=1               # Page number
?limit=12             # Items per page
```

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard` | Admin | Get all stats + chart data |

### Inventory
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/inventory/history` | Admin | All events |
| GET | `/api/inventory/purchases` | Private | User purchases |

### Health Check
```
GET /api/health
```

---

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes |
| `JWT_EXPIRE` | Token expiry (e.g. 7d) | No |
| `JWT_COOKIE_EXPIRE` | Cookie expiry in days | No |
| `EMAIL_SERVICE` | Email provider (gmail) | No |
| `EMAIL_USER` | Sender email | No |
| `EMAIL_PASSWORD` | App password | No |
| `CLIENT_URL` | Frontend URL (for CORS) | Yes |

---

## 🧪 Testing

Use **Thunder Client**, **Postman**, or **curl**:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"Test@1234"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@carinventory.com","password":"Admin@1234"}'

# Get Cars
curl http://localhost:5000/api/cars?keyword=BMW&sort=price_asc

# Health Check
curl http://localhost:5000/api/health
```

---

## 👥 Roles & Permissions

| Feature | Admin | User |
|---------|-------|------|
| View Cars | ✅ | ✅ |
| Search & Filter | ✅ | ✅ |
| Purchase Cars | ✅ | ✅ |
| Add Cars | ✅ | ❌ |
| Edit Cars | ✅ | ❌ |
| Delete Cars | ✅ | ❌ |
| Restock Cars | ✅ | ❌ |
| Dashboard | ✅ | ❌ |
| Full Inventory History | ✅ | ❌ |
| Own Purchase History | ✅ | ✅ |
| Wishlist | ✅ | ✅ |

---

## 📦 Production Deployment

### Backend
```bash
NODE_ENV=production
# Use PM2 for process management:
npm install -g pm2
pm2 start server.js --name car-inventory-api
```

### Frontend
```bash
npm run build
# Deploy /dist folder to Netlify, Vercel, or Nginx
```

---

## 📝 License

MIT © 2024 CarHub

---

_Built with ❤️ using the MERN Stack_
