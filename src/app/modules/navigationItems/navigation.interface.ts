import { Types } from "mongoose";

export interface INavItem {
  title: string;          // Display name (e.g., "Men's Fashion")
  url?: string;           // Custom URL if not a category
  category?: Types.ObjectId; // Reference to your ICategory
  type: 'link' | 'category' | 'mega-menu'; 
  children: INavItem[];   // The nested tree structure
  isOpenNewTab: boolean;
}

export interface INavigation extends Document {
  menuName: string;       // e.g., "Main Header"
  items: INavItem[];
  isActive: boolean;
}