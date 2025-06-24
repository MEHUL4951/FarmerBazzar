# 👨‍🌾 FarmerBazaar – A Digital Marketplace for Farmers

**FarmerBazaar** is a full-stack web application designed to digitally empower farmers by bridging the gap between crop producers, equipment renters, and buyers. It integrates modern web technologies, AI capabilities, and geospatial tools to provide an intuitive and intelligent agricultural platform.

---

## 🔗 GitHub Repository

[👉 View on GitHub](https://github.com/Nana-4gohil/FarmerBazzar)

---

## 🧰 Tech Stack

| Frontend      | Backend           | Database     | APIs / Services                                                                 |
|---------------|-------------------|--------------|---------------------------------------------------------------------------------|
| Angular       | Express.js        | Firebase     | Firebase Auth, Firebase Realtime DB, Firebase Cloud Messaging, Redis           |
|               |                   |              | Gemini AI API (Google PaLM), Leaflet.js, WhatsApp & Phone Dialer Integration   |

---

## 🚀 Features

### 🛒 Crop Marketplace
- Google & OTP-based login (Firebase Auth)
- List crops/products with price, images, and details
- Real-time dashboard with:
  - Crop insights
  - Weather overlays
  - Analytics and trends

### 🧠 AI-Powered Agriculture Assistant
- 🌾 **Crop Recommendation Engine**
- 💊 **Fertilizer Suggestions**
- 🦠 **Crop Disease Prediction**
- 💬 **Multilingual AI Chat Assistant** (Gemini API)

### 🛠️ Equipment Rental System
- Location-based filtering using Leaflet Maps
- Book farming equipment by availability
- Payment gateway integration (Stripe / Razorpay)
- View availability calendar
- Owner and farmer dashboards
- Redis caching for high performance

### 🔔 Notifications & Communication
- Real-time FCM notifications on bookings, sales, or alerts
- WhatsApp and Dialer integration for direct buyer-seller contact
- Email verification for secure operations

---

## 🔐 Authentication

- Firebase Authentication:
  - Email & Password
  - Google Sign-In
  - OTP-based phone authentication
- Role-based access (Farmer, Buyer, Equipment Owner)

---

## 📦 Installation Guide

### Prerequisites
- Node.js
- Angular CLI
- Firebase Project Setup
- Redis Server (optional for local testing)

### Clone the Repository

```bash
git clone https://github.com/your-username/FarmerBazaar.git
cd FarmerBazaar

cd frontend
npm install
ng serve

cd backend
npm install
npm run dev

# For Linux/macOS
redis-server

PORT=5000
FIREBASE_API_KEY=your_firebase_key
FIREBASE_PROJECT_ID=your_project_id
GEMINI_API_KEY=your_gemini_key
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
REDIS_HOST=localhost
REDIS_PORT=6379
