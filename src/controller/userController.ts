
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/UserSchema";
import { sendOTP } from "../utils/sendEmail";
import ErrorHandler from "../middlewares/errormiddleware";
import { catchAsyncError } from "../middlewares/asyncerror";
import { generateToken } from "../utils/jwt";

const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();

export const registerUser = catchAsyncError(

  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { firstname, lastname, Email, Password,isVerified } = req.body;
                  
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      const existingUser = await User.findOne({ Email });
      if (existingUser) {
        if (!existingUser.isVerified) {
          existingUser.otp = otp;
          existingUser.otpExpires = otpExpires;
          await existingUser.save();
          await sendOTP(Email, otp);

          res
            .status(200)
            .json({ message: "New OTP sent. Please verify your email." });
            return;
        }
        res.status(400).json({ message: "User already exists" });
        return ;
      }
        
      const newUser = new User({
        firstname,
        lastname,
        Email,
        Password,
        otp,
        otpExpires,
        isVerified: false,
      });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(Password, salt);

      await User.create({ firstname, lastname, Email, Password : hashedPassword,otp,otpExpires});
      await sendOTP(Email, otp);
      

      res.status(200).json({ message: "OTP sent to email. Please verify." });
    } catch (error) {
      res.status(500).json({ message: `${error}` });
    }
  });

export const verifyOTP = catchAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { Email, otp } = req.body;
    console.log("Verifying OTP for:", Email, "with OTP:", otp);

    const user = await User.findOne({ Email });
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    };

    if (user.otp !== otp.toString() || new Date() > user.otpExpires!) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    };
    
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();
    res.status(200).json({ message: "Email verified. You can now login." });
  } catch (error) {
    res.status(500).json({ message: `${error}` });
  }
});

export const loginUser = catchAsyncError(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { Email, Password } = req.body;

    // Find user and ensure they are verified
    const user = await User.findOne({ Email }).select("+Password");
    if (!user || !user.isVerified) {
      res.status(400).json({ message: "User not found or not verified" });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY as string, {
      expiresIn: "7d",
    });

    console.log("Generated Token:", token);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
      token, // Return the token to be used in frontend
    });
  } catch (error) {
    res.status(500).json({ message: `${error}` });
  }
});


export const logoutUser = (req: Request, res: Response) => {
  res
    .status(200)
    .clearCookie("userToken", { httpOnly: true, secure: true, sameSite: "none" }) 
    .json({ success: true, message: "Logged out successfully" });
};

