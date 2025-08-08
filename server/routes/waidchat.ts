import { Router } from 'express';
import { comprehensiveChatService } from '../services/comprehensiveChatService';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/chat';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and audio files
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|wav|ogg|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  }
});

// ===== MODERATOR ROUTES =====

router.post('/moderators', async (req, res) => {
  try {
    const { userId, name, email, permissions } = req.body;
    
    if (!userId || !name || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, name, email' 
      });
    }

    const moderator = await comprehensiveChatService.createModerator({
      userId,
      name,
      email,
      permissions: permissions || {}
    });

    res.json({ success: true, moderator });
  } catch (error) {
    console.error('Error creating moderator:', error);
    res.status(500).json({ error: 'Failed to create moderator' });
  }
});

router.get('/moderators', async (req, res) => {
  try {
    const moderators = await comprehensiveChatService.getModerators();
    res.json({ success: true, moderators });
  } catch (error) {
    console.error('Error fetching moderators:', error);
    res.status(500).json({ error: 'Failed to fetch moderators' });
  }
});

router.get('/moderators/:id', async (req, res) => {
  try {
    const moderator = await comprehensiveChatService.getModeratorById(parseInt(req.params.id));
    if (!moderator) {
      return res.status(404).json({ error: 'Moderator not found' });
    }
    res.json({ success: true, moderator });
  } catch (error) {
    console.error('Error fetching moderator:', error);
    res.status(500).json({ error: 'Failed to fetch moderator' });
  }
});

// ===== ROOM ROUTES =====

router.post('/rooms', async (req, res) => {
  try {
    const { name, description, type, maxUsers, createdBy } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    const room = await comprehensiveChatService.createRoom({
      roomId: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      type: type || 'public',
      maxUsers: maxUsers || 100,
      createdBy
    });

    res.json({ success: true, room });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

router.get('/rooms', async (req, res) => {
  try {
    const rooms = await comprehensiveChatService.getRooms();
    res.json({ success: true, rooms });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

router.get('/rooms/:roomId', async (req, res) => {
  try {
    const room = await comprehensiveChatService.getRoomById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ success: true, room });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// ===== MESSAGE ROUTES =====

router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const messages = await comprehensiveChatService.getMessages(roomId, limit, offset);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, moderatorId, content, messageType, replyToMessageId, mentions, tags } = req.body;
    
    if (!content && messageType === 'text') {
      return res.status(400).json({ error: 'Content is required for text messages' });
    }

    // Check if user is banned
    if (userId) {
      const isBanned = await comprehensiveChatService.isUserBanned(userId, roomId);
      if (isBanned) {
        return res.status(403).json({ error: 'User is banned from this room' });
      }
    }

    const message = await comprehensiveChatService.createMessage({
      roomId,
      userId,
      moderatorId,
      senderName: req.body.senderName || 'Anonymous',
      senderType: moderatorId ? 'moderator' : 'user',
      content,
      messageType: messageType || 'text',
      replyToMessageId,
      mentions: mentions || [],
      tags: tags || []
    });

    res.json({ success: true, message });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

router.put('/messages/:messageId', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    await comprehensiveChatService.editMessage(req.params.messageId, content);
    res.json({ success: true, message: 'Message updated' });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ error: 'Failed to edit message' });
  }
});

router.delete('/messages/:messageId', async (req, res) => {
  try {
    const { deletedBy } = req.body;
    if (!deletedBy) {
      return res.status(400).json({ error: 'deletedBy is required' });
    }

    await comprehensiveChatService.deleteMessage(req.params.messageId, deletedBy);
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// ===== FILE UPLOAD ROUTES =====

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { userId, messageId, isVoiceNote, voiceDuration } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const fileUrl = `/uploads/chat/${req.file.filename}`;
    
    const fileUpload = await comprehensiveChatService.createFileUpload({
      userId: parseInt(userId),
      messageId,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileUrl,
      isVoiceNote: isVoiceNote === 'true',
      voiceDuration: voiceDuration ? parseInt(voiceDuration) : undefined
    });

    res.json({ success: true, file: fileUpload });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

router.get('/files/:fileId', async (req, res) => {
  try {
    const file = await comprehensiveChatService.getFileUpload(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if voice note has expired
    if (file.isVoiceNote && file.isExpired) {
      return res.status(410).json({ error: 'Voice note has expired' });
    }

    res.json({ success: true, file });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

// ===== USER MANAGEMENT ROUTES =====

router.post('/rooms/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, username, displayName, avatar } = req.body;
    
    if (!userId || !username) {
      return res.status(400).json({ error: 'userId and username are required' });
    }

    // Check if user is banned
    const isBanned = await comprehensiveChatService.isUserBanned(userId, roomId);
    if (isBanned) {
      return res.status(403).json({ error: 'User is banned from this room' });
    }

    const user = await comprehensiveChatService.joinRoom({
      userId,
      roomId,
      username,
      displayName,
      avatar
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

router.post('/rooms/:roomId/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await comprehensiveChatService.leaveRoom(userId, req.params.roomId);
    res.json({ success: true, message: 'Left room successfully' });
  } catch (error) {
    console.error('Error leaving room:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
});

router.get('/rooms/:roomId/users', async (req, res) => {
  try {
    const users = await comprehensiveChatService.getRoomUsers(req.params.roomId);
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching room users:', error);
    res.status(500).json({ error: 'Failed to fetch room users' });
  }
});

// ===== MODERATION ROUTES =====

router.post('/moderation/ban', async (req, res) => {
  try {
    const { userId, roomId, moderatorId, banType, reason, duration } = req.body;
    
    if (!userId || !moderatorId || !reason) {
      return res.status(400).json({ error: 'userId, moderatorId, and reason are required' });
    }

    let expiresAt = null;
    if (duration && banType === 'temporary') {
      expiresAt = new Date(Date.now() + duration * 60 * 1000); // duration in minutes
    }

    const ban = await comprehensiveChatService.banUser({
      userId,
      roomId,
      moderatorId,
      banType: banType || 'temporary',
      reason,
      expiresAt
    });

    res.json({ success: true, ban });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

router.post('/moderation/actions', async (req, res) => {
  try {
    const { moderatorId, targetUserId, roomId, messageId, actionType, reason, duration } = req.body;
    
    if (!moderatorId || !actionType) {
      return res.status(400).json({ error: 'moderatorId and actionType are required' });
    }

    let expiresAt = null;
    if (duration) {
      expiresAt = new Date(Date.now() + duration * 60 * 1000);
    }

    const action = await comprehensiveChatService.createModerationAction({
      moderatorId,
      targetUserId,
      roomId,
      messageId,
      actionType,
      reason,
      duration,
      expiresAt
    });

    res.json({ success: true, action });
  } catch (error) {
    console.error('Error creating moderation action:', error);
    res.status(500).json({ error: 'Failed to create moderation action' });
  }
});

// ===== STATISTICS ROUTES =====

router.get('/rooms/:roomId/stats', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const stats = await comprehensiveChatService.getRoomStats(req.params.roomId, days);
    const activity = await comprehensiveChatService.getRecentActivity(req.params.roomId);
    
    res.json({ success: true, stats, activity });
  } catch (error) {
    console.error('Error fetching room stats:', error);
    res.status(500).json({ error: 'Failed to fetch room stats' });
  }
});

// ===== UTILITY ROUTES =====

router.get('/rooms/:roomId/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const messages = await comprehensiveChatService.searchMessages(req.params.roomId, q as string);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({ error: 'Failed to search messages' });
  }
});

// Serve uploaded files
router.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(process.cwd(), 'uploads', 'chat', filename);
  
  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;