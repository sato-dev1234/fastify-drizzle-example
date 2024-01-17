import { ContactEntity } from "./contact.schema ";
import { user } from "./schema";

export type User = typeof user;
export type NewUser = typeof user.$inferInsert;
export type UserEntity = typeof user.$inferSelect;

export interface UserWithRelations extends UserEntity {
  contacts: ContactEntity[];
}
