import { db } from "../db";
import { eq, desc, and, or, sql, gte, lte, isNull } from "drizzle-orm";
import { 
  chatModerators, 
  chatRooms, 
  chatMessagesNew, 
  chatUsers, 
  chatFileUploads, 
  chatNotificationsNew,
  chatModerationActions,
  chatUserBans,
  chatRoomSettings,
  chatStatistics,
  users,
  type ChatModerator,
  type ChatRoom,
  type ChatMessageNew,
  type ChatUser,
  type ChatFileUpload,
  type ChatNotificationNew,
  type ChatModerationAction,
  type ChatUserBan,
  type ChatRoomSettings,
  type InsertChatModerator,
  type InsertChatRoom,
  type InsertChatMessage,
  type InsertChatUser,
  type InsertChatFileUpload,
  type InsertChatNotification,
  type InsertChatModerationAction,
  type InsertChatUserBan,
  type InsertChatRoomSettings
} from "@shared/schema";

class ComprehensiveChatService {
  // ===== MODERATOR MANAGEMENT =====
  
  async createModerator(data: InsertChatModerator): Promise<ChatModerator> {
    const [moderator] = await db.insert(chatModerators).values(data).returning();
    return moderator;
  }

  async getModerators(): Promise<ChatModerator[]> {
    return db.select().from(chatModerators).where(eq(chatModerators.isActive, true));
  }

  async getModeratorById(id: number): Promise<ChatModerator | undefined> {
    const [moderator] = await db.select().from(chatModerators).where(eq(chatModerators.id, id));
    return moderator;
  }

  async getModeratorByUserId(userId: number): Promise<ChatModerator | undefined> {
    const [moderator] = await db.select().from(chatModerators)
      .where(and(eq(chatModerators.userId, userId), eq(chatModerators.isActive, true)));
    return moderator;
  }

  async updateModeratorActivity(moderatorId: number): Promise<void> {
    await db.update(chatModerators)
      .set({ lastActiveAt: new Date() })
      .where(eq(chatModerators.id, moderatorId));
  }

  // ===== ROOM MANAGEMENT =====

