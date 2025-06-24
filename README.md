# 👨‍🌾 FarmerBazaar

**FarmerBazaar** is a smart farming platform designed to empower farmers by offering a marketplace to **rent equipment**, **sell crops**, and access **real-time support**. It connects equipment owners with farmers, supports secure payments, and provides a user-friendly dashboard for both parties.

![FarmerBazaar Screenshot](./screenshots/homepage.png)

---

## 🚀 Features

### ✅ Smart Farming Equipment Rental System
- 🔍 **Search & Filter** (by price, type, location)
- 📅 **Equipment Availability Calendar**
- 💳 **Online Booking & Payment Integration** (Razorpay / Stripe)
- 📡 **GPS Integration** to locate nearby equipment
- 🔐 **Firebase Authentication** for secure login
- 📦 **Equipment Insurance Option**

### ✅ Real-Time Communication
- 💬 Chat system between owner & farmer before booking
- 🔔 Push Notifications using Firebase Cloud Messaging (FCM)
- 🗂️ Dashboard for both equipment owners and farmers

### ✅ Crop Marketplace
- 🌾 List crops for sale
- 🛒 Farmers can browse and buy directly
- 📷 Upload images of crops/products

---

## 🛠️ Tech Stack

| Frontend      | Backend          | Database      | APIs & Services            |
|---------------|------------------|---------------|----------------------------|
| Angular       | Node.js + Express| Firebase (NoSQL) | Razorpay, Stripe, OpenCage, Firebase Auth, FCM |

---

## 🔐 Authentication

- Firebase Email & Password Auth
- Role-based access: `Farmer`, `Owner`, `Admin`

---

## 🌐 Live Demo

🚧 Coming soon...  
(Or add Netlify / Firebase Hosting / Vercel / Railway / Heroku links here)

---

## 📦 Installation

### Prerequisites
- Node.js
- Angular CLI
- Firebase project

### Clone the Repository

```bash
git clone https://github.com/yourusername/FarmerBazaar.git
cd FarmerBazaar
# FarmerBazzar

cd frontend
npm install
ng serve
cd backend
npm install
npm run dev
