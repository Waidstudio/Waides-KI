import { db } from "../db";
import { eq, desc, and, or } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Chat tables schema
export const chatTickets = pgTable("chat_tickets", {
  id: serial("id").primaryKey(),
  ticketId: text("ticket_id").notNull().unique(),
  userId: text("user_id").notNull(),
  subject: text("subject").notNull(),
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("open"), // open, assigned, in_progress, resolved, closed
  category: text("category").notNull().default("general"), // technical, trading, billing, general
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActivity: timestamp("last_activity").defaultNow(),
  metadata: jsonb("metadata").default("{}"),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  messageId: text("message_id").notNull().unique(),
  ticketId: text("ticket_id").notNull(),
  content: text("content").notNull(),
  senderId: text("sender_id").notNull(),
  senderRole: text("sender_role").notNull(), // user, admin, moderator, system
  senderName: text("sender_name").notNull(),
  messageType: text("message_type").notNull().default("text"), // text, file, system
  status: text("status").notNull().default("sent"), // sent, delivered, read
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata").default("{}"),
});

export const chatNotifications = pgTable("chat_notifications", {
  id: serial("id").primaryKey(),
  notificationId: text("notification_id").notNull().unique(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, warning, success, error
  isRead: boolean("is_read").default(false),
  actionUrl: text("action_url"),
  timestamp: timestamp("timestamp").defaultNow(),
  expiresAt: timestamp("expires_at"),
  metadata: jsonb("metadata").default("{}"),
});

export const onlineUsers = pgTable("online_users", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  role: text("role").notNull(), // user, admin, moderator
  lastSeen: timestamp("last_seen").defaultNow(),
  status: text("status").notNull().default("online"), // online, offline, away, busy
  socketId: text("socket_id"),
});

export type ChatTicket = typeof chatTickets.$inferSelect;
export type InsertChatTicket = typeof chatTickets.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatNotification = typeof chatNotifications.$inferSelect;
export type InsertChatNotification = typeof chatNotifications.$inferInsert;
export type OnlineUser = typeof onlineUsers.$inferSelect;
export type InsertOnlineUser = typeof onlineUsers.$inferInsert;

class AdminChatService {
  // Ticket Management
  async createTicket(data: {
    userId: string;
    subject: string;
    priority?: string;
    category?: string;
    initialMessage: string;
  }): Promise<ChatTicket> {
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create ticket
    const [ticket] = await db.insert(chatTickets).values({
      ticketId,
      userId: data.userId,
      subject: data.subject,
      priority: data.priority || "medium",
      category: data.category || "general",
      status: "open"
    }).returning();

    // Create initial message
    await this.sendMessage({
      ticketId,
      content: data.initialMessage,
      senderId: data.userId,
      senderRole: "user",
      senderName: "User"
    });

    // Create system welcome message
    await this.sendMessage({
      ticketId,
      content: "Thank you for contacting support. An admin will respond shortly.",
      senderId: "system",
      senderRole: "system",
      senderName: "Support System",
      messageType: "system"
    });

    // Notify admins of new ticket
    await this.notifyAdmins({
      title: "New Support Ticket",
      message: `New ticket created: ${data.subject}`,
      type: "info",
      actionUrl: `/admin/chat/${ticketId}`
    });

    return ticket;
  }

  async getTicket(ticketId: string): Promise<ChatTicket | null> {
    const [ticket] = await db.select().from(chatTickets).where(eq(chatTickets.ticketId, ticketId));
    return ticket || null;
  }

  async getUserTickets(userId: string, limit: number = 20): Promise<ChatTicket[]> {
    return await db.select()
      .from(chatTickets)
      .where(eq(chatTickets.userId, userId))
      .orderBy(desc(chatTickets.lastActivity))
      .limit(limit);
  }

  async getAllTickets(filters?: {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
  }, limit: number = 50): Promise<ChatTicket[]> {
    let query = db.select().from(chatTickets);
    
    if (filters) {
      const conditions = [];
      if (filters.status) conditions.push(eq(chatTickets.status, filters.status));
      if (filters.priority) conditions.push(eq(chatTickets.priority, filters.priority));
      if (filters.category) conditions.push(eq(chatTickets.category, filters.category));
      if (filters.assignedTo) conditions.push(eq(chatTickets.assignedTo, filters.assignedTo));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }

    return await query.orderBy(desc(chatTickets.lastActivity)).limit(limit);
  }

  async updateTicketStatus(ticketId: string, status: string, assignedTo?: string): Promise<void> {
    const updates: any = { 
      status, 
      lastActivity: new Date() 
    };
    
    if (assignedTo !== undefined) {
      updates.assignedTo = assignedTo;
    }

    await db.update(chatTickets)
      .set(updates)
      .where(eq(chatTickets.ticketId, ticketId));
  }

  // Message Management
  async sendMessage(data: {
    ticketId: string;
    content: string;
    senderId: string;
    senderRole: string;
    senderName: string;
    messageType?: string;
  }): Promise<ChatMessage> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [message] = await db.insert(chatMessages).values({
      messageId,
      ticketId: data.ticketId,
      content: data.content,
      senderId: data.senderId,
      senderRole: data.senderRole,
      senderName: data.senderName,
      messageType: data.messageType || "text"
    }).returning();

