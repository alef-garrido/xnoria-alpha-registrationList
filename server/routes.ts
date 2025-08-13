import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getSession, isAuthenticated, isAdmin, hashPassword, verifyPassword } from "./auth";
import { registerUserSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'INV-';
  for (let i = 0; i < 9; i++) {
    if (i === 3 || i === 6) result += '';
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(getSession());

  // Seed admin user on startup
  try {
    const adminUser = await storage.getUserByEmail('admin@example.com');
    if (!adminUser) {
      const hashedPassword = await hashPassword('admin123');
      await storage.createUser({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      });
      console.log('Demo admin user created: admin@example.com / admin123');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await verifyPassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.userId = user.id;
      res.json({ 
        message: "Login successful", 
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      
      // Check if invitation code exists and is unused
      const invitation = await storage.getInvitationByCode(validatedData.invitationCode);
      if (!invitation || invitation.isUsed) {
        return res.status(400).json({ message: "Invalid or expired invitation code" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password and create new user
      const hashedPassword = await hashPassword(validatedData.password);
      const newUser = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: 'user',
      });

      // Mark invitation as used
      await storage.markInvitationAsUsed(validatedData.invitationCode, newUser.id);

      const { password, ...userWithoutPassword } = newUser;
      res.json({ message: "User registered successfully", user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Admin routes - Invitation management
  app.post('/api/admin/invitations', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.user!.id;
      const code = generateInvitationCode();
      
      const invitation = await storage.createInvitationCode({
        code,
        createdBy: userId,
        isUsed: false,
      });

      res.json(invitation);
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ message: "Failed to create invitation code" });
    }
  });

  app.get('/api/admin/invitations', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.user!.id;
      const invitations = await storage.getInvitationsByCreator(userId);
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.delete('/api/admin/invitations/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.revokeInvitation(req.params.id);
      res.json({ message: "Invitation revoked successfully" });
    } catch (error) {
      console.error("Error revoking invitation:", error);
      res.status(500).json({ message: "Failed to revoke invitation" });
    }
  });

  // Admin routes - User management
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Update user role (admin only)
  app.patch('/api/admin/users/:id/role', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Validate role
      if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be "admin" or "user"' });
      }

      // Prevent admin from demoting themselves
      if (id === req.user!.id && role === 'user') {
        return res.status(400).json({ message: 'Cannot demote yourself from admin role' });
      }

      const updatedUser = await storage.updateUserRole(id, role);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ message: 'User role updated successfully', user: userWithoutPassword });
    } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).json({ message: 'Failed to update user role' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
