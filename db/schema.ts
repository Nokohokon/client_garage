import { pgTable, text, timestamp, boolean, uuid, pgEnum } from "drizzle-orm/pg-core";

// Status Enum für deine Farben (Success, Warning, Danger)
export const statusEnum = pgEnum('status', ['LEAD', 'ACTIVE', 'ARCHIVED', 'PENDING']);

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Better Auth ID
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  status: statusEnum("status").default('LEAD'),
  responsiblePersonId: text("responsible_person_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  finished: boolean("finished").default(false),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: 'cascade' }),
  userId: text("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});