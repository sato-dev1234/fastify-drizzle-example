import { z } from "zod";

import {
  primaryKeyForBody,
  nullableString,
  japanPhoneNumberType,
} from "../base.schema";

export const contactItems = {
  phoneNumber: japanPhoneNumberType,
  email: nullableString(z.string().email()),
};

export const contactInsertSchema = z.object({
  ...contactItems,
});

export const contactUpdateSchema = z.object({
  ...primaryKeyForBody,
  ...contactItems,
});

export const contactSelectSchema = z.object({
  ...primaryKeyForBody,
  ...contactItems,
});

export type ContactInsertSchema = z.infer<typeof contactInsertSchema>;
export type ContactUpdateSchema = z.infer<typeof contactUpdateSchema>;
export type ContactSelectSchema = z.infer<typeof contactSelectSchema>;
