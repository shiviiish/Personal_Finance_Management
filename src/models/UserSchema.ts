import mongoose from "mongoose";
import validator from "validator";

const UserSchema = new mongoose.Schema(
    {
        firstname:{
            type : String,
            required: true,
            minlength:[3,"First name must contain at least 3 characters"],
        },
        lastname:{
            type : String,
            required: true,
            minlength:[3,"last name must contain at least 3 characters"],
        },
        Email:{
            type:String,
            validate:[validator.isEmail,"Please provide a valid email"]
        },
        Password:{
            type: String,
            required:true,
            select:false,
            minlength:[8,"Password must contain  at least 8 characters"]
        },
        otp:{
            type: String,
        },
        otpExpires:{
            type:Date,
        },
        isVerified:{
            type: Boolean,
            default : false
        }
    }
)



export const User=mongoose.model("User",UserSchema);