import { pgTable, text, timestamp, boolean, uuid, pgEnum, decimal } from "drizzle-orm/pg-core";

// Status Enums
export const statusEnum = pgEnum('status', ['LEAD', 'ACTIVE', 'ARCHIVED', 'PENDING']);
export const clientTypeEnum = pgEnum('client_type', ['person', 'organization']);

// ==========================================
// BETTER AUTH CORE TABLES
// ==========================================

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    initialized: boolean("initialized").notNull().default(false), // Dein Zusatzfeld
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId").notNull().references(() => user.id),
    activeOrganizationId: text("activeOrganizationId"), // Wichtig für Org-Plugin
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId").notNull().references(() => user.id),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt").notNull(),
    updatedAt: timestamp("updatedAt").notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt"),
    updatedAt: timestamp("updatedAt"),
});

// ==========================================
// BETTER AUTH ORGANIZATION & TEAM TABLES
// ==========================================

export const organization = pgTable("organization", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique(),
    logo: text("logo"),
    createdAt: timestamp("createdAt").notNull(),
    metadata: text("metadata"),
});

export const member = pgTable("member", {
    id: text("id").primaryKey(),
    organizationId: text("organizationId").notNull().references(() => organization.id),
    userId: text("userId").notNull().references(() => user.id),
    role: text("role").notNull(),
    createdAt: timestamp("createdAt").notNull(),
});

export const invitation = pgTable("invitation", {
    id: text("id").primaryKey(),
    organizationId: text("organizationId").notNull().references(() => organization.id),
    email: text("email").notNull(),
    role: text("role"),
    status: text("status").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    inviterId: text("userId").notNull().references(() => user.id),
});

export const team = pgTable("team", {
    id: text("id").primaryKey(),
    organizationId: text("organizationId").notNull().references(() => organization.id),
    name: text("name").notNull(),
    createdAt: timestamp("createdAt").notNull(),
    metadata: text("metadata"),
});

// ==========================================
// BUSINESS TABLES (Client Garage / Unit Blueprint)
// ==========================================

export const clients = pgTable("clients", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email"),
    status: statusEnum("status").default('LEAD'),
    type: clientTypeEnum("type").default('person'),
    hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).default("0.00"),
    responsiblePersonId: text("responsible_person_id").references(() => user.id),
    responsibleOrganizationId: text("responsible_organization_id").references(() => organization.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    finished: boolean("finished").default(false),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: 'cascade' }),
    userId: text("user_id").references(() => user.id),
    organizationId: text("organization_id").references(() => organization.id),
    createdAt: timestamp("created_at").defaultNow(),
});

export const actions = pgTable("actions", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id),
    actionType: text("action_type").notNull(),
    description: text("description").notNull(),
    timestamp: timestamp("timestamp").defaultNow(),
});