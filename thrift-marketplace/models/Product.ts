import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  size: string;
  brand: string;
  condition: "new" | "like-new" | "good" | "fair" | "poor";
  images: string[];
  sellerId: Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    size: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    condition: {
      type: String,
      enum: ["new", "like-new", "good", "fair", "poor"],
      required: true,
    },
    images: [{ type: String }],
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ProductSchema.index({ status: 1, price: 1 });
ProductSchema.index({ sellerId: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
