import express from 'express'
import QueryController from '../controllers/queryController.js'
import verifyToken from '../middlewares/verifyToken.js'

const router = express.Router()

// router.post('/recommend',verifyToken,PredictionController.preditCrop)
router.post("/query",verifyToken,QueryController.handleQuery)
// router.post("/fertilizerRecommend",verifyToken,PredictionController.predictFertilizer)

export default router