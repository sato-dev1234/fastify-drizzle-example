import { z } from "zod";

import {
  contactInsertSchema,
  contactUpdateSchema,
  contactSelectSchema,
} from "../contact/contact.schema";
import {
  userInsertSchema,
  userUpdateSchema,
  userSelectSchema,
} from "../user/user.schema";

import { UserWithRelations } from "@/infrastructure/db/user.schema";

export const profileInsertSchema = z.object({
  user: userInsertSchema,
  contacts: z.array(contactInsertSchema),
});

export const profileUpdateSchema = z.object({
  user: userUpdateSchema,
  contacts: z.array(contactUpdateSchema),
});

export const profileSelectSchema = z.object({
  user: userSelectSchema,
  contacts: z.array(contactSelectSchema),
});

export type ProfileInsertSchema = z.infer<typeof profileInsertSchema>;
export type ProfileUpdateSchema = z.infer<typeof profileUpdateSchema>;
export type ProfileSelectSchema = z.infer<typeof profileSelectSchema>;

export const toUserSelectSchema = (entity: UserWithRelations) => ({
  user: {
    id: entity.id,
    firstName: entity.firstName,
    lastName: entity.lastName,
  },
  contacts: entity.contacts.map((contactEntity) => ({
    id: contactEntity.id,
    phoneNumber: contactEntity.phoneNumber,
    email: contactEntity.email,
  })),
});

export const toUserSelectSchemas = (entities: UserWithRelations[]) =>
  entities.map((entity: UserWithRelations) => ({
    user: {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
    },
    contacts: entity.contacts.map((contactEntity) => ({
      id: contactEntity.id,
      phoneNumber: contactEntity.phoneNumber,
      email: contactEntity.email,
    })),
  }));
