import express from 'express'
import ProductController  from '../controllers/productController.js'
import verifyToken from '../middlewares/verifyToken.js'
import QueryController from '../controllers/queryController.js'
const router = express.Router()

router.post('/Add', verifyToken,ProductController.AddProduct)
router.get('/GetAllProducts',ProductController.getAllproducts)
router.get('/ProductCategory/:category', ProductController.getProductByCategory);
router.get('/GetProductById/:pid',ProductController.getProductById)
router.get('/ProductName/:productName',ProductController.getProductByName)  
router.post('/AddReview/:pid', verifyToken,ProductController.addReview)
router.get('/GetProductBySellerId/:sellerId',ProductController.GetProductBySellerID)
router.delete('/delete/:productId',verifyToken,ProductController.MarkProductAsSold)
router.post("/query",verifyToken,QueryController.handleQuery)

export default router
 