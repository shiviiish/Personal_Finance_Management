import mongoose from "mongoose";

const TransSchema= new mongoose.Schema({
    category:{
        type : String,
        required: true,
    },
    amount:{
        type: Number,
        required:true,
    },
    date:{
        type:Date,
        required:true,
    },
    name:{
        type:String,
        required:true
    }
});

export const Transaction=mongoose.model('Transaction',TransSchema);
