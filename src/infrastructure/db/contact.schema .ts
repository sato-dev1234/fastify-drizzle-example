import { contact } from "./schema";

export type Contact = typeof contact;
export type NewContact = typeof contact.$inferInsert;
export type ContactEntity = typeof contact.$inferSelect;
