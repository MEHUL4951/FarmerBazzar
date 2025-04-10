import Product from '../models/productModel.js';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

import { getCache, setCache, deleteCache } from '../utils/redisCache.js';
import admin from '../firebase.js';
const db = admin.firestore();

dotenv.config();

class ProductController {
  static AddProduct = async (req, res) => {
    let {
      productName,
      productImage,
      productPrice,
      productDescription,
      productCategory,
      productQuantity,
      sellerAddress,
      sellerMobile,
      availableFrom,
      quantityUnit,
      sellerLatitude,
      sellerLongitude,
    } = req.body;

    try {
      const pid = uuidv4();
      if (productImage) {
        const uploadedRes = await cloudinary.uploader.upload(productImage);
        productImage = uploadedRes.secure_url;
      }
      const sellerId = req?.user?.uid;
      const product = new Product({
        pid,
        productName,
        productImage,
        productPrice,
        productDescription,
        productCategory,
        productQuantity,
        sellerAddress,
        sellerMobile,
        availableFrom,
        quantityUnit,
        sellerLatitude,
        sellerLongitude,
        sellerId,
      });
      const createResult = await product.createProduct();
      await deleteCache('all_products');
      await deleteCache(`products_seller_${sellerId}`);
      const usersRef = await db.collection('users').get();
      const tokens = usersRef.docs.map(doc => doc.data().fcmToken).filter(token => !!token)
      let multicastMessages = {}
      if (tokens.length > 0) {
        multicastMessages = {
          tokens,
          notification: {
            title: '🌾 New Product Added!',
            body: `${productName} is available at ₹${productPrice} per ${quantityUnit}.`,
          },
          data: {
            productId: pid,
            type: 'new_product'
          }
        }
      }
      if (createResult.success) {
        await admin.messaging().sendEachForMulticast(multicastMessages)
        return res.status(201).json({
          message: "Product is Created Successfully..",
          success: true,
        });
      }
      else {
        return res.status(500).json({ error: "Error saving Product to Firestore", success: false });
      }
    } catch (error) {
      console.error("Add Product Error:", error.message);
      return res.status(500).json({ error: error.message, success: false });
    }
  };

  static MarkProductAsSold = async (req, res) => {
    try {
      const { productId } = req.params;
      const productRef = db.collection('products').doc(productId);

      const productDoc = await productRef.get();
      const productData = productDoc.data();
      const sellerId = productData.sellerId;
      const userDoc = await db.collection('users').doc(sellerId).get()
      const sellerfcmToken = userDoc.data().fcmToken;
      if (!productDoc.exists) {
        return res.status(404).json({ message: 'Product not found' });
      }
      await productRef.update({ isSold: true });

      if (sellerfcmToken) {
        await admin.messaging().send({
          token: sellerfcmToken,
          notification: {
            title: 'Product Sold',
            body: `Your product "${productData.productName}" has been marked as sold.`,
          },
          data: {
            productId: productId,
            type: 'product_sold'
          }
        })
      }
      await deleteCache('all_products');
      await deleteCache(`products_seller_${sellerId}`);
      res.json({ message: 'Product marked as sold successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error marking product as sold', error });
    }
  };

  static getProductById = async (req, res) => {
    const { pid } = req.params;
    const cacheKey = `product_${pid}`;
    let product = await getCache(cacheKey);

    if (!product) {
      product = await Product.getProductById(pid);
      await setCache(cacheKey, product, 7200);
    }
    return res.status(200).json({ product });
  };

  static getAllproducts = async (req, res) => {
    try {
      const cached = await getCache('all_products');
      if (cached) return res.status(200).json({ products: cached });

      const products = await Product.getAllProducts();
      await setCache('all_products', products, 43200);
      res.status(200).json({ products });
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  };

  static getProductByCategory = async (req, res) => {
    const { category } = req.params;
    const cacheKey = `products_category_${category}`;
    let products = await getCache(cacheKey);
    if (!products) {
      products = await Product.getProductByCategory(category);
      await setCache(cacheKey, products, 3600);
    }
    return res.status(200).json({ products });
  };

  static getProductByName = async (req, res) => {
    const { productName } = req.params;
    const cacheKey = `products_name_${productName}`;
    let products = await getCache(cacheKey);
    if (!products) {
      products = await Product.getProductByName(productName);
      await setCache(cacheKey, products, 3600);
    }
    return res.status(200).json({ products });
  };

  static GetProductBySellerID = async (req, res) => {
    const { sellerId } = req.params;
    const cacheKey = `products_seller_${sellerId}`;
    let products = await getCache(cacheKey);
    if (!products) {
      products = await Product.getProductsBySellerId(sellerId);
      await setCache(cacheKey, products, 3600);
    }
    return res.status(200).json({ products });
  };

  static addReview = async (req, res) => {
    const { pid } = req.params;
    const { review, rating } = req.body;
    const userId = req?.user?.uid;
    const data = await Product.addReview(pid, review, rating, userId);
    await deleteCache(`product_${pid}`);
    return res.status(200).json({ data });
  };
}

export default ProductController;
