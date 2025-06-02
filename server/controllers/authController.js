import admin from '../firebase.js';
import UserModel from '../models/userModel.js';
const db = admin.firestore();
import { signInWithEmailAndPassword } from 'firebase/auth';
import crypto from 'crypto';
import sendMail from '../utils/mailer.js';
import { auth } from '../server.js';
import { getCache, setCache, deleteCache } from '../utils/redisCache.js';
import { error } from 'console';

const otpStore = {};
const verifyotp = (email, otp) => {
  if (!email || !otp) {
    return { success: false, error: "Email and OTP requires" };
  }
  const record = otpStore[email];
  if (!record) {
    return { success: false, error: "Invalid or Expired OTP" };
  }
  const isOtpValid = record.otp === parseInt(otp, 10);
  const isOtpExpired = Date.now() - record.createdAt > 10 * 60 * 1000;
  if (isOtpExpired) {
    delete otpStore[email];
    return { success: false, error: 'OTP expired' };
  }
  if (!isOtpValid) {
    return { success: false, error: 'Invalid OTP' };
  }
  delete otpStore[email];
  return { success: true, message: 'Email verified successfully!' };
};

class authController {
  static requestOtp = async (req, res) => {
    const { email } = req.body;
    try {
      const existingUser = await admin.auth().getUserByEmail(email).catch(() => null);
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken', success: false });
      }
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      const otp = crypto.randomInt(100000, 1000000);
      otpStore[email] = {
        otp,
        createdAt: Date.now(),
      };
      console.log(otp);
      try {
        await sendMail(email, 'Your OTP Code', `Your OTP for FarmerBazzar is ${otp}. Valid for 10 minutes. Ignore  The mail if it is not you`);
        res.status(200).json({ message: 'OTP sent successfully!' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to send email' });
        console.log(error);
      }
    } catch (error) {
      console.error('Error requesting OTP:', error.message);
      res.status(500).json({ error: 'Failed to request OTP' });
    }
  };

  static signup = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, state, password, otp } = req.body;
    try {
      const otpVerification = verifyotp(email, otp);
      if (!otpVerification.success) {
        return res.status(400).json({ error: otpVerification.error });
      }
      const fullName = firstName + " " + lastName;
      const firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: fullName,
      });
      const uid = firebaseUser.uid;
      const user = new UserModel(uid, firstName, lastName, email, phoneNumber, state);
      const result = await user.createUser();
      if (result.success) {
        await deleteCache("all_users");
        return res.status(201).json({ user: result, success: true });
      } else {
        return res.status(500).json({ error: "Error saving user to Firestore", success: false });
      }
    } catch (error) {
      console.error("Signup error:", error.message);
      return res.status(500).json({ error: error.message, success: false });
    }
  };

  static login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential) {
        return res.status(400).json({ error: "Invalid username or password" });
      }
      let user = await UserModel.getUserByUID(userCredential.user.uid);
      if (!user) {
        return res.status(400).json({ error: "User not found in database" });
      }
      user = { ...user, uid: userCredential.user.uid };
      const uid = user.uid.toString();
      const token = await admin.auth().createCustomToken(uid);
      return res.status(200).json({ user, token });
    } catch (error) {
      console.error("Login error:", error.message);
      return res.status(400).json({ error: "Invalid username or password" });
    }
  };

  static logout = async (req, res) => {
    try {
      const uid = req.user.uid;
      await admin.auth().revokeRefreshTokens(uid);
      return res.status(200).send({ message: "Successfully logged out" });
    } catch (error) {
      console.error("Logout error:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getMe = async (req, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const cacheKey = `user_${uid}`;
      let user = await getCache(cacheKey);
      if (!user) {
        user = await UserModel.getUserByUID(uid);
        if (!user) return res.status(404).json({ error: "User not found" });
        await setCache(cacheKey, user, 3600);
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error("GetMe error:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  static getAllUsers = async (req, res) => {
    const cacheKey = `all_users`;
    let users = await getCache(cacheKey);
    if (!users) {
      users = await UserModel.getAllUsers();
      await setCache(cacheKey, users, 3600);
    }
    return res.status(200).json({ users });
  };

  static GetUserById = async (req, res) => {
    const { uid } = req.params;
    const cacheKey = `user_${uid}`;
    let user = await getCache(cacheKey);
    if (!user) {
      user = await UserModel.getUserByUID(uid);
      if (!user) return res.status(404).json({ error: "User not found" });
      await setCache(cacheKey, user, 3600);
    }
    return res.status(200).json({ user });
  };

  static UpdateUser = async (req, res) => {
    try {
      const uid = req.user?.uid;
      const userData = req.body;
      if (!uid) return res.status(401).json({ error: "Unauthorized" });
      const user = await UserModel.getUserByUID(uid);
      if (!user) return res.status(404).json({ error: "User not found" });
      await UserModel.updateUserByUID(uid, userData);
      await deleteCache(`user_${uid}`);
      await deleteCache(`all_users`);
      return res.status(200).json({ message: "Update profile Successfully.." });
    } catch (error) {
      console.error("UpdateUser error:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

 
  static saveFcmToken = async (req, res) => {
    try {
      const { fcmtoken } = req.body;

      const uid = req.user.uid; // 👈 assuming Firebase Auth is verifying user

      if (!fcmtoken) return res.status(400).json({ error: 'FCM token is required' });
      await UserModel.updateUserByUID(uid, { fcmToken: fcmtoken });
      await deleteCache(`user_${uid}`);
      await deleteCache(`all_users`);

      return res.status(200).json({ message: 'FCM token saved successfully' });
    } catch (error) {
      console.error('Error saving FCM token:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  static savetopicToken = async (req, res) => {
    const { fcmToken, topic } = req.body;

    try {
      await admin.messaging().subscribeToTopic(fcmToken, topic);
      res.status(200).json({ message: 'Subscribed to topic successfully' });
    } catch (error) {
      console.error('Subscription Error:', error);
      res.status(500).json({ error: 'Subscription failed' });
    }
  }
  static firebaseLogin = async (req, res) => {
    const { idToken } = req.body;
    try {
      const user = await admin.auth().verifyIdToken(idToken);
      const uid = user.uid
      const email = user.email || 'example@gmail.com'
      const name = user.name;
      const phoneNumber = user.phone_number || 1234567890
      const fullname = name.split(' ');
      let userDoc = await db.collection('users').doc(uid).get();
      if(!userDoc.exists){
        const userData = {
          firstName: fullname[0],
          lastName: fullname[1],
          email,
          phoneNumber,
          state: 'Gujarat',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }
        await db.collection('users').doc(uid).set(
          userData
        )

      }else{
        res.status(200).js({message:"user is already created..."})
      }
      res.status(200).json({ user });
    } catch (err) {
      console.error('Firebase ID token verification failed:', err);
      res.status(401).json({ error:err.error});
    }
  }
}

export default authController;