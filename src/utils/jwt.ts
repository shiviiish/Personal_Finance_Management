// src/utils/jwt.ts
import { Response } from "express";
import jwt from "jsonwebtoken";

// Define the user interface that our token function expects.
export interface IAppUser {
  _id: string;
  firstname: string;
  lastname: string;
  Email: string;
  Password: string;
  isVerified: boolean;
  otp: string;
}

export const generateToken = (
  user: IAppUser,
  message: string,
  statusCode: number,
  res: Response
): Response => {
  // Since your schema doesn't include role, use a fixed cookie name.
  const cookieName = "userToken"; 

  // Create the token from the user's _id.
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });

  // Use COOKIE_EXPIRE (in days) from env, defaulting to 1 day.
  const cookieExpireDays = Number(process.env.COOKIE_EXPIRE) || 1;
  const expires = new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000);

  return res
    .status(statusCode)
    .cookie(cookieName, token, {
      expires,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};