  async createRoom(data: InsertChatRoom): Promise<ChatRoom> {
    const roomId = data.roomId || `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [room] = await db.insert(chatRooms).values({ ...data, roomId }).returning();
    
    // Create default room settings
    await this.createRoomSettings({
      roomId: room.roomId,
      allowFileUploads: true,
      allowVoiceNotes: true,
      allowImages: true,
      maxFileSize: 10485760, // 10MB
      moderationLevel: "medium",
      wordFilter: "[]",
      linkFilter: false,
      spamProtection: true,
      slowMode: 0,
      requireApproval: false,
      customEmojis: "[]",
      theme: "{}"
    });

    return room;
  }

  async getRooms(): Promise<ChatRoom[]> {
    return db.select().from(chatRooms).where(eq(chatRooms.isActive, true));
  }

  async getRoomById(roomId: string): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.roomId, roomId));
    return room;
  }

  async updateRoomUserCount(roomId: string, increment: boolean): Promise<void> {
    await db.update(chatRooms)
      .set({
        currentUsers: increment 
          ? sql`${chatRooms.currentUsers} + 1`
          : sql`${chatRooms.currentUsers} - 1`
      })
      .where(eq(chatRooms.roomId, roomId));
  }

  // ===== MESSAGE MANAGEMENT =====

  async createMessage(data: InsertChatMessage): Promise<ChatMessageNew> {
    const messageId = data.messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [message] = await db.insert(chatMessagesNew).values({ ...data, messageId }).returning();
    
    // Update statistics
    await this.updateRoomStats(data.roomId, 'messagesCount');
    
    return message;
  }

  async getMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<ChatMessageNew[]> {
    return db.select()
      .from(chatMessagesNew)
      .where(and(
        eq(chatMessagesNew.roomId, roomId),
        eq(chatMessagesNew.isDeleted, false)
      ))
      .orderBy(desc(chatMessagesNew.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getMessageById(messageId: string): Promise<ChatMessageNew | undefined> {
    const [message] = await db.select().from(chatMessagesNew)
      .where(eq(chatMessagesNew.messageId, messageId));
    return message;
  }

  async editMessage(messageId: string, content: string): Promise<void> {
    await db.update(chatMessagesNew)
      .set({ 
        content, 
        isEdited: true, 
        editedAt: new Date(), 
        updatedAt: new Date() 
      })
      .where(eq(chatMessagesNew.messageId, messageId));
  }

  async deleteMessage(messageId: string, deletedBy: number): Promise<void> {
    await db.update(chatMessagesNew)
      .set({ 
        isDeleted: true, 
        deletedBy, 
        deletedAt: new Date(), 
        updatedAt: new Date() 
      })
      .where(eq(chatMessagesNew.messageId, messageId));
  }

  async pinMessage(messageId: string, pinnedBy: number): Promise<void> {
    await db.update(chatMessagesNew)
      .set({ isPinned: true, pinnedBy, updatedAt: new Date() })
      .where(eq(chatMessagesNew.messageId, messageId));
  }

  async unpinMessage(messageId: string): Promise<void> {
    await db.update(chatMessagesNew)
      .set({ isPinned: false, pinnedBy: null, updatedAt: new Date() })
      .where(eq(chatMessagesNew.messageId, messageId));
  }

  // ===== USER MANAGEMENT =====

  async joinRoom(data: InsertChatUser): Promise<ChatUser> {
    // Remove existing entries for this user in this room
    await db.delete(chatUsers)
      .where(and(
        eq(chatUsers.userId, data.userId),
        eq(chatUsers.roomId, data.roomId)
      ));

    const [user] = await db.insert(chatUsers).values(data).returning();
    await this.updateRoomUserCount(data.roomId, true);
    return user;
  }

  async leaveRoom(userId: number, roomId: string): Promise<void> {
    await db.delete(chatUsers)
      .where(and(eq(chatUsers.userId, userId), eq(chatUsers.roomId, roomId)));
    await this.updateRoomUserCount(roomId, false);
  }

  async getRoomUsers(roomId: string): Promise<ChatUser[]> {
    return db.select().from(chatUsers).where(eq(chatUsers.roomId, roomId));
  }

  async updateUserStatus(userId: number, roomId: string, status: string): Promise<void> {
    await db.update(chatUsers)
      .set({ status, lastSeen: new Date() })
      .where(and(eq(chatUsers.userId, userId), eq(chatUsers.roomId, roomId)));
  }

  async updateUserTyping(userId: number, roomId: string, isTyping: boolean): Promise<void> {
    const typingUntil = isTyping ? new Date(Date.now() + 10000) : null; // 10 seconds
    await db.update(chatUsers)
      .set({ isTyping, typingUntil, lastSeen: new Date() })
      .where(and(eq(chatUsers.userId, userId), eq(chatUsers.roomId, roomId)));
  }

  // ===== FILE UPLOAD MANAGEMENT =====

  async createFileUpload(data: InsertChatFileUpload): Promise<ChatFileUpload> {
    const fileId = data.fileId || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [file] = await db.insert(chatFileUploads).values({ ...data, fileId }).returning();
    
    // Update statistics
    if (data.isVoiceNote) {
      // Voice notes expire after 48 hours
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await db.update(chatFileUploads)
        .set({ expiresAt })
        .where(eq(chatFileUploads.fileId, fileId));
    }
    
    return file;
  }

  async getFileUpload(fileId: string): Promise<ChatFileUpload | undefined> {
    const [file] = await db.select().from(chatFileUploads)
      .where(eq(chatFileUploads.fileId, fileId));
    return file;
  }

  async expireVoiceNotes(): Promise<void> {
    const now = new Date();
    await db.update(chatFileUploads)
      .set({ isExpired: true })
      .where(and(
        eq(chatFileUploads.isVoiceNote, true),
        lte(chatFileUploads.expiresAt, now),
        eq(chatFileUploads.isExpired, false)
      ));
  }

  // ===== NOTIFICATION MANAGEMENT =====

  async createNotification(data: InsertChatNotification): Promise<ChatNotificationNew> {
    const notificationId = data.notificationId || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [notification] = await db.insert(chatNotificationsNew).values({ ...data, notificationId }).returning();
    return notification;
  }

  async getUserNotifications(userId: number, limit: number = 20): Promise<ChatNotificationNew[]> {
    return db.select()
      .from(chatNotificationsNew)
      .where(eq(chatNotificationsNew.userId, userId))
      .orderBy(desc(chatNotificationsNew.createdAt))
      .limit(limit);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await db.update(chatNotificationsNew)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(chatNotificationsNew.notificationId, notificationId));
  }

  // ===== MODERATION ACTIONS =====

  async createModerationAction(data: InsertChatModerationAction): Promise<ChatModerationAction> {
    const actionId = data.actionId || `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [action] = await db.insert(chatModerationActions).values({ ...data, actionId }).returning();
    
    // If it's a ban action, create a ban record
    if (data.actionType === 'ban' && data.targetUserId) {
      await this.banUser({
        userId: data.targetUserId,
        roomId: data.roomId,
        moderatorId: data.moderatorId,
        banType: data.duration ? 'temporary' : 'permanent',
        reason: data.reason || 'Moderation action',
        expiresAt: data.expiresAt
      });
    }
    
    return action;
  }

