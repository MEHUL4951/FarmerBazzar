import express from 'express'
const router = express.Router()
import  notification from '../controllers/notificationController.js'
import verifyToken from '../middlewares/verifyToken.js'
//Get ALL Notifications
router.get('/getAll',notification.getAllNotifications)
// Notify all User about News
router.post('/news',notification.NotifyAllUsersAboutNews)

// Notify Users about Product
router.post('/product',notification.NotifyUserAboutNewProducts)

// Delete All Notification
router.delete('/deleteNotification/:userId',verifyToken,notification.markAllasRead)

//Delete Single Notification
router.delete('/delete/:notificationId',verifyToken,notification.deleteSingleNotification)


export default router