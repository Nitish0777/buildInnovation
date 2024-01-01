import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

//protected routes token verification
export const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    console.log("token fron BE", token);
    if (!token) {
      return res.status(400).send({
        success: false,
        message: "No token provided",
      });
    }
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in authenticating user",
      errorMessage: error.message,
    });
  }
};

//admin routes token verification
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Admin resource. Access denied",
      });
    }
    next();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in authenticating user",
      errorMessage: error.message,
    });
  }
};
