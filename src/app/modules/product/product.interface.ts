import { Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  weight: number | null;
  offerPrice?: number | null;
  category: Types.ObjectId;
  imageUrls: string[];
  isActive: boolean;
  shop: Types.ObjectId;
  brand: {_id:Types.ObjectId,name:string;};
  averageRating?: number;
  ratingCount?: number;
  availableColors: string[];
  specification: Record<string, any>;
  keyFeatures: string[];
  createdAt?: Date;
  updatedAt?: Date;
  reviews?: Record<string, any> | [];

  calculateOfferPrice(): Promise<number | null>;
}
