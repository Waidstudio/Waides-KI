import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { comprehensiveChatService } from '../services/comprehensiveChatService';

interface WebSocketClient extends WebSocket {
  isAlive: boolean;
  userId?: number;
  roomId?: string;
  clientId: string;
}

interface ChatMessage {
  type: 'join_room' | 'leave_room' | 'send_message' | 'typing_start' | 'typing_stop' | 'ping' | 'pong';
  roomId?: string;
  userId?: number;
  messageId?: string;
  content?: string;
  senderName?: string;
  messageType?: string;
  data?: any;
}

class ChatWebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, WebSocketClient>();
  private roomClients = new Map<string, Set<string>>();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws/chat',
      perMessageDeflate: false 
    });

    this.wss.on('connection', (ws: WebSocketClient, request) => {
      const clientId = this.generateClientId();
      ws.clientId = clientId;
      ws.isAlive = true;
      
      this.clients.set(clientId, ws);
      
      console.log(`🔗 WaidChat client connected: ${clientId}`);

      // Handle incoming messages
      ws.on('message', async (data: Buffer) => {
        try {
          const message: ChatMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      // Handle connection errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });

      // Heartbeat
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      // Send welcome message
      this.sendMessage(ws, {
        type: 'connection_established',
        clientId,
        timestamp: new Date().toISOString()
      });
    });

    // Setup heartbeat interval
    const interval = setInterval(() => {
      this.wss?.clients.forEach((ws: WebSocketClient) => {
        if (!ws.isAlive) {
          return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });

    console.log('💬 WaidChat WebSocket server initialized on /ws/chat');
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async handleMessage(ws: WebSocketClient, message: ChatMessage) {
    switch (message.type) {
      case 'join_room':
        await this.handleJoinRoom(ws, message);
        break;
      
      case 'leave_room':
        await this.handleLeaveRoom(ws, message);
        break;
      
      case 'send_message':
        await this.handleSendMessage(ws, message);
        break;
      
      case 'typing_start':
        await this.handleTypingStart(ws, message);
        break;
      
      case 'typing_stop':
        await this.handleTypingStop(ws, message);
        break;
      
      case 'ping':
        this.sendMessage(ws, { type: 'pong' });
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private async handleJoinRoom(ws: WebSocketClient, message: ChatMessage) {
    const { roomId, userId } = message;
    
    if (!roomId || !userId) {
      return this.sendError(ws, 'Missing roomId or userId');
    }

    // Remove from previous room if any
    if (ws.roomId) {
      await this.handleLeaveRoom(ws, { type: 'leave_room', roomId: ws.roomId });
    }

    // Set client room and user
    ws.roomId = roomId;
    ws.userId = userId;

    // Add to room clients
    if (!this.roomClients.has(roomId)) {
      this.roomClients.set(roomId, new Set());
    }
    this.roomClients.get(roomId)?.add(ws.clientId);

    // Try to join room in database
    try {
      await comprehensiveChatService.joinRoom({
        userId,
        roomId,
        username: message.data?.username || `User${userId}`,
        displayName: message.data?.displayName || `User ${userId}`,
        avatar: message.data?.avatar || ''
      });

      // Notify room about new user
      this.broadcastToRoom(roomId, {
        type: 'user_joined',
        roomId,
        userId,
        username: message.data?.username || `User${userId}`,
        timestamp: new Date().toISOString()
      }, ws.clientId);

      // Send success response
      this.sendMessage(ws, {
        type: 'room_joined',
        roomId,
        userId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error joining room:', error);
      this.sendError(ws, 'Failed to join room');
    }
  }

  private async handleLeaveRoom(ws: WebSocketClient, message: ChatMessage) {
    const roomId = message.roomId || ws.roomId;
    const userId = ws.userId;

    if (!roomId || !userId) {
      return;
    }

    // Remove from room clients
    this.roomClients.get(roomId)?.delete(ws.clientId);
    if (this.roomClients.get(roomId)?.size === 0) {
      this.roomClients.delete(roomId);
    }

    // Try to leave room in database
    try {
      await comprehensiveChatService.leaveRoom(userId, roomId);

      // Notify room about user leaving
      this.broadcastToRoom(roomId, {
        type: 'user_left',
        roomId,
        userId,
        timestamp: new Date().toISOString()
      }, ws.clientId);

    } catch (error) {
      console.error('Error leaving room:', error);
    }

    // Clear client room
    ws.roomId = undefined;
  }

  private async handleSendMessage(ws: WebSocketClient, message: ChatMessage) {
    const { roomId, userId, content, messageType = 'text' } = message;

    if (!roomId || !userId || !content) {
      return this.sendError(ws, 'Missing required fields');
    }

    try {
      // Check if user is banned
      const isBanned = await comprehensiveChatService.isUserBanned(userId, roomId);
      if (isBanned) {
        return this.sendError(ws, 'User is banned from this room');
      }

      // Create message in database
      const newMessage = await comprehensiveChatService.createMessage({
        roomId,
        userId,
        senderName: message.senderName || `User${userId}`,
        content,
        messageType,
        senderType: 'user',
        mentions: message.data?.mentions || [],
        tags: message.data?.tags || []
      });

      // Broadcast message to room
      this.broadcastToRoom(roomId, {
        type: 'new_message',
        roomId,
        message: newMessage,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error sending message:', error);
      this.sendError(ws, 'Failed to send message');
    }
  }

  private async handleTypingStart(ws: WebSocketClient, message: ChatMessage) {
    const { roomId, userId } = message;

    if (!roomId || !userId) {
      return;
    }

    try {
      await comprehensiveChatService.updateUserTyping(userId, roomId, true);

      // Broadcast typing indicator
      this.broadcastToRoom(roomId, {
        type: 'typing_start',
        roomId,
        userId,
        timestamp: new Date().toISOString()
      }, ws.clientId);

    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }

  private async handleTypingStop(ws: WebSocketClient, message: ChatMessage) {
    const { roomId, userId } = message;

    if (!roomId || !userId) {
      return;
    }

    try {
      await comprehensiveChatService.updateUserTyping(userId, roomId, false);

      // Broadcast typing stop
      this.broadcastToRoom(roomId, {
        type: 'typing_stop',
        roomId,
        userId,
        timestamp: new Date().toISOString()
      }, ws.clientId);

    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }

  private handleDisconnect(ws: WebSocketClient) {
    console.log(`🔌 WaidChat client disconnected: ${ws.clientId}`);

    // Leave room if connected to one
    if (ws.roomId) {
      this.handleLeaveRoom(ws, { type: 'leave_room' });
    }

    // Remove from clients
    this.clients.delete(ws.clientId);
  }

  private sendMessage(ws: WebSocketClient, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  private sendError(ws: WebSocketClient, error: string) {
    this.sendMessage(ws, {
      type: 'error',
      error,
      timestamp: new Date().toISOString()
    });
  }

  private broadcastToRoom(roomId: string, data: any, excludeClientId?: string) {
    const roomClients = this.roomClients.get(roomId);
    if (!roomClients) return;

    roomClients.forEach(clientId => {
      if (clientId === excludeClientId) return;
      
      const client = this.clients.get(clientId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Public methods for external use
  public broadcastMessage(roomId: string, message: any) {
    this.broadcastToRoom(roomId, message);
  }

  public getRoomClientCount(roomId: string): number {
    return this.roomClients.get(roomId)?.size || 0;
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }
}

export const chatWebSocketManager = new ChatWebSocketManager();
export { ChatWebSocketManager };