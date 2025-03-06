import mongoose, { Schema, Document } from "mongoose";

// Define TypeScript interface for Category
export interface ICategory extends Document {
  userId: mongoose.Types.ObjectId; // To associate categories with a specific user
  name: string;
  type: "Income" | "Expense";
  symbol: string;
}

// Mongoose Schema for Category
const CategorySchema = new Schema<ICategory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Refers to the User model
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Ensure category names are unique for the user
    },
    type: {
      type: String,
      enum: ["Income", "Expense"],
      required: true,
    },
    symbol: {
      type: String,
      default: "🆕", // Default symbol if not provided
    },
  },
  { timestamps: true }
);

// Export the model
const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
