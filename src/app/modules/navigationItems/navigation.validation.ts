import { z } from 'zod';

// 1. Define the recursive NavItem schema first


const navItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().optional(), // Added this to match your JSON
    data: z.object({
        title: z
            .string()
            .min(1, "Title is required")
            .max(50, "Title is too long"),
        // URL removed from here if it's top-level, or kept if it belongs here
        category: z.array(z.string()).default([]),
        type: z.enum(['link', 'category', 'mega-menu']),
    }),
    url: z.string().optional(), // Moved here to match standard tree structures
    isOpenNewTab: z.boolean().default(false),
    children: z.array(navItemSchema).default([]),
  })
);

// 2. Define the main Navigation validation schema
// Remove the nested "body" object. 
// Validate the data directly.


export const createNavigationValidationSchema = z.object({
  body: z.object({
  menuName: z
    .string()
    .min(1, "Menu name is required")
    .max(100, "Menu name is too long"),
  isActive: z.boolean().optional().default(true),
  items: z.array(navItemSchema).nonempty("At least one menu item is required"),
  })
});