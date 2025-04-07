import express from 'express'
import dotenv from 'dotenv'
import authRoute from './routes/authRoute.js'
import predictRoute from './routes/predictRoute.js'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import firebase from 'firebase/compat/app'
import { getAuth } from 'firebase/auth';
import productRoute from './routes/productRoute.js'
import equipmentRoute from './routes/equipmentRoute.js'
import notificationRoute from './routes/notificationRoute.js'
import { v2 as cloudinary } from 'cloudinary'
import Razorpay from 'razorpay';
const app = express()
dotenv.config()
const port = process.env.PORT || '3000'
export const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
});

cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
});

app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors())

const firebaseconfig = {
      apiKey: "AIzaSyDpb2LZG4K9SwBtLcjPgUIVMgu9T-9Q3Ss",
      authDomain: "farmer-bazzar.firebaseapp.com",
      projectId: "farmer-bazzar",
      storageBucket: "farmer-bazzar.firebasestorage.app",
      messagingSenderId: "947822862899",
      appId: "1:947822862899:web:e3cbc377c4a604d0313946",
      measurementId: "G-K189DEZCWV"
};

app.use("/api/v1/auth/", authRoute)
app.use("/api/v1/predict/", predictRoute)
app.use("/api/v1/crop/", productRoute)
app.use("/api/v1/notification/", notificationRoute)
app.use("/api/v1/equipment/", equipmentRoute)

const firebaseApp = firebase.initializeApp(firebaseconfig, 'ClientApp');

export const auth = getAuth(firebaseApp);
app.listen(port, () => {
      console.log(`App is listening at port http://localhost:${port}`)
})