import { Schema, model } from "mongoose";
import { IBrand, BrandModel } from "./brand.interface";

const brandSchema = new Schema<IBrand,BrandModel>(
  {
    name: {
      type: String,
      required: [true, "Brand name is required"],
      unique: true,
      trim: true,
    },
    logo: {
      type: String,
      required: [true, "Brand logo URL is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


brandSchema.statics.findWithProducts = async function (limit = 8) {
  const brandsWithProducts = await this.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'brand',
        as: 'products',
      },
    },
    {
      $match: {
        'products.0': { $exists: true },
      },
    },
    {
      $limit: limit,
    },
    {
      $project: {
        products: 0, // exclude products array if not needed
      },
    },
  ]);

  return brandsWithProducts;
};

export const Brand = model<IBrand, BrandModel>("Brand", brandSchema);
