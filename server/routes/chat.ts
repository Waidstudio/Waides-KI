import { Router } from 'express';
import { adminChatService } from '../services/adminChatService';

const router = Router();

// Chat Ticket Routes
router.post('/tickets', async (req, res) => {
  try {
    const { userId, subject, priority, category, initialMessage } = req.body;
    
    if (!userId || !subject || !initialMessage) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, subject, initialMessage' 
      });
    }

    const ticket = await adminChatService.createTicket({
      userId,
      subject,
      priority,
      category,
      initialMessage
    });

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.get('/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await adminChatService.getTicket(ticketId);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

router.get('/tickets/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const tickets = await adminChatService.getUserTickets(userId, limit);
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.get('/tickets', async (req, res) => {
  try {
    const { status, priority, category, assignedTo, limit } = req.query;
    const filters = {
      status: status as string,
      priority: priority as string, 
      category: category as string,
      assignedTo: assignedTo as string
    };

    const tickets = await adminChatService.getAllTickets(
      filters, 
      parseInt(limit as string) || 50
    );
    
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.patch('/tickets/:ticketId/status', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, assignedTo } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    await adminChatService.updateTicketStatus(ticketId, status, assignedTo);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// Chat Message Routes
router.post('/messages', async (req, res) => {
  try {
    const { ticketId, content, senderId, senderRole, senderName, messageType } = req.body;
    
    if (!ticketId || !content || !senderId || !senderRole || !senderName) {
      return res.status(400).json({ 
        error: 'Missing required fields: ticketId, content, senderId, senderRole, senderName' 
      });
    }

    const message = await adminChatService.sendMessage({
      ticketId,
      content,
      senderId,
      senderRole,
      senderName,
      messageType
    });

    res.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.get('/messages/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const limit = parseInt(req.query.limit as string) || 100;
    
    const messages = await adminChatService.getTicketMessages(ticketId, limit);
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.patch('/messages/:ticketId/read', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    await adminChatService.markMessagesRead(ticketId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Notification Routes
router.post('/notifications', async (req, res) => {
  try {
    const { userId, title, message, type, actionUrl, expiresAt } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, title, message' 
      });
    }

    const notification = await adminChatService.createNotification({
      userId,
      title,
      message,
      type,
      actionUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

router.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const includeRead = req.query.includeRead === 'true';
    const limit = parseInt(req.query.limit as string) || 20;
    
    const notifications = await adminChatService.getUserNotifications(userId, includeRead, limit);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.patch('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    await adminChatService.markNotificationRead(notificationId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.patch('/notifications/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    
    await adminChatService.markAllNotificationsRead(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Admin Routes
router.post('/admin/notify', async (req, res) => {
  try {
    const { title, message, type, actionUrl } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: title, message' 
      });
    }

    await adminChatService.notifyAdmins({
      title,
      message,
      type,
      actionUrl
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error notifying admins:', error);
    res.status(500).json({ error: 'Failed to notify admins' });
  }
});

// User Status Routes
router.post('/status', async (req, res) => {
  try {
    const { userId, role, status, socketId } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, role' 
      });
    }

    await adminChatService.updateUserStatus(userId, role, status, socketId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

router.get('/online/admins', async (req, res) => {
  try {
    const admins = await adminChatService.getOnlineAdmins();
    res.json({ success: true, admins });
  } catch (error) {
    console.error('Error fetching online admins:', error);
    res.status(500).json({ error: 'Failed to fetch online admins' });
  }
});

router.get('/online/users', async (req, res) => {
  try {
    const users = await adminChatService.getOnlineUsers();
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ error: 'Failed to fetch online users' });
  }
});

// Statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await adminChatService.getChatStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({ error: 'Failed to fetch chat stats' });
  }
});

export default router;