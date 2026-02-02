import { Types } from "mongoose";

export interface INavItem {
 
  data:{
    title: string;
    type?: 'link' | 'category' | 'mega-menu'; 
    category?: Types.ObjectId[];
  },       // Display name (e.g., "Men's Fashion")
  url?: string;           // Custom URL if not a category
 // Reference to your ICategory

  children: INavItem[];   // The nested tree structure
  isOpenNewTab: boolean;
}

export interface INavigation extends Document {
  menuName: string;       // e.g., "Main Header"
  items: INavItem[];
  isActive: boolean;
}