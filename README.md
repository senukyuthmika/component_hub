# 🔌 ComponentHub — P2P Component Exchange & Lab Inventory

> A localized platform for engineering students and hobbyists to list, borrow, rent, or trade electronic components. Think of it as a campus-internal marketplace that solves the real problem of students buying components they use once, while others can't find what they need.

## 📋 Description

ComponentHub is a full-stack web application designed for university engineering departments. Students can list spare electronic components — microcontrollers, sensors, development boards, ICs, tools — and make them available for others to borrow, rent, trade, or take for free.

The platform features a complete peer-to-peer workflow: list a component with details and images, browse and search for what you need, submit a borrow request with dates and a message, and the owner approves or denies. After returning the item, both parties can leave star ratings and reviews. Built-in messaging, notifications, wishlists, and a rich analytics dashboard round out the experience.

Every feature performs real CRUD operations against a SQLite database. The seed data includes 27 realistic users, 79 electronic components across 10 categories, 48 borrow requests, 35+ reviews, 60 notifications, 25 messages, and 120 activity log entries — all with Sri Lankan names, realistic bios, and dates spanning six months for meaningful chart data.

## ✅ Features

### Core CRUD
- ✅ **Create** — List components with images, categories, tags; register users; submit borrow requests; post reviews; send messages
- ✅ **Read** — Browse with search, filter by category/condition/type/location/status, sort, paginate; component detail with gallery; user profiles with reviews; dashboard with 6 analytics charts; notification feed
- ✅ **Update** — Edit component listings; update user profile and avatar; approve/deny borrow requests; mark items returned; mark notifications read
- ✅ **Delete** — Remove listings with cascade confirmation; cancel pending requests; delete messages; remove wishlist items; delete user account

### Pages (10 distinct pages)
- ✅ Landing page with animated hero, stats counters, featured components
- ✅ Dashboard with 6 Recharts graphs (line, bar, pie, area, horizontal bar, donut)
- ✅ Browse components with sidebar filters, search autocomplete, grid/list toggle, pagination
- ✅ Component detail with image gallery, specs, owner card, borrow modal, similar items
- ✅ My Listings with table view, create/edit/delete modals
- ✅ Borrow Requests with incoming/outgoing tabs, approve/deny/return/review workflows
- ✅ Messages with conversation list and chat thread
- ✅ Notifications grouped by date with type icons
- ✅ User Profile with listed components and reviews
- ✅ Admin Panel with user management, analytics charts, system logs, CSV export

### Extra Features (beyond basic CRUD)
- ✅ **Wishlist** — Heart toggle on component cards, dedicated saved items page
- ✅ **Search Autocomplete** — Dropdown suggestions as you type
- ✅ **Star Rating System** — 1-5 star reviews with average calculation per user
- ✅ **Recently Viewed** — Tracked in localStorage, accessible from anywhere
- ✅ **Component Views Counter** — Incremented on each detail page visit
- ✅ **Export Borrow History as CSV** — Downloadable from admin/dashboard
- ✅ **Activity Timeline** — Visual log of all platform actions
- ✅ **Dark Mode Toggle** — Persisted in localStorage, system preference detection
- ✅ **Responsive Design** — Mobile (375px), tablet (768px), desktop (1280px+)
- ✅ **Role-based Access** — Student, Lab Admin, Superadmin with route guards
- ✅ **Skeleton Loading** — Animated placeholders while data fetches
- ✅ **Toast Notifications** — Success/error feedback via react-hot-toast
- ✅ **Form Validation** — Client-side (required fields, email, password strength) and server-side (express-validator patterns, ownership checks, FK validation)
- ✅ **Cascade Delete Warnings** — Confirmation modals explaining data loss
- ✅ **Empty States** — Friendly messages with icons when no data exists
- ✅ **404 Page** — Custom not-found page with back-to-home link

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts (line, bar, pie, area, donut) |
| Icons | Lucide React |
| Backend | Node.js + Express.js |
| Database | SQLite via better-sqlite3 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Uploads | Multer |
| HTTP Client | Axios |
| Toasts | react-hot-toast |

## 📦 Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

## 🚀 Installation

```bash
# 1. Clone or extract the project
unzip componenthub.zip
cd componenthub

# 2. Install all dependencies (server + client)
cd server && npm install
cd ../client && npm install
cd ..

# 3. Seed the database with realistic data
cd server && node seed/index.js
cd ..

# 4. Start the backend (Terminal 1)
cd server && node index.js
# → API running on http://localhost:5000

# 5. Start the frontend (Terminal 2)
cd client && npm run dev
# → App running on http://localhost:5173
```

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Superadmin** | admin@componenthub.lk | password123 |
| **Lab Admin** | lab@componenthub.lk | password123 |
| **Student** | student@componenthub.lk | password123 |

All 27 seed users share the same password: `password123`

## 📡 API Endpoints

### Authentication
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login and get JWT | No |
| GET | /api/auth/profile | Get current user profile | Yes |
| PUT | /api/auth/profile | Update profile (+ avatar upload) | Yes |
| DELETE | /api/auth/account | Delete own account | Yes |

