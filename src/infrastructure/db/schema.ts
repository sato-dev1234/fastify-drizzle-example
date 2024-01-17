import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

const id = {
  id: serial("id").primaryKey(),
};
const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
};

const schemaBase = {
  ...id,
  ...timestamps,
};

export const user = pgTable("user", {
  ...schemaBase,
  firstName: varchar("first_name", { length: 256 }).notNull(),
  lastName: varchar("last_name", { length: 256 }).notNull(),
});

export const contact = pgTable("contact", {
  ...schemaBase,
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  email: varchar("email", { length: 256 }),
  userId: integer("user_id")
    .references(() => user.id)
    .notNull(),
});

export const usersRelations = relations(user, ({ many }) => ({
  contacts: many(contact),
}));

export const contactRelations = relations(contact, ({ one }) => ({
  user: one(user, {
    fields: [contact.userId],
    references: [user.id],
  }),
}));