    // Update ticket last activity
    await db.update(chatTickets)
      .set({ lastActivity: new Date() })
      .where(eq(chatTickets.ticketId, data.ticketId));

    // Notify relevant parties
    if (data.senderRole === "user") {
      await this.notifyAdmins({
        title: "New Message",
        message: `New message in ticket: ${data.ticketId}`,
        type: "info",
        actionUrl: `/admin/chat/${data.ticketId}`
      });
    } else if (data.senderRole === "admin" || data.senderRole === "moderator") {
      // Get ticket to find user
      const ticket = await this.getTicket(data.ticketId);
      if (ticket) {
        await this.createNotification({
          userId: ticket.userId,
          title: "Support Response",
          message: "You have a new response from support",
          type: "info",
          actionUrl: `/chat/${data.ticketId}`
        });
      }
    }

    return message;
  }

  async getTicketMessages(ticketId: string, limit: number = 100): Promise<ChatMessage[]> {
    return await db.select()
      .from(chatMessages)
      .where(eq(chatMessages.ticketId, ticketId))
      .orderBy(chatMessages.timestamp)
      .limit(limit);
  }

  async markMessagesRead(ticketId: string, userId: string): Promise<void> {
    await db.update(chatMessages)
      .set({ status: "read" })
      .where(
        and(
          eq(chatMessages.ticketId, ticketId),
          eq(chatMessages.senderId, userId)
        )
      );
  }

  // Notification Management
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    actionUrl?: string;
    expiresAt?: Date;
  }): Promise<ChatNotification> {
    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [notification] = await db.insert(chatNotifications).values({
      notificationId,
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || "info",
      actionUrl: data.actionUrl,
      expiresAt: data.expiresAt
    }).returning();

    return notification;
  }

  async getUserNotifications(userId: string, includeRead: boolean = false, limit: number = 20): Promise<ChatNotification[]> {
    let query = db.select().from(chatNotifications)
      .where(eq(chatNotifications.userId, userId));

    if (!includeRead) {
      query = query.where(
        and(
          eq(chatNotifications.userId, userId),
          eq(chatNotifications.isRead, false)
        )
      );
    }

    return await query
      .orderBy(desc(chatNotifications.timestamp))
      .limit(limit);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await db.update(chatNotifications)
      .set({ isRead: true })
      .where(eq(chatNotifications.notificationId, notificationId));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(chatNotifications)
      .set({ isRead: true })
      .where(eq(chatNotifications.userId, userId));
  }

  // Admin specific notifications
  async notifyAdmins(data: {
    title: string;
    message: string;
    type?: string;
    actionUrl?: string;
  }): Promise<void> {
    // Get all admin/moderator users
    const adminUsers = await this.getOnlineAdmins();
    
    // Create notification for each admin
    const notifications = adminUsers.map(admin => ({
      notificationId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: admin.userId,
      title: data.title,
      message: data.message,
      type: data.type || "info",
      actionUrl: data.actionUrl
    }));

    if (notifications.length > 0) {
      await db.insert(chatNotifications).values(notifications);
    }
  }

  // Online User Management
  async updateUserStatus(userId: string, role: string, status: string = "online", socketId?: string): Promise<void> {
    const existingUser = await db.select()
      .from(onlineUsers)
      .where(eq(onlineUsers.userId, userId))
      .limit(1);

    if (existingUser.length > 0) {
      await db.update(onlineUsers)
        .set({ 
          lastSeen: new Date(), 
          status,
          socketId: socketId || existingUser[0].socketId
        })
        .where(eq(onlineUsers.userId, userId));
    } else {
      await db.insert(onlineUsers).values({
        userId,
        role,
        status,
        socketId
      });
    }
  }

  async getOnlineAdmins(): Promise<OnlineUser[]> {
    return await db.select()
      .from(onlineUsers)
      .where(
        and(
          or(
            eq(onlineUsers.role, "admin"),
            eq(onlineUsers.role, "moderator")
          ),
          eq(onlineUsers.status, "online")
        )
      );
  }

  async getOnlineUsers(): Promise<OnlineUser[]> {
    return await db.select()
      .from(onlineUsers)
      .where(eq(onlineUsers.status, "online"));
  }

  async setUserOffline(userId: string): Promise<void> {
    await db.update(onlineUsers)
      .set({ 
        status: "offline",
        lastSeen: new Date()
      })
      .where(eq(onlineUsers.userId, userId));
  }

  // Statistics
  async getChatStats(): Promise<{
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
    avgResponseTime: number;
    onlineAdmins: number;
  }> {
    const tickets = await db.select().from(chatTickets);
    const onlineAdmins = await this.getOnlineAdmins();
    
    return {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => t.status === "open" || t.status === "assigned").length,
      resolvedTickets: tickets.filter(t => t.status === "resolved" || t.status === "closed").length,
      avgResponseTime: 15, // minutes - would calculate from actual data
      onlineAdmins: onlineAdmins.length
    };
  }
}

export const adminChatService = new AdminChatService();