  async banUser(data: InsertChatUserBan): Promise<ChatUserBan> {
    const [ban] = await db.insert(chatUserBans).values(data).returning();
    
    // Remove user from all rooms if it's a global ban
    if (data.banType === 'global') {
      await db.delete(chatUsers).where(eq(chatUsers.userId, data.userId));
    } else if (data.roomId) {
      // Remove user from specific room
      await db.delete(chatUsers)
        .where(and(eq(chatUsers.userId, data.userId), eq(chatUsers.roomId, data.roomId)));
    }
    
    return ban;
  }

  async isUserBanned(userId: number, roomId?: string): Promise<boolean> {
    const now = new Date();
    const conditions = [
      eq(chatUserBans.userId, userId),
      eq(chatUserBans.isActive, true),
      or(
        isNull(chatUserBans.expiresAt),
        gte(chatUserBans.expiresAt, now)
      )
    ];

    if (roomId) {
      conditions.push(or(
        eq(chatUserBans.roomId, roomId),
        eq(chatUserBans.banType, 'global')
      ));
    }

    const [ban] = await db.select().from(chatUserBans)
      .where(and(...conditions))
      .limit(1);
    
    return !!ban;
  }

  // ===== ROOM SETTINGS =====

  async createRoomSettings(data: InsertChatRoomSettings): Promise<ChatRoomSettings> {
    const [settings] = await db.insert(chatRoomSettings).values(data).returning();
    return settings;
  }

  async getRoomSettings(roomId: string): Promise<ChatRoomSettings | undefined> {
    const [settings] = await db.select().from(chatRoomSettings)
      .where(eq(chatRoomSettings.roomId, roomId));
    return settings;
  }

  async updateRoomSettings(roomId: string, updates: Partial<ChatRoomSettings>): Promise<void> {
    await db.update(chatRoomSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatRoomSettings.roomId, roomId));
  }

  // ===== STATISTICS =====

  async updateRoomStats(roomId: string, statType: 'messagesCount' | 'filesSharedCount' | 'voiceNotesCount'): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Try to update existing record
    const result = await db.update(chatStatistics)
      .set({
        [statType]: sql`${chatStatistics[statType]} + 1`
      })
      .where(and(
        eq(chatStatistics.roomId, roomId),
        gte(chatStatistics.date, today)
      ));

    // If no existing record, create one
    if (!result) {
      await db.insert(chatStatistics).values({
        roomId,
        date: today,
        [statType]: 1
      });
    }
  }

  async getRoomStats(roomId: string, days: number = 7): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return db.select().from(chatStatistics)
      .where(and(
        eq(chatStatistics.roomId, roomId),
        gte(chatStatistics.date, startDate)
      ))
      .orderBy(desc(chatStatistics.date));
  }

  // ===== UTILITY METHODS =====

  async getOnlineUsersCount(roomId: string): Promise<number> {
    const [result] = await db.select({ count: sql`count(*)` })
      .from(chatUsers)
      .where(and(
        eq(chatUsers.roomId, roomId),
        eq(chatUsers.status, 'online')
      ));
    return Number(result?.count || 0);
  }

  async searchMessages(roomId: string, query: string, limit: number = 20): Promise<ChatMessageNew[]> {
    return db.select()
      .from(chatMessagesNew)
      .where(and(
        eq(chatMessagesNew.roomId, roomId),
        eq(chatMessagesNew.isDeleted, false),
        sql`${chatMessagesNew.content} ILIKE ${'%' + query + '%'}`
      ))
      .orderBy(desc(chatMessagesNew.createdAt))
      .limit(limit);
  }

  async getRecentActivity(roomId: string, hours: number = 24): Promise<any> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const [messageCount] = await db.select({ count: sql`count(*)` })
      .from(chatMessagesNew)
      .where(and(
        eq(chatMessagesNew.roomId, roomId),
        gte(chatMessagesNew.createdAt, since)
      ));

    const [uniqueUsers] = await db.select({ count: sql`count(distinct ${chatMessagesNew.userId})` })
      .from(chatMessagesNew)
      .where(and(
        eq(chatMessagesNew.roomId, roomId),
        gte(chatMessagesNew.createdAt, since)
      ));

    return {
      messageCount: Number(messageCount?.count || 0),
      uniqueUsers: Number(uniqueUsers?.count || 0),
      timeframe: `${hours} hours`
    };
  }
}

export const comprehensiveChatService = new ComprehensiveChatService();
export { ComprehensiveChatService };