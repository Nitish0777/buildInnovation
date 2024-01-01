import productModel from "../models/productModel.js";
import cateryModel from "../models/categoryModel.js";
import fs from "fs";
import slugify from "slugify";
import PaytmChecksum from "../config/PaytmChecksum.js";
import orderModel from "../models/orderModel.js";
import cartModel from "../models/cartModel.js";
import userModel from "../models/userModel.js";

export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validate
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).send({
        success: false,
        message: "All fields in Create Product  required",
      });
    }
    if (photo && photo.size > 1000000) {
      return res.status(400).send({
        success: false,
        message: "Image must be less than 1MB",
      });
    }
    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product created successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const getProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(10)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      totalProducts: products.length,
      message: "All products get successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting all products",
      error,
    });
  }
};

export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");
    if (!product) {
      return res.status(400).send({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).send({
      success: true,
      message: "Single product get successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting single product",
      error,
    });
  }
};

export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ _id: req.params.pid })
      .select("photo");
    if (!product) {
      return res.status(400).send({
        success: false,
        message: "Product photo not found",
      });
    }
    if (product.photo.data) {
      res.set("Content-Type", product.photo.contentType);
      return res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in getting product photo",
      error,
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ _id: req.params.pid })
      .select("-photo");
    if (!product) {
      return res.status(400).send({
        success: false,
        message: "Product not found",
      });
    }
    await product.deleteOne();
    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in deleting product",
      error,
    });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validate
    if (!name || !description || !price || !category || !quantity) {
      return res.status(400).send({
        success: false,
        message: "All fields in update Product  required",
      });
    }
    if (photo && photo.size > 1000000) {
      return res.status(500).send({
        success: false,
        message: "Image must be less than 1MB",
      });
    }
    const products = await productModel.findByIdAndUpdate(
      { _id: req.params.pid },
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );

    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "Product update successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating product",
      error,
    });
  }
};

export const productFiltersController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    });
  }
};

export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Error in product count",
      error,
      success: false,
    });
  }
};

export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "error in per page ctrl",
      error,
    });
  }
};

export const searchProductsController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const result = await productModel
      .find({
        $or: [{ name: { $regex: keyword, $options: "i" } }],
        $or: [{ description: { $regex: keyword, $options: "i" } }],
      })
      .select("-photo");
    res.json(result);
  } catch (error) {
    console.log(error);
    req.success(400).send({
      success: false,
      message: "Error In Search Product Api",
      error,
    });
  }
};

export const relatedProductsController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({ _id: { $ne: pid }, category: cid })
      .select("-photo")
      .limit(3)
      .populate("category");
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in related products",
      error,
    });
  }
};

export const productCategoryController = async (req, res) => {
  try {
    const category = await cateryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in getting product category",
      error,
    });
  }
};

export const productCartController = async (req, res) => {
  try {
    const { cart, id } = req.body;

    console.log("id**", req.body);
    const cartData = await cartModel.create({ products: cart, user: id });
    await userModel.findByIdAndUpdate(id, {
      cart: cartData._id,
    });
    res.status(200).send({
      success: true,
      message: "Product added to cart successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in product to cart",
      error,
    });
  }
};

export const getCartItemsController = async (req, res) => {
  try {
    const userId = req.body.id;
    console.log("user from frontend", userId);
    const user = await userModel.findById(userId);
    const cartId = user.cart;
    const cart = await cartModel.findById(cartId);
    console.log("cart**", cart);
    const products = cart?.products;
    console.log("products**", products);

    const cartProduct = [];
    for (let i = 0; i < products.length; i++) {
      const product = await productModel.findById(products[i]);
      console.log("***********", product);
      cartProduct.push(product);
    }

    res.status(200).send({
      success: true,
      cartProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in getting cart items",
      error,
    });
  }
};

export const paymentGatwayController = async (req, res) => {
  try {
    const { cart, email, phone } = req.body;
    console.log(req.body);
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });

    const totalAmount = JSON.stringify(total);

    var params = {};

    /* initialize an array */
    (params["MID"] = process.env.PAYTM_MID),
      (params["WEBSITE"] = process.env.PAYTM_WEBSITE),
      (params["CHANNEL_ID"] = "WEB"),
      (params["INDUSTRY_TYPE_ID"] = "Retail"),
      (params["ORDER_ID"] = "ORD" + new Date().getTime()),
      (params["CUST_ID"] = "CUST" + new Date().getTime()),
      (params["TXN_AMOUNT"] = totalAmount),
      (params["CALLBACK_URL"] =
        "http://localhost:8080/api/v1/product/callback"),
      (params["EMAIL"] = email),
      (params["MOBILE_NO"] = phone);

    /**
     * Generate checksum by parameters we have
     * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
     */

    var paytmChecksum = PaytmChecksum.generateSignature(
      console.log("1*******************************************", params),
      params,
      process.env.MERCHANT_KEY
    );
    paytmChecksum
      .then(function (checksum) {
        console.log("generateSignature Returns: " + checksum);
        console.log("*******************************************", params);
        let paytmParams = {
          ...params,
          // ----------string  "CHECKSUMHASH": checksum,
          CHECKSUMHASH: checksum,
        };

        res.json(paytmParams);
      })
      .catch(function (error) {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Error in payment gatway",
      error,
    });
  }
};
