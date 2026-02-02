import { model, Schema } from "mongoose";
import { INavigation, INavItem } from "./navigation.interface";

// Define the base schema without the children first
const navItemSchema = new Schema<INavItem>({
  
  data:{title: { type: String, required: true },category: [{ type: Schema.Types.ObjectId, ref: 'Category' }],  type: { 
    type: String, 
    enum: ['link', 'category', 'mega-menu'], 
    default: 'link' 
  },},
  url: { type: String },
  

  isOpenNewTab: { type: Boolean, default: false },
});

// Use .add() to add the recursive children property
navItemSchema.add({
  children: [navItemSchema] 
});

const NavigationSchema = new Schema<INavigation>({
  menuName: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  items: [navItemSchema]
}, { timestamps: true });




export const Navigation = model<INavigation>('Navigation', NavigationSchema);