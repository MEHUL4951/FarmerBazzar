import express from 'express'

import EquipmentController from '../controllers/EquipmentController.js'
import verifyToken from '../middlewares/verifyToken.js'
const router = express.Router()

router.post('/add',verifyToken,EquipmentController.AddEquipment)
router.get('/all', EquipmentController.getAllEquipments)
router.get('/filter', EquipmentController.filterByDistance)

router.post('/payment/create-order', verifyToken,EquipmentController.createOrder)

router.post('/payment/verify', verifyToken, EquipmentController.verifyPayment)

router.post('/api/confirm-booking', verifyToken , EquipmentController.bookEquipment)
export default router