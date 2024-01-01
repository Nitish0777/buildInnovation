import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createProductController,
  deleteProductController,
  getCartItemsController,
  getProductsController,
  getSingleProductController,
  paymentGatwayController,
  productCartController,
  productCategoryController,
  productCountController,
  productFiltersController,
  productListController,
  productPhotoController,
  relatedProductsController,
  searchProductsController,
  updateProductController,
} from "../controllers/productController.js";
import formidable from "express-formidable";
import { get } from "mongoose";

const router = express.Router();

//router
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

//get all products
router.get("/get-products", getProductsController);

//get single product
router.get("/get-products/:slug", getSingleProductController);

//get photo
router.get("/products-photo/:pid", productPhotoController);

//delete product
router.delete("/delete-products/:pid", deleteProductController);

// filter products
router.post("/products-filters", productFiltersController);

//product count
router.get("/products-count", productCountController);

//product per page
router.get("/products-list/:page", productListController);

//search products
router.get("/search/:keyword", searchProductsController);

//similar product
router.get("/related-products/:pid/:cid", relatedProductsController);

// category wise products
router.get("/product-category/:slug", productCategoryController);

//cart
router.post("/product-cart", productCartController);

//get cart
router.post("/get-cart", requireSignIn, getCartItemsController);

router.post("/payment", paymentGatwayController);

export default router;