### Components
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | /api/components | List all (search, filter, sort, paginate) | No |
| GET | /api/components/autocomplete?q= | Search autocomplete | No |
| GET | /api/components/my-listings | Get user's own listings | Yes |
| GET | /api/components/:id | Get component detail | No |
| POST | /api/components | Create listing (multipart images) | Yes |
| PUT | /api/components/:id | Update listing | Yes |
| DELETE | /api/components/:id | Delete listing | Yes |

### Categories
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | /api/categories | List all categories with counts | No |

### Borrow Requests
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | /api/borrow-requests | Submit borrow request | Yes |
| GET | /api/borrow-requests/incoming | Requests to approve (as lender) | Yes |
| GET | /api/borrow-requests/outgoing | Requests made (as borrower) | Yes |
| PUT | /api/borrow-requests/:id/status | Approve/deny/return | Yes |
| PUT | /api/borrow-requests/:id/cancel | Cancel pending request | Yes |

### Reviews
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | /api/reviews | Post a review | Yes |
| GET | /api/reviews/user/:userId | Get reviews for a user | No |

### Messages
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | /api/messages | Send a message | Yes |
| GET | /api/messages/conversations | List conversations | Yes |
| GET | /api/messages/thread/:userId | Get message thread | Yes |
| DELETE | /api/messages/:id | Delete a message | Yes |

### Notifications
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | /api/notifications | Get all with unread count | Yes |
| PUT | /api/notifications/:id/read | Mark one as read | Yes |
| PUT | /api/notifications/read-all | Mark all as read | Yes |

### Wishlist
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | /api/wishlist/toggle | Add/remove from wishlist | Yes |
| GET | /api/wishlist | Get user's wishlist | Yes |
| GET | /api/wishlist/check/:componentId | Check if wishlisted | Yes |
| DELETE | /api/wishlist/:componentId | Remove from wishlist | Yes |

### Dashboard
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | /api/dashboard/stats | Platform-wide stats | No |
| GET | /api/dashboard/user-stats | Current user's stats | Yes |
| GET | /api/dashboard/charts | All chart data | No |
| GET | /api/dashboard/recent-activity | Recent activity feed | No |
| GET | /api/dashboard/export-history | Export CSV | Yes |

### Users
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | /api/users/:id | Public user profile | No |

### Admin (Superadmin only)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | /api/admin/users | List all users | Superadmin |
| PUT | /api/admin/users/:id | Update role/verification | Superadmin |
| DELETE | /api/admin/users/:id | Delete user | Superadmin |
| GET | /api/admin/requests | All borrow requests | Admin+ |

## 🗄 Database Schema

- **users** — id, full_name, email (unique), password_hash, avatar_url, phone, location, bio, role, is_verified, rating, timestamps
- **categories** — id, name (unique), icon, description
- **components** — id, owner_id→users, category_id→categories, title, description, brand, model_number, condition, listing_type, price_per_day, quantity, available_quantity, tags (JSON), image_urls (JSON), location, lab_name, status, views_count, timestamps
- **borrow_requests** — id, component_id→components, requester_id→users, lender_id→users, status, request_message, response_message, borrow_date, return_date, actual_return_date, timestamps
- **reviews** — id, reviewer_id→users, reviewed_user_id→users, request_id→borrow_requests, rating (1-5), comment, created_at
- **notifications** — id, user_id→users, type, title, message, related_id, is_read, created_at
- **messages** — id, sender_id→users, receiver_id→users, component_id→components, content, is_read, created_at
- **wishlists** — id, user_id→users, component_id→components, created_at (unique pair)
- **activity_log** — id, user_id→users, action, entity_type, entity_id, details (JSON), created_at

All foreign keys have indexes. ON DELETE CASCADE on all references.

## 📂 Project Structure

```
componenthub/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── Navbar.jsx
│   │   │   └── ui/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/
│   │   │   ├── Admin.jsx
│   │   │   ├── Browse.jsx
│   │   │   ├── ComponentDetail.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── MyListings.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Requests.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   └── Wishlist.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── server/                     # Express backend
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── borrowController.js
│   │   ├── componentController.js
│   │   ├── dashboardController.js
│   │   ├── messageController.js
│   │   ├── notificationController.js
│   │   ├── reviewController.js
│   │   ├── userController.js
│   │   └── wishlistController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── routes/
│   │   └── index.js
│   ├── seed/
│   │   └── index.js
│   ├── uploads/
│   ├── .env
│   ├── index.js
│   └── package.json
├── .env.example
├── package.json
└── README.md
```

## ⚙️ Environment Variables

```env
PORT=5000
JWT_SECRET=componenthub_super_secret_key_change_in_production
DB_PATH=./database.sqlite
UPLOAD_DIR=./uploads
```

## 🔮 Known Limitations / Future Improvements

- Real-time messaging via WebSocket (currently requires refresh)
- Email verification flow for new registrations
- QR code generation for component labels
- Component comparison side-by-side view
- Print-friendly component label cards
- Image compression and thumbnail generation
- Rate limiting on API endpoints
- Password reset flow
- Push notifications

## 📄 License

MIT

## 👤 Author

**Pulith Thewmika** — IT23656338
EC4307 Web Application Development
Sri Lanka Institute of Information Technology (SLIIT)
