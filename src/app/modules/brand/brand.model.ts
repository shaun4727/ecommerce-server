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
                    from: "products",
                    // let: { brandId: "$_id" },
                    localField: "_id",
                    foreignField:"brand._id",
                    // pipeline: [
                    //     {
                    //     $match: {
                    //         $expr: {
                    //         $eq: ["$brand._id", "$$brandId"]
                    //         }
                    //     }
                    //     }
                    // ],
                    as: "products"
                    }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        products: 1
                    }
                }

                    
    //   $lookup: {
    //     from: 'courses',
    //     localField: 'course',
    //     foreignField: '_id',
    //     as: 'enrolledCourseData',
    //   },
    // },
    // {
    //   $unwind: '$enrolledCourseData',
    // },
    // {
    //   $group: {
    //     _id: null,
    //     totalEnrolledCredits: { $sum: '$enrolledCourseData.credits' },
    //   },
    // },
    // {
    //   $project: {
    //     _id: 0,
    //     totalEnrolledCredits: 1,
    //   },
    // },
            ]);


  return brandsWithProducts;
};

export const Brand = model<IBrand, BrandModel>("Brand", brandSchema);
