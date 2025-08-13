import {
  users,
  invitationCodes,
  type User,
  type InsertUser,
  type InvitationCode,
  type InsertInvitationCode,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  
  // Invitation operations
  createInvitationCode(invitation: InsertInvitationCode): Promise<InvitationCode>;
  getInvitationByCode(code: string): Promise<InvitationCode | undefined>;
  markInvitationAsUsed(code: string, userId: string): Promise<void>;
  getInvitationsByCreator(creatorId: string): Promise<InvitationCode[]>;
  revokeInvitation(id: string): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getUserStats(): Promise<{
    totalUsers: number;
    activeInvitations: number;
    newThisWeek: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // Invitation operations
  async createInvitationCode(invitation: InsertInvitationCode): Promise<InvitationCode> {
    const [invitationCode] = await db
      .insert(invitationCodes)
      .values(invitation)
      .returning();
    return invitationCode;
  }

  async getInvitationByCode(code: string): Promise<InvitationCode | undefined> {
    const [invitation] = await db
      .select()
      .from(invitationCodes)
      .where(eq(invitationCodes.code, code));
    return invitation;
  }

  async markInvitationAsUsed(code: string, userId: string): Promise<void> {
    await db
      .update(invitationCodes)
      .set({ isUsed: true, usedBy: userId, usedAt: new Date() })
      .where(eq(invitationCodes.code, code));
  }

  async getInvitationsByCreator(creatorId: string): Promise<InvitationCode[]> {
    return await db
      .select({
        id: invitationCodes.id,
        code: invitationCodes.code,
        isUsed: invitationCodes.isUsed,
        usedBy: invitationCodes.usedBy,
        createdBy: invitationCodes.createdBy,
        createdAt: invitationCodes.createdAt,
        usedAt: invitationCodes.usedAt,
        userEmail: users.email,
      })
      .from(invitationCodes)
      .leftJoin(users, eq(invitationCodes.usedBy, users.id))
      .where(eq(invitationCodes.createdBy, creatorId))
      .orderBy(desc(invitationCodes.createdAt));
  }

  async revokeInvitation(id: string): Promise<void> {
    await db.delete(invitationCodes).where(eq(invitationCodes.id, id));
  }

  async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        role,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeInvitations: number;
    newThisWeek: number;
  }> {
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    
    const [activeInvitationCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(invitationCodes)
      .where(eq(invitationCodes.isUsed, false));
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const [newUsersCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`${users.createdAt} >= ${oneWeekAgo}`);

    return {
      totalUsers: userCount.count,
      activeInvitations: activeInvitationCount.count,
      newThisWeek: newUsersCount.count,
    };
  }
}

export const storage = new DatabaseStorage();
