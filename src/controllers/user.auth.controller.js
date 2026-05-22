import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asynHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({ email });

  if (user) {
    throw new ApiError(409, "User already exists");
  }

  const createdUser = await User.create({
    name,
    email,
    password,
  });

  createdUser.password = undefined;

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Invalid credentials");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new ApiError(400, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken()
  console.log(accessToken);
  

  const refreshToken = user.generateRefreshToken()
  
  
  user.refreshToken = refreshToken;

  await user.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "User loggedIn successfully", {
        id: user._id,
        email: user.email,
        role: user.role,
      })
    );
});

const refresh = asyncHandler( async (req,res) => {
 
    const incomingToken  = req.cookies.refreshToken

    if(!incomingToken){
        throw new ApiError(401, 'No refresh token')
    }

    const decoded = jwt.verify(incomingToken,env.JWT_REFRESH_SECRET)

    const user = await User.findById(decoded.id)

    if(!user || user.refreshToken !== incomingToken){
        throw new ApiError(401,"Invalid refresh token")
    }

    const newAccessToken = jwt.sign({id:user._id,email:user.email,role:user.role},env.JWT_SECRET,{expiresIn:'15m'})

    res.cookie("accessToken",newAccessToken,{
        httpOnly:true,
        secure:true,
        maxAge: 15 * 60 * 1000,
    })

    return res.status(200).json(new ApiResponse(200,"Access token refreshed"))

})

const logoutUser = asyncHandler(async (req,res) => {

    const id = req.user._id

    await User.findByIdAndUpdate(id,{
        $unset:{refreshToken:1}
    })

    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")


    return res.status(200).json(new ApiResponse(200,"User logged out successfully"))
})

const controller = {
  registerUser,
  loginUser,
  logoutUser,
  refresh,
};

export default controller;
