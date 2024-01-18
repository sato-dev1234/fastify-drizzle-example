import { z } from "zod";

import { primaryKeyForBody } from "../base.schema";

export const userItems = {
  firstName: z.string().max(256).min(1),
  lastName: z.string().max(256).min(1),
};

export const userInsertSchema = z.object({
  ...userItems,
});

export const userUpdateSchema = z.object({
  ...primaryKeyForBody,
  ...userItems,
});

export const userSelectSchema = z.object({
  ...primaryKeyForBody,
  ...userItems,
});

export type UserInsertSchema = z.infer<typeof userInsertSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
export type UserSelectSchema = z.infer<typeof userSelectSchema>;
