import { Document, Types,Model } from "mongoose";

export interface IBrand extends Document {
  name: string;
  logo: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BrandModel extends Model<IBrand> {
  findWithProducts(limit?: number): Promise<IBrand[]>;
}