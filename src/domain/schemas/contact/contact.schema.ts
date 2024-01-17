import { z } from "zod";

import {
  primaryKeyForBody,
  nullableString,
  japanPhoneNumberType,
} from "../base.schema";

export const contactColumns = {
  phoneNumber: japanPhoneNumberType,
  email: nullableString(z.string().email()),
};

export const contactInsertSchema = z.object({
  ...contactColumns,
});

export const contactUpdateSchema = z.object({
  ...primaryKeyForBody,
  ...contactColumns,
});

export const contactSelectSchema = z.object({
  ...primaryKeyForBody,
  ...contactColumns,
});

export type ContactInsertSchema = z.infer<typeof contactInsertSchema>;
export type ContactUpdateSchema = z.infer<typeof contactUpdateSchema>;
export type ContactSelectSchema = z.infer<typeof contactSelectSchema>;
