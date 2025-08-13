import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for express sessions
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with email/password authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").notNull().default("user"), // "admin" or "user"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invitation codes table
export const invitationCodes = pgTable("invitation_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  isUsed: boolean("is_used").notNull().default(false),
  usedBy: varchar("used_by").references(() => users.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdInvitations: many(invitationCodes, { relationName: "createdBy" }),
  usedInvitation: many(invitationCodes, { relationName: "usedBy" }),
}));

export const invitationCodesRelations = relations(invitationCodes, ({ one }) => ({
  creator: one(users, { 
    fields: [invitationCodes.createdBy], 
    references: [users.id],
    relationName: "createdBy"
  }),
  user: one(users, { 
    fields: [invitationCodes.usedBy], 
    references: [users.id],
    relationName: "usedBy"
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvitationCodeSchema = createInsertSchema(invitationCodes).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  invitationCode: z.string().min(1, "Invitation code is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInvitationCode = z.infer<typeof insertInvitationCodeSchema>;
export type InvitationCode = typeof invitationCodes.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerUserSchema>;
