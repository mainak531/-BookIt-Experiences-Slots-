# 🎟️ BookIt – Experiences & Slot Booking Platform(Express + PostgreSQL)

BookIt is a **full-stack booking application** that allows users to browse curated experiences, view slot availability, apply promo codes, and confirm bookings — all in a seamless, dynamic flow.

---

## 🚀 Features
- **Dynamic Experience Listing** – Fetch experiences from the backend via REST APIs.  
- **Slot Availability** – Each experience displays available booking slots.  
- **Promo Code Validation** – Apply discount codes like `SAVE10` or `FLAT100`.  
- **Booking System** – Stores user booking details securely.  
- **Prevent Double Bookings** – Backend ensures slots aren’t overbooked.  
- **Responsive UI** – Built with modern frontend stack (React + Tailwind).  

---
**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

## Quick Start

### **2️⃣ Install Dependencies**
#### Frontend:
```bash
cd frontend
npm install
```
#### Backend:
```bash
cd backend
npm install
```

### 2) Choose a mode
- Mock mode: Do nothing (leave `DATABASE_URL` unset) and start the server.
- DB mode: Provide a valid PostgreSQL connection string in `.env` (see below), apply the schema, then start the server.

### 3) Run
```bash
npm run dev
```

Server starts on `http://localhost:4000`.

## What technologies are used for this project?

- Node.js + Express
- PostgreSQL
- Tailwind/React frontend 

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **GET** | `/experiences` | Fetch list of all experiences |
| **GET** | `/experiences/:id` | Fetch details and available slots for a specific experience |
| **POST** | `/bookings` | Create a new booking (with validation and slot check) |
| **POST** | `/promo/validate` | Validate promo code and return discount |

---

## 🔄 Integration Flow
1. **Home Page** → Fetches data from `GET /experiences`  
2. **Experience Details** → Fetched dynamically via `GET /experiences/:id`  
3. **Checkout** → Posts booking data via `POST /bookings`  
4. **Promo Code** → Validated using `POST /promo/validate`  
5. **Confirmation Page** → Displays booking confirmation dynamically  

---
---

## 🧪 Example Promo Codes
| Code | Discount |
|------|-----------|
| `SAVE10` | 10% off |
| `FLAT100` | ₹100 off |

---

## 💡 Future Enhancements
- Payment Gateway Integration (Razorpay / Stripe)
- Email Booking Confirmation
- Admin Dashboard for Experience Management
- Slot Availability Analytics

---

## 👨‍💻 Author
**Mainak Chanda**  
📍 Kolkata, India  
📧 [mainakchanda531@gmail.com](mailto:mainakchanda531@gmail.com)  
🌐 [GitHub: mainak531](https://github.com/mainak531)

---
````
