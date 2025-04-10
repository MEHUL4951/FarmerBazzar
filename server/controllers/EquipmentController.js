import admin from '../firebase.js';
const db = admin.firestore();
import geolib from 'geolib';
import { v4 as uuidv4 } from 'uuid';
import { razorpay } from '../server.js';
import crypto from 'crypto';
import { getCache, setCache, deleteCache } from '../utils/redisCache.js';
import UserModel from '../models/userModel.js';

class EquipmentController {
  static createOrder = async (req, res) => {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({
        success: false,
        message: "amount and currency are required",
      });
    }

    const options = {
      amount: amount * 100,
      currency: currency || 'INR',
      receipt: uuidv4(),
    };
    try {
      const order = await razorpay.orders.create(options);
      return res.status(200).json(order);
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.error,
      });
    }
  };

  static verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest('hex');

    if (digest === razorpay_signature) {
      return res.status(200).json({ success: true, message: 'Payment verified' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  };

  static bookEquipment = async (req, res) => {
    const { equipmentId, date, duration , status} = req.body;
    const buyerId = req.user.uid;
    const equipmentRef = db.collection('equipment').doc(equipmentId)
    const equipmentDoc = await equipmentRef.get();
    if (!equipmentDoc) {
      return res.status(400).json({ error: 'Equipment not available' });
    }
    const ownerRef = db.collection('users').doc(equipmentDoc.data().ownerId);
    const ownerDoc = await ownerRef.get();
    const fcmToken = ownerDoc.data().fcmToken;
    const buyer = await UserModel.getUserByUID(buyerId);

    try {
      const endDate = new Date(new Date(date).getTime() + duration * 24 * 60 * 60 * 1000);
      await db.collection('bookings').add({
        equipmentId,
        ownerId: equipmentDoc.data().ownerId,
        buyerId,
        date,
        duration,
        endDate,
        status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      if (fcmToken) {
        await admin.messaging().send({
          token: fcmToken,
          notification: {
            title: 'New Equipment Booking',
            body: `${buyer.firstName} booked your equipment for ${date} to ${endDate}`,
          },
          data: {
            type: 'booking',
            equipmentId,
            buyerName: buyer.firstName,
            duration: `${date} - ${endDate}`,
          },
        });
      }
      await db.collection('equipment').doc(equipmentId).update({ availability: false });
      await deleteCache('all_equipment');
      await deleteCache(`equipment_${equipmentId}`);
      res.status(200).json({ message: 'Booking confirmed!' });
    } catch (err) {
      console.log("book", err)
      res.status(500).json({ error: 'Something went wrong during booking' });
    }
  };

  static AddEquipment = async (req, res) => {
    try {
      const data = req.body;
      const eid = uuidv4();
      const loginUser = req?.user;

      await db.collection("equipment").doc(eid).set({
        ...data,
        ownerId: loginUser.uid,
        availability: true,
        createdAt: new Date().toISOString(),
      });

      await deleteCache('all_equipment');
      await deleteCache(`equipment_owner_${loginUser.uid}`);

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  };

  static getAllEquipments = async (req, res) => {
    try {
      const cached = await getCache('all_equipment');
      if (cached) return res.status(200).json({ data: cached });

      const snapshot = await db.collection("equipment").get();
      let equipmentList = [];
      snapshot.forEach((doc) => {
        equipmentList.push({ id: doc.id, ...doc.data() });
      });

      await setCache('all_equipment', equipmentList, 3600);
      res.status(200).json({ data: equipmentList });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch equipment", details: error.message });
    }
  };

  static filterByDistance = async (req, res) => {
    try {
      const userLat = parseFloat(req.query.lat);
      const userLon = parseFloat(req.query.lon);
      const maxDistance = parseInt(req.query.maxKM) * 1000;

      if (!userLat || !userLon || !maxDistance) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const equipmentRef = db.collection("equipment");
      const snapshot = await equipmentRef.get();

      let nearbyEquipment = [];

      snapshot.forEach((doc) => {
        const equipment = doc.data();
        if (equipment.latitude && equipment.longitude) {
          const distance = geolib.getDistance(
            { latitude: userLat, longitude: userLon },
            { latitude: equipment.latitude, longitude: equipment.longitude }
          );

          if (distance <= maxDistance) {
            nearbyEquipment.push({ id: doc.id, ...equipment, distance });
          }
        }
      });

      nearbyEquipment.sort((a, b) => a.distance - b.distance);
      res.status(200).json({ data: nearbyEquipment });
    } catch (error) {
      res.status(500).json({ error: "Server Error", details: error.message });
    }
  };

  static checkBookingExpiry = async () => {
    const now = Date.now()
    const expiredBookings = await db.collection('bookings').where('endDate', '<', now).where('status', '==', 'active').get();

    for (const doc of expiredBookings) {
      const data = doc.data();
      const bookingId = doc.Id;
      await db.collection('bookings').doc(bookingId).update({
        status: 'expired'
      })

      await db.collection('equipment').doc(data.equipmentId).update({
        availability: true
      });

      const ownerDoc = await db.collection('users').doc(data.ownerId).get();
      const buyerDoc = await db.collection('users').doc(data.buyerId).get();
      const ownerToken = ownerDoc.data().fcmToken;
      const buyerToken = buyerDoc.data().fcmToken;
    }
    const messageToOwner = {
      title: 'Booking Ended',
      body: `Booking for your equipment "${data.equipmentName}" has ended.`,
    };
    const messageToBuyer = {
      title: 'Booking Ended',
      body: `Your booking for equipment "${data.equipmentName}" has ended.`,
    };

    if (ownerToken) {
      await admin.messaging().send({
        token: ownerToken,
        notification: messageToOwner,
        data: {
          type: 'booking-ended',
          equipmentId: data.equipmentId,
        }
      });
    }

    if (buyerToken) {
      await admin.messaging().send({
        token: buyerToken,
        notification: messageToBuyer,
        data: {
          type: 'booking-ended',
          equipmentId: data.equipmentId,
        }
      });
    }
  }

}

export default EquipmentController;
