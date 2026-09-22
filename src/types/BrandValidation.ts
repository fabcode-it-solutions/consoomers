import { z } from "zod";
export const BrandIntakeSchema = z.object({
  email: z.string().email("Must be a valid email"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  position: z.string().min(1, "Required"),
  brandName: z.string().min(1, "Required"),
  website: z.string().url("Must be a valid URL"),
  category: z.string().min(1, "Select a category"),
  sellingInUS: z.string().min(1, "Select an option"),
  goals: z.array(z.string()).min(1, "Choose at least one goal"),
  agreeTos: z.literal(true, {
    message: "You must agree to the terms",
  }),
});

export type BrandIntakeValues = z.infer<typeof BrandIntakeSchema>;
