// import jwt from "jsonwebtoken";
// import { Request, Response, NextFunction } from "express";
// import { User } from "../models/UserSchema";

// interface AuthRequest extends Request {
//   user?: any;
// }

// export const isAuthorized = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   try {
//     // const authHeader = req.headers["authorization"];
//     // if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     //   return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
//     // }

//     // const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
//     const token = req.cookies?.userToken; // Token is stored in cookies

//     if (!token) {
//       return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
//     }

//     console.log("User from token:", req.user);

//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { id: string };

//     req.user = await User.findById(decoded.id).select("-password");
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
//     }

//     next();
//   } catch (error) {
//     res.status(401).json({ success: false, message: `Unauthorized: ${error}` });
//   }
// };

// export default isAuthorized;
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/UserSchema";

interface AuthRequest extends Request {
  user?: any;
}

export const isAuthorized = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log("Authorization Middleware Hit");
    console.log("Headers:", req.headers);

    // Ensure token is in Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No token provided");
      return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token);

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { id: string };
    console.log("Decoded Token:", decoded);

    // Find user in DB
    req.user = await User.findById(decoded.id).select("-password");
    console.log("User from DB:", req.user);

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: User not found" });
    }

    next();
  } catch (error) {
    console.log("Error in isAuthorized:", error);
    res.status(401).json({ success: false, message: `Unauthorized: ${error}` });
  }
};

export default isAuthorized;
