import express from "express";
import { registerUser, verifyOTP, loginUser ,logoutUser} from "../controller/userController";

const router = express.Router();

router.post("/register", registerUser); 
router.post("/verify-otp", verifyOTP); 
router.post("/login", loginUser); 
router.post("/logout", logoutUser);

export default router;
