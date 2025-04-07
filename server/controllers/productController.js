
import Product from '../models/productModel.js'
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv';

import admin from '../firebase.js';
const db = admin.firestore()

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

      if (createResult.success) {
        return res
          .status(201)
          .json({
            message: "Product is Created Successfully..",
            success: true,
          });
      } else {
        return res
          .status(500)
          .json({ error: "Error saving Product to Firestore", success: false });
      }
    } catch (error) {
      console.error("Add Product Error:", error.message);
      return res.status(500).json({ error: error.message, success: false });
    }
  };


  static MarkProductAsSold = async (req, res) => {
    try {
        const { productId } = req.params;
        // Reference to the product document
        const productRef = db.collection('products').doc(productId);
        // Check if the product exists
        const productDoc = await productRef.get();
        if (!productDoc.exists) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Update the isSold field to true instead of deleting
        await productRef.update({ isSold: true });
        res.json({ message: 'Product marked as sold successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking product as sold', error });
    }
};

  static getProductById = async (req, res) => {
    const { pid } = req.params;
    const product = await Product.getProductById(pid);
    return res.status(200).json({
      product,
    });
  };
  static getAllproducts = async (req, res) => {
    const products = await Product.getAllProducts();
    return res.status(200).json({ products });
  };

  static getProductByCategory = async (req, res) => {
    const { category } = req.params;
    const products = await Product.getProductByCategory(category);
    return res.status(200).json({
      products,
    });
  };
  static getProductByName = async (req, res) => {
    const { productName } = req.params;
    const products = await Product.getProductByName(productName);
    return res.status(200).json({
      products,
    });
  };

  static GetProductBySellerID = async (req, res) => {
    const { sellerId } = req.params;

    const products = await Product.getProductsBySellerId(sellerId);
    return res.status(200).json({
      products,
    });
  };
  static addReview = async (req, res) => {
    const { pid } = req.params;
    const { review, rating } = req.body;
    const userId = req?.user?.uid;
    const data = await Product.addReview(pid, review, rating, userId);
    return res.status(200).json({
      data,
    });
  };

  
}
export default ProductController;
