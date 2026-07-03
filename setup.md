```mermaid
flowchart TB

%%==========================
%% Users
%%==========================

USER([👤 User])
ADMIN([🛡️ Administrator])

%%==========================
%% Presentation Layer
%%==========================

subgraph PRESENTATION["Presentation Layer"]

USERAPP["💻 User Application

React.js
Redux Toolkit
Tailwind CSS
SWR
Axios"]

ADMINAPP["🖥️ Admin Panel

React.js
Tailwind CSS
SWR
Axios"]

end

%%==========================
%% Backend
%%==========================

subgraph BACKEND["Application Layer (Node.js + Express.js)"]

AUTH["🔐 Authentication

• JWT Authentication
• HTTP-only Cookies
• Role-Based Access"]

BUSINESS["⚙️ Business Logic

• Quote Management
• User Management
• Likes
• Saved Quotes
• Dashboard Analytics"]

SECURITY["🛡️ Security & Validation

• Zod Validation
• Login Rate Limiting
• Request Logger
• Global Error Handler
• Standard API Response
• Health Check APIs"]

SERVICES["☁️ External Services

• Cloudinary Uploads
• Password Reset Emails"]

end

%%==========================
%% Database
%%==========================

subgraph DATA["Data Layer"]

DATABASE[(🍃 MongoDB Atlas)]

MEDIA[(☁️ Cloudinary)]

EMAIL[(📧 Email Service)]

end

%%==========================
%% Deployment
%%==========================

subgraph DEPLOYMENT["Deployment"]

VERCEL1["▲ User Frontend
Vercel"]

VERCEL2["▲ Admin Panel
Vercel"]

RENDER["🚀 Backend API
Render"]

end

%%==========================
%% Connections
%%==========================

USER --> USERAPP
ADMIN --> ADMINAPP

USERAPP -->|HTTPS / Axios| AUTH
ADMINAPP -->|HTTPS / Axios| AUTH

AUTH --> BUSINESS

BUSINESS --> SECURITY

SECURITY --> DATABASE

BUSINESS --> SERVICES

SERVICES --> MEDIA

SERVICES --> EMAIL

USERAPP -. Hosted .-> VERCEL1
ADMINAPP -. Hosted .-> VERCEL2
AUTH -. Hosted .-> RENDER

RENDER -. Connects .-> DATABASE
RENDER -. Uploads .-> MEDIA
RENDER -. Sends Mail .-> EMAIL

%%==========================
%% Colors
%%==========================

style USERAPP fill:#2563eb,color:#fff
style ADMINAPP fill:#7c3aed,color:#fff

style AUTH fill:#059669,color:#fff
style BUSINESS fill:#0284c7,color:#fff
style SECURITY fill:#dc2626,color:#fff
style SERVICES fill:#d97706,color:#fff

style DATABASE fill:#15803d,color:#fff
style MEDIA fill:#ea580c,color:#fff
style EMAIL fill:#ec4899,color:#fff

style VERCEL1 fill:#111827,color:#fff
style VERCEL2 fill:#111827,color:#fff
style RENDER fill:#2563eb,color:#fff
```

# 🚀 Installation & Setup

## Prerequisites

Before running the project, make sure you have the following installed:

- Node.js (v18 or later)
- pnpm
- Git
- MongoDB Atlas account
- Cloudinary account
- Gmail App Password and Email

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/AmitKaliyani/06_quote_backend.git

```

---

## 2️⃣ Install Dependencies

```bash
pnpm install
```

---

## 3️⃣ Configure Environment Variables

Create a `.env` file in the project root and add the required environment variables.

```env
# ==========================================
# Application
# ==========================================

NODE_ENV=development
PORT=8000

# ==========================================
# Database
# ==========================================

MONGODB_URI=your_mongodb_connection_string

# ==========================================
# JWT
# ==========================================

JWT_SECRET=
ADMIN_JWT_SECRET=
JWT_REFRESH_SECRET=

# ==========================================
# Client URLs
# ==========================================

CLIENT_URL=http://localhost:5173

# ==========================================
# Cloudinary
# ==========================================

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ==========================================
# Email (SMTP)
# ==========================================
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

> **Note:** Never commit your `.env` file to version control. Use `.env.example` to document the required variables.

---

## 4️⃣ Start the Development Server

```bash
pnpm run dev
```

The backend server will start on:

```
http://localhost:8000
```

---

## 5️⃣ Verify the API

Open the health check endpoint in your browser or API client.

```
GET http://localhost:8000/api/health
```

A successful response indicates that the backend server and database connection are working correctly.

---

## Related Repositories

| Repository          | Description                   |
| ------------------- | ----------------------------- |
| Quotes Hub Frontend | User-facing React application |
| Quotes Hub Admin    | React-based admin dashboard   |

> The frontend and admin panel must be running separately to use the complete application.

# 🚀 Installation & Setup

## Prerequisites

Before running the project, make sure you have the following installed:

- Node.js (v18 or later)
- pnpm
- Git
- MongoDB Atlas account
- Cloudinary account
- Gmail App Password and Email

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/AmitKaliyani/06_quote_backend.git

```

---

## 2️⃣ Install Dependencies

```bash
pnpm install
```

---

## 3️⃣ Configure Environment Variables

Create a `.env` file in the project root and add the required environment variables.

```env
# ==========================================
# Application
# ==========================================

NODE_ENV=development
PORT=8000

# ==========================================
# Database
# ==========================================

MONGODB_URI=your_mongodb_connection_string

# ==========================================
# JWT
# ==========================================

JWT_SECRET=
ADMIN_JWT_SECRET=
JWT_REFRESH_SECRET=

# ==========================================
# Client URLs
# ==========================================

CLIENT_URL=http://localhost:5173

# ==========================================
# Cloudinary
# ==========================================

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ==========================================
# Email (SMTP)
# ==========================================
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

> **Note:** Never commit your `.env` file to version control. Use `.env.example` to document the required variables.

---

## 4️⃣ Start the Development Server

```bash
pnpm run dev
```

The backend server will start on:

```
http://localhost:8000
```

---

## 5️⃣ Verify the API

Open the health check endpoint in your browser or API client.

```
GET http://localhost:8000/api/health
```

A successful response indicates that the backend server and database connection are working correctly.

---

## Related Repositories

| Repository          | Description                   |
| ------------------- | ----------------------------- |
| Quotes Hub Frontend | User-facing React application |
| Quotes Hub Admin    | React-based admin dashboard   |

> The frontend and admin panel must be running separately to use the complete application.
