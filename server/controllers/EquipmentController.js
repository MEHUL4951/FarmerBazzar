
import admin from '../firebase.js';
const db = admin.firestore();
import geolib from 'geolib';
import { v4 as uuidv4 } from 'uuid';
import { razorpay } from '../server.js'
import crypto from 'crypto';
class EquimentController {
  static createOrder = async (req, res) => {
    const { amount, currency } = req.body

    if (!amount || !currency) {

      return res.status(400).json({
        success: false,
        message: "amount and currency are required"
      })
    }

    const options = {
      amount: amount * 100,
      currency: currency || 'INR',
      receipt: uuidv4(),
    }
    try {
      const order = await razorpay.orders.create(options)
      return res.status(200).json(
        order
      )

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.error
      })

    }
  }
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
  }


  static bookEquipment = async(req,res)=>{
    const { equipmentId, date, duration } = req.body;
    const userId = req.user.uid; // Assuming you have user ID from the token
  
    try {
      const endDate = new Date(new Date(date).getTime() + duration * 24 * 60 * 60 * 1000);
  
      // Save booking
      await db.collection('bookings').add({
        equipmentId,
        userId,
        date,
        duration,
        endDate,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  
      // Update equipment availability
      await db.collection('equipment').doc(equipmentId).update({
        availability: false,
      });
  
      res.json({ message: 'Booking confirmed!' });
    } catch (err) {
      res.status(500).json({ error: 'Something went wrong during booking' });
    }
  }

  static AddEquipment = async (req, res) => {
    try {
      const data = req.body;
      const eid = uuidv4();
      const loginUser = req?.user
      await db.collection("equipment").doc(eid).set({
        ...data,
        ownerId: loginUser.uid,
        availability: true,
        createdAt: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true
      })
    } catch (err) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
  static getAllEquipments = async (req, res) => {
    try {
      const snapshot = await db.collection("equipment").get();
      let equipmentList = [];

      snapshot.forEach((doc) => {
        equipmentList.push({ id: doc.id, ...doc.data() });
      });

      res.status(200).json({ data: equipmentList });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch equipment", details: error.message });
    }
  }
  static filterByDistance = async (req, res) => {
    try {
      // this.seedData();
      const userLat = parseFloat(req.query.lat);
      const userLon = parseFloat(req.query.lon);
      const maxDistance = parseInt(req.query.maxKM) * 1000 // Convert KM to meters


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
          // console.log(distance,equipment.name)

          if (distance <= maxDistance) {
            nearbyEquipment.push({ id: doc.id, ...equipment, distance });
          }
        }
      });

      // Sort by distance (closest first)
      nearbyEquipment.sort((a, b) => a.distance - b.distance);

      res.status(200).json({ data: nearbyEquipment });
    } catch (error) {
      res.status(500).json({ error: "Server Error", details: error.message });
    }
  }
}
export default EquimentController
