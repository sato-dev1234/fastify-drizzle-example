import { z } from "zod";

import { primaryKeyForBody } from "../base.schema";

export const userColumns = {
  firstName: z.string().max(256).min(1),
  lastName: z.string().max(256).min(1),
};

export const userInsertSchema = z.object({
  ...userColumns,
});

export const userUpdateSchema = z.object({
  ...primaryKeyForBody,
  ...userColumns,
});

export const userSelectSchema = z.object({
  ...primaryKeyForBody,
  ...userColumns,
});

export type UserInsertSchema = z.infer<typeof userInsertSchema>;
export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;
export type UserSelectSchema = z.infer<typeof userSelectSchema>;
