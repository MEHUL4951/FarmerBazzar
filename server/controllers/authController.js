import admin from '../firebase.js';
//mport { createUser, getUserByUID,getAllUsers } from '../models/userModel.js';
import UserModel from '../models/userModel.js'
import {getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import crypto from 'crypto'
import sendMail from '../utils/mailer.js';
import { auth } from '../server.js';

const otpStore = {};
const verifyotp = (email, otp) => {
  if (!email || !otp) {
    return { success: false, error: "Email and OTP requires" }
  }
  const record = otpStore[email]
  // console.log(record)
  if (!record) {
    return { success: false, error: "Invalid or Expired OTP" }
  }

  const isOtpValid = record.otp === parseInt(otp, 10)
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
}

class authController {

  static requestOtp = async (req, res) => {
    const { email } = req.body;
    try {
      // Check if email is already taken
      const existingUser = await admin.auth().getUserByEmail(email).catch(() => null);
      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken', success: false });
      }
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Generate OTP
      const otp = crypto.randomInt(100000, 1000000);

      // Store OTP
      otpStore[email] = {
        otp,
        createdAt: Date.now(),
      };

      // Send email
      console.log(otp)
      try {
        await sendMail(email, 'Your OTP Code', `Your OTP for FarmerBazzar is ${otp}. Valid for 10 minutes. Ignore  The mail if it is not you`);
        res.status(200).json({ message: 'OTP sent successfully!' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to send email' });
        console.log(error)
      }
    } catch (error) {
      console.error('Error requesting OTP:', error.message);
      res.status(500).json({ error: 'Failed to request OTP' });
    }
  };
  // Signup Method
  static signup = async (req, res) => {
    const { firstName, lastName, email, phoneNumber, state, password,otp } = req.body;
    try {
      const otpVerification = verifyotp(email, otp);
      if (!otpVerification.success) {
        return res.status(400).json({ error: otpVerification.error });
      }
      const fullName = firstName + " " +lastName
    
      const firebaseUser = await admin.auth().createUser({
        email,
        password,
        displayName: fullName,
      });
      // Add user to Firestore database
      const uid = firebaseUser.uid
      const user = new UserModel(uid, firstName, lastName, email, phoneNumber, state);
      const result = await user.createUser();

      if (result.success) {
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
      const userCredential = await signInWithEmailAndPassword(auth,email, password);
      if (!userCredential) {
        return res.status(400).json({ error: "Invalid username or password" });
      }
      // Retrieve user details from Firestore
      let  user = await UserModel.getUserByUID(userCredential.user.uid);
  
      if (!user) {
        return res.status(400).json({ error: "User not found in database" });
      }
      user = { ...user, uid: userCredential.user.uid };
      // Generate a custom token for session management (optional)
      const uid = user.uid.toString()
      const token = await admin.auth().createCustomToken(uid);
    
      return res.status(200).json({
        user,
        token
      });
    } catch (error) {
      console.error("Login error:", error.message);
      return res.status(400).json({ error: "Invalid username or password" });
    }
  };

  // Logout Method
  static logout = async (req, res) => {
    try {
      const uid = req.user.uid; // This must be extracted from the verified token
  
      // Revoke all refresh tokens for this user
      await admin.auth().revokeRefreshTokens(uid);
  
      return res.status(200).send({ message: "Successfully logged out" });
    } catch (error) {
      console.error("Logout error:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  // GetMe Method
  static getMe = async (req, res) => {
    try {
      const uid = req.user?.uid; // Populated by middleware
      console.log(uid)

      if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await UserModel.getUserByUID(uid); // Fetch user from Firestore

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error("GetMe error:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
   
  static getAllUsers = async (req,res)=>{
    const users = await UserModel.getAllUsers();
    return res.status(200).json({ users });
  }
  
  static GetUserById = async(req,res)=>{
        const {uid} = req.params
        const user = await UserModel.getUserByUID(uid)
        return res.status(200).json({user})
  }
  static UpdateUser = async(req,res)=>{
    try {
      const uid = req.user?.uid; // Populated by middleware
      const userData = req.body;
      if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = await UserModel.getUserByUID(uid); // Fetch user from Firestore
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await UserModel.updateUserByUID(uid,userData);
      return res.status(200).json({message:"Update profile Successfully.."})

    } catch (error) {
      console.error("UpdateUser error:", error.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default authController;
