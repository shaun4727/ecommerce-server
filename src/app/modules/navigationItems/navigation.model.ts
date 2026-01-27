import { model, Schema } from "mongoose";
import { INavigation, INavItem } from "./navigation.interface";

const navItemSchema = new Schema<INavItem>({
  title: { type: String, required: true },
  url: { type: String },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  type: { 
    type: String, 
    enum: ['link', 'category', 'mega-menu'], 
    default: 'link' 
  },
  isOpenNewTab: { type: Boolean, default: false },
  // Recursive definition:
  children: [this] 
});

const NavigationSchema = new Schema<INavigation>({
  menuName: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  items: [navItemSchema]
}, { timestamps: true });

export const Navigation = model<INavigation>('Navigation', NavigationSchema);