import { isValidPhoneNumber } from "libphonenumber-js";
import { ZodType, z } from "zod";

export const japanPhoneNumberType = z
  .string()
  .refine((val) => isValidPhoneNumber(val, "JP"), {
    message: "利用できない電話番号が入力されました。",
  });

export const nullableString = (stringType: ZodType) =>
  stringType
    .nullish()
    .transform((val: string | null | undefined) => val ?? null);

export const primaryKeyForQuery = {
  id: z
    .string()
    .min(1, { message: "IDは必須です。" })
    .transform((val) => parseInt(val, 10))
    .refine((val) => !Number.isNaN(val), {
      message: "数値での入力を期待していますが、文字列が入力されました。",
    }),
};

export const primaryKeyForBody = {
  id: z.number(),
};

export const primaryKeySchemaForQuery = z.object(primaryKeyForQuery);
export const primaryKeySchemaForBody = z.object(primaryKeyForBody);

export type PrimaryKeySchemaForQuery = z.infer<typeof primaryKeySchemaForQuery>;
export type PrimaryKeySchemaForBody = z.infer<typeof primaryKeySchemaForBody>;
