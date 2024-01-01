import userModel from "../models/userModel.js";
import { hashPassword, comparePassword } from "../helpers/authHelper.js";
import JWT from "jsonwebtoken";

//Register controller POST --- http://localhost:8080/api/v1/auth/register
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;
    // console.log(req.body);
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User already exists",
      });
    }
    //register user
    const hashedPassword = await hashPassword(password);
    const user = new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    });
    await user.save();

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log("Error in registering user: ", error);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//LOGIN Controller ---- POST  --- http://localhost:8080/api/v1/auth/login
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password);
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User does not exist",
      });
    }
    //check password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(400).send({
        success: false,
        message: "Incorrect Password",
      });
    }
    //generate token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    //send token in response
    res.status(200).send({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.log("Error in login user: ", error);
    res.status(500).send({
      success: false,
      message: "Error in login user",
      error: error.message,
    });
  }
};

//Forgot Password Controller
export const forgotPasswordController = async (req, res) => {
  try {
    // console.log(req.body);
    const { email, newPassword, answer } = req.body;
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "email are required",
      });
    }
    if (!newPassword) {
      return res.status(400).send({
        success: false,
        message: "newPassword are required",
      });
    }
    if (!answer) {
      return res.status(400).send({
        success: false,
        message: "answer are required",
      });
    }
    //check
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong email or Answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    return res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong in Forgot password",
      error,
    });
  }
};

//Test Controller ---- GET  --- http://localhost:8080/api/v1/auth/test
export const testConteller = (req, res) => {
  console.log("Test controller");
  res.send("Test controller");
};

//Update Profile Controller ---- PUT  --- http://localhost:8080/api/v1/auth/profile
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    const user = await userModel.findById(req.user._id);

    if (password && password.length < 6) {
      return res.json({
        error: "Password should be min 6 characters long",
      });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updateUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "User profile updated successfully",
      updateUser,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      message: "Something went wrong in update profile",
      error,
    });
  }
};
