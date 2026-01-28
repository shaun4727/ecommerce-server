import { z } from 'zod';

// 1. Define the recursive NavItem schema first
const navItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(50, "Title is too long"),
    url: z.string().optional(),
    category: z.string().optional().nullable(), // For Category ObjectId
    type: z.enum(['link', 'category', 'mega-menu']),
    isOpenNewTab: z.boolean().default(false),
    // This allows children to follow the same validation rules
    children: z.array(navItemSchema).default([]),
  })
);

// 2. Define the main Navigation validation schema
export const createNavigationValidationSchema = z.object({
  body: z.object({
    menuName: z
      .string()
      .min(1, "Menu name is required")
      .max(100, "Menu name is too long"),
    isActive: z.boolean().optional().default(true),
    // The items array will contain our recursive nav items
    items: z.array(navItemSchema).nonempty("At least one menu item is required"),
  }),
});