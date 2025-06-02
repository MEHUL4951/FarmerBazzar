import Product from "../models/productModel.js";
import { v4 as uuidv4 } from "uuid";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import sendMail from "../utils/mailer.js";
import generateToken from "../utils/generateUniqueToken.js";

import { getCache, setCache, deleteCache } from "../utils/redisCache.js";
import admin from "../firebase.js";
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
      await deleteCache("all_products");
      await deleteCache(`products_seller_${sellerId}`);
      const usersRef = await db.collection("users").get();
      const tokens = usersRef.docs
        .map((doc) => doc.data().fcmToken)
        .filter((token) => !!token);
      let multicastMessages = {};
      if (tokens.length > 0) {
        multicastMessages = {
          tokens,
          notification: {
            title: "🌾 New Product Added!",
            body: `${productName} is available at ₹${productPrice} per ${quantityUnit}.`,
          },
          data: {
            productId: pid,
            type: "new_product",
          },
        };
      }
      if (createResult.success) {
        await admin.messaging().sendEachForMulticast(multicastMessages);
        return res.status(201).json({
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
      const productRef = db.collection("products").doc(productId);

      const productDoc = await productRef.get();
      const productData = productDoc.data();
      const sellerId = productData.sellerId;
      const userDoc = await db.collection("users").doc(sellerId).get();
      const sellerfcmToken = userDoc.data().fcmToken;
      if (!productDoc.exists) {
        return res.status(404).json({ message: "Product not found" });
      }
      await productRef.update({ isSold: true });

      if (sellerfcmToken) {
        await admin.messaging().send({
          token: sellerfcmToken,
          notification: {
            title: "Product Sold",
            body: `Your product "${productData.productName}" has been marked as sold.`,
          },
          data: {
            productId: productId,
            type: "product_sold",
          },
        });
      }
      await deleteCache("all_products");
      await deleteCache(`products_seller_${sellerId}`);
      res.json({ message: "Product marked as sold successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error marking product as sold", error });
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
      const cached = await getCache("all_products");
      if (cached) return res.status(200).json({ products: cached });

      const products = await Product.getAllProducts();
      await setCache("all_products", products, 43200);
      res.status(200).json({ products });
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Failed to fetch products" });
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

  static verifyPurchase = async (req, res) => {
    try {
      const {
        productId,
        buyerName,
        buyerEmail,
        buyerPhone,
        sellingPrice,
        sellingDate,
        quantitySold,
      } = req.body;

      const user = req.user; 
      if(user.email == buyerEmail){
        return res.status(400).json({ message: "You cannot buy your own product" });
      }
      const Verificationtoken = generateToken();
      const verificationLink = `http://localhost:8080/api/v1/crop/verifySale?productId=${productId}&token=${Verificationtoken}&buyerQuntity=${quantitySold}`;
      const Subject = "Product Purchase Verification - Farmer Bazaar";
      const text = `<p>Hello <strong>${buyerName}</strong>,</p>
      <p>You have been listed as the buyer of a product on <strong>Farmer Bazaar</strong>.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>📦 Product ID: <strong>${productId}</strong></li>
        <li>📞 Phone: ${buyerPhone}</li>
        <li>💰 Price: ₹${sellingPrice}</li>
        <li>📅 Date: ${sellingDate}</li>
        <li>📏 Quantity: ${quantitySold}</li>
      </ul>
      <p>Please click the link below to confirm the purchase:</p>
      <a href="${verificationLink}" target="_blank" style="background:#22c55e;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">Confirm Purchase</a>
      <p>If you did not initiate this, please ignore this email.</p>
      <p>Thanks,<br/>Farmer Bazaar Team</p>`;

      await sendMail(buyerEmail, Subject, { html: text });

      await db.collection("products").doc(productId).update({
        buyerVerificationToken: Verificationtoken,
        buyerEmails:admin.firestore.FieldValue.arrayUnion(buyerEmail),
        emailSentAt: new Date().toISOString(),
        isVerifiedByBuyer: false,
      });
      await deleteCache("all_products");
      await deleteCache(`product_${productId}`);
      await deleteCache(`products_seller_${req.user.uid}`);

      return res.status(200).json({ message: "Email sent successfully" });
    } catch (err) {
      console.error("Email sending error:", err);
      return res
        .status(500)
        .json({ message: "Failed to send email", error: err.message });
    }
  };

  static VerifySale = async (req, res) => {
  const { productId, token ,buyerQuntity} = req.query;

  try {
    if (!productId || !token || !buyerQuntity) {
      return res.status(400).send("Invalid link or Missing Data");
    }

    const product = await Product.getProductById(productId);
    if (!product || product.data.buyerVerificationToken !== token) {
      return res.status(400).send("Invalid or expired link");
    }

  

    // Update product document
  
    const emails = product.data.buyerEmails; // an array of emails
    console.log(emails)
    console.log(product)
    // Get buyer ID from email
     const buyerSnapshot = await db
    .collection("users")
    .where("email", "in", emails)
    .get();

    
    console.log(buyerSnapshot.docs)
    if (buyerSnapshot.empty) {
      return res.status(404).send("Buyer not found");
    }
  
    const buyerDoc = buyerSnapshot.docs[0];
    console.log(buyerDoc.data())
    const buyerId = buyerDoc.id;
   
    const sellerRef = db.collection("users").doc(product.data.sellerId);
    const buyerRef = db.collection("users").doc(buyerId);
    const productRef = db.collection("products").doc(productId);

    const quantitySold = Number(product.data.soldQuantity || 0);
    const quantityToAdd = Number(buyerQuntity);
    const totalQuantity = Number(product.data.productQuantity);
    const newSoldQuantity = quantitySold + quantityToAdd;

    const isFullySold = newSoldQuantity >= totalQuantity;

     await productRef.update({
      buyerIds: admin.firestore.FieldValue.arrayUnion(buyerId),
      buyerName: admin.firestore.FieldValue.arrayUnion(buyerDoc.data().firstName + " " + buyerDoc.data().lastName),
      soldQuantity: newSoldQuantity,  
      productQuantity: totalQuantity - newSoldQuantity,
      isSold: isFullySold,
      isVerifiedByBuyer: true,
    });


    const batch = db.batch();

    batch.update(buyerRef, {
      purchasedProducts: admin.firestore.FieldValue.arrayUnion(productId),
    });

    batch.update(sellerRef, {
      soldProducts: admin.firestore.FieldValue.arrayUnion(productId),
    });

    await batch.commit();

    // Clear caches
    await deleteCache("all_products");
    await deleteCache(`product_${productId}`);
    await deleteCache(`products_seller_${product.data.sellerId}`);

    // Success HTML response
    res.send(`
      <html>
        <head>
          <title>Verification Successful</title>
        </head>
        <body>
          <h2>✅ Purchase Verified Successfully!</h2>
          <p>You can Check on your dashboard</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error verifying sale:", error);
    res.status(500).json({ message: "Error verifying sale", error });
  }
};

}

export default ProductController;
