import mongoose from "mongoose";
import { IImageFile } from "../../interface/IImageFile";
import { IShop } from "./shop.interface";
import { IJwtPayload } from "../auth/auth.interface";
import User from "../user/user.model";
import AppError from "../../errors/appError";
import { StatusCodes } from "http-status-codes";
import Shop from "./shop.model";

const createShop = async (shopData: Partial<IShop>, logo: IImageFile, authUser: IJwtPayload) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the user already exists by email
    const existingUser = await User.findById(authUser.userId).session(session);

    if (!existingUser) {
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'User is not exists!');
    }

    if (!existingUser.isActive) {
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'User is not active!');
    }

    if (logo) {
      shopData.logo = logo.path
    }

    const shop = new Shop({
      ...shopData,
      user: existingUser._id
    });

    const createdShop = await shop.save({ session });

    await User.findByIdAndUpdate(
      existingUser._id,
      { hasShop: true },
      { new: true, session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return createdShop;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};


const updateShop = async (
  shopId: string, 
  shopData: Partial<IShop>, 
  logo: IImageFile, 
  authUser: IJwtPayload
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Verify User and Shop Ownership
    const existingShop = await Shop.findById(shopId).session(session);

    if (!existingShop) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Shop not found!');
    }

    // Ensure the person updating is the owner
    if (existingShop.user!.toString() !== authUser.userId) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not authorized to update this shop!');
    }

    // 2. Handle Logo update
    // Only update the logo field if a new file was actually uploaded
    if (logo) {
      shopData.logo = logo.path;
    }

    // 3. Perform the update
    // We use { new: true } to return the modified document
    // We use { runValidators: true } to ensure Zod-like validation happens at DB level
    const updatedShop = await Shop.findByIdAndUpdate(
      shopId,
      { $set: shopData },
      { new: true, runValidators: true, session }
    );

    if (!updatedShop) {
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update shop!');
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return updatedShop;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getMyShop = async (authUser: IJwtPayload) => {
  const existingUser = await User.checkUserExist(authUser.userId);
  if (!existingUser.hasShop) {
    throw new AppError(StatusCodes.NOT_FOUND, "You have no shop!")
  }

  const shop = await Shop.findOne({ user: existingUser._id }).populate('user');
  return shop;
}

export const ShopService = {
  createShop,
  getMyShop,
  updateShop
}