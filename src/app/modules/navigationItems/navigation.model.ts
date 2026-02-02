import { model, Schema, Query } from "mongoose";
import { INavigation, INavItem } from "./navigation.interface";

// 1. Define the base NavItem Schema
const navItemSchema = new Schema<INavItem>({
  data: {
    title: { type: String, required: true },
    category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    type: { 
      type: String, 
      enum: ['link', 'category', 'mega-menu'], 
      default: 'link' 
    },
  },
  url: { type: String },
  isOpenNewTab: { type: Boolean, default: false },
});

// 2. Add the recursive children property
navItemSchema.add({
  children: [navItemSchema] 
});

// 3. Define the auto-populate middleware with explicit 'this' typing
// Using Query<any, any> tells TypeScript that 'this' has the .populate() method
const autoPopulateCategories = function (this: Query<any, any>, next: (err?: Error) => void) {
  this.populate('data.category');
  next();
};

// 4. Attach middleware to navItemSchema for recursive levels
navItemSchema
  .pre('find', autoPopulateCategories)
  .pre('findOne', autoPopulateCategories);

// 5. Define the Main Navigation Schema
const NavigationSchema = new Schema<INavigation>({
  menuName: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  items: [navItemSchema]
}, { timestamps: true });

NavigationSchema.pre('find', function(this: Query<any, any>, next) {
  // Check for the skip flag
  if (this.getOptions().skipPopulate) {
    return next();
  }

  // Populate level 1 items and their categories
  // Then recursively populate children and their categories
  this.populate({
    path: 'items',
    populate: {
      path: 'data.category',
      model: 'Category'
    }
  }).populate({
    path: 'items.children',
    populate: {
      path: 'data.category',
      model: 'Category'
    }
  });
  
  next();
});

// Do the same for findOne
NavigationSchema.pre('findOne', function(this: Query<any, any>, next) {
  this.populate({
    path: 'items.data.category',
    model: 'Category'
  }).populate({
    path: 'items.children.data.category',
    model: 'Category'
  });
  next();
});

export const Navigation = model<INavigation>('Navigation', NavigationSchema);