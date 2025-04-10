import express from 'express'
import authContrtoller  from '../controllers/authController.js'
import verifyToken from '../middlewares/verifyToken.js'

const router = express.Router()

router.post('/signup/request-otp',authContrtoller.requestOtp)
router.post('/signup/verify-and-complete',authContrtoller.signup)
router.post('/login',authContrtoller.login)
router.get('/logout',verifyToken , authContrtoller.logout)
router.get('/me',verifyToken,authContrtoller.getMe)
router.get('/getAll',authContrtoller.getAllUsers)
router.get('/GetUser/:uid',authContrtoller.GetUserById)
router.put('/update',verifyToken,authContrtoller.UpdateUser)
router.post('/save-fcm-token', verifyToken, authContrtoller.saveFcmToken);
router.post('/subscribe',authContrtoller.savetopicToken)
router.post('/firebase-login',authContrtoller.firebaseLogin);

export default router
 