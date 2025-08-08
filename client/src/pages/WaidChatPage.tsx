import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Users, 
  Settings, 
  Shield, 
  Pin, 
  Trash2, 
  Edit3, 
  Reply, 
  Search,
  Plus,
  Hash,
  MessageSquare,
  UserCheck,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Volume2,
  VolumeX,
  Ban,
  Flag
} from 'lucide-react';

interface ChatMessage {
  id: number;
  messageId: string;
  roomId: string;
  userId?: number;
  moderatorId?: number;
  senderName: string;
  senderType: 'user' | 'moderator' | 'system' | 'bot';
  content?: string;
  messageType: 'text' | 'file' | 'voice' | 'image' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  voiceNoteDuration?: number;
  voiceNoteUrl?: string;
  voiceNoteExpiresAt?: string;
  replyToMessageId?: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedBy?: number;
  deletedAt?: string;
  reactions: Record<string, string[]>;
  isPinned: boolean;
  pinnedBy?: number;
  mentions: string[];
  tags: string[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'sent' | 'delivered' | 'read';
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface ChatRoom {
  id: number;
  roomId: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'support' | 'trading';
  isActive: boolean;
  maxUsers: number;
  currentUsers: number;
  createdBy?: number;
  createdAt: string;
}

interface ChatUser {
  id: number;
  userId: number;
  roomId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  lastSeen: string;
  joinedRoomAt: string;
  socketId?: string;
  isTyping: boolean;
  typingUntil?: string;
}

interface ChatModerator {
  id: number;
  userId: number;
  name: string;
  email: string;
  isActive: boolean;
  permissions: Record<string, boolean>;
  joinedAt: string;
  lastActiveAt: string;
}

export default function WaidChatPage() {
  const [currentRoom, setCurrentRoom] = useState<string>('general');
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [showModeratorPanel, setShowModeratorPanel] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch chat rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery({
    queryKey: ['/api/waidchat/rooms'],
    refetchInterval: 10000
  });

  // Fetch messages for current room
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/waidchat/rooms', currentRoom, 'messages'],
    enabled: !!currentRoom,
    refetchInterval: 2000
  });

  const messages = messagesData?.messages || [];

  // Fetch room users
  const { data: roomUsersData } = useQuery({
    queryKey: ['/api/waidchat/rooms', currentRoom, 'users'],
    enabled: !!currentRoom,
    refetchInterval: 5000
  });

  const roomUsers = roomUsersData?.users || [];

  // Fetch moderators
  const { data: moderatorsData } = useQuery({
    queryKey: ['/api/waidchat/moderators'],
    refetchInterval: 30000
  });

  const moderators = moderatorsData?.moderators || [];

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      content?: string;
      messageType?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      fileMimeType?: string;
      voiceNoteUrl?: string;
      voiceNoteDuration?: number;
      replyToMessageId?: string;
      mentions?: string[];
      tags?: string[];
    }) => {
      return apiRequest(`/api/waidchat/rooms/${currentRoom}/messages`, {
        method: 'POST',
        body: {
          userId: 1, // Replace with actual user ID
          senderName: 'Current User', // Replace with actual user name
          roomId: currentRoom,
          ...messageData
        }
      });
    },
    onSuccess: () => {
      setMessage('');
      setSelectedFile(null);
      setReplyingTo(null);
      queryClient.invalidateQueries({ queryKey: ['/api/waidchat/rooms', currentRoom, 'messages'] });
      scrollToBottom();
    },
    onError: (error) => {
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
      console.error('Send message error:', error);
    }
  });

  // File upload mutation
  const fileUploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/waidchat/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      const fileData = data.file;
      sendMessageMutation.mutate({
        messageType: fileData.isVoiceNote ? 'voice' : 'file',
        fileUrl: fileData.fileUrl,
        fileName: fileData.originalFileName,
        fileSize: fileData.fileSize,
        fileMimeType: fileData.mimeType,
        voiceNoteUrl: fileData.isVoiceNote ? fileData.fileUrl : undefined,
        voiceNoteDuration: fileData.voiceDuration
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      });
      console.error('File upload error:', error);
    }
  });

  // Edit message mutation
  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      return apiRequest(`/api/waidchat/messages/${messageId}`, {
        method: 'PUT',
        body: { content }
      });
    },
    onSuccess: () => {
      setEditingMessage(null);
      setEditContent('');
      queryClient.invalidateQueries({ queryKey: ['/api/waidchat/rooms', currentRoom, 'messages'] });
      toast({
        title: "Message Updated",
        description: "Message has been successfully updated."
      });
    }
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return apiRequest(`/api/waidchat/messages/${messageId}`, {
        method: 'DELETE',
        body: { deletedBy: 1 } // Replace with actual user ID
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidchat/rooms', currentRoom, 'messages'] });
      toast({
        title: "Message Deleted",
        description: "Message has been deleted."
      });
    }
  });

  // Join room mutation
  const joinRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      return apiRequest(`/api/waidchat/rooms/${roomId}/join`, {
        method: 'POST',
        body: {
          userId: 1, // Replace with actual user ID
          username: 'CurrentUser', // Replace with actual username
          displayName: 'Current User', // Replace with actual display name
          avatar: '' // Replace with actual avatar
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waidchat/rooms', currentRoom, 'users'] });
    }
  });

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WaidChat WebSocket connected');
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'new_message' && data.roomId === currentRoom) {
          queryClient.invalidateQueries({ queryKey: ['/api/waidchat/rooms', currentRoom, 'messages'] });
        } else if (data.type === 'user_joined' || data.type === 'user_left') {
          queryClient.invalidateQueries({ queryKey: ['/api/waidchat/rooms', currentRoom, 'users'] });
        } else if (data.type === 'typing_start' || data.type === 'typing_stop') {
          // Handle typing indicators
          setOnlineUsers(prev => 
            prev.map(user => 
              user.userId === data.userId 
                ? { ...user, isTyping: data.type === 'typing_start' }
                : user
            )
          );
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('WaidChat WebSocket disconnected');
    };
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentRoom, queryClient]);

  // Auto-join current room on load
  useEffect(() => {
    if (currentRoom) {
      joinRoomMutation.mutate(currentRoom);
    }
  }, [currentRoom]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle send message
  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !selectedFile) return;
    
    if (selectedFile) {
      handleFileUpload();
    } else {
      // Extract mentions and hashtags
      const mentions = Array.from(message.matchAll(/@(\w+)/g)).map(match => match[1]);
      const tags = Array.from(message.matchAll(/#(\w+)/g)).map(match => match[1]);
      
      sendMessageMutation.mutate({
        content: message.trim(),
        messageType: 'text',
        replyToMessageId: replyingTo?.messageId,
        mentions,
        tags
      });
    }
  }, [message, selectedFile, replyingTo]);

  // Handle file upload
  const handleFileUpload = useCallback(() => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', '1'); // Replace with actual user ID
    formData.append('isVoiceNote', 'false');
    
    fileUploadMutation.mutate(formData);
  }, [selectedFile]);

  // Handle voice recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const formData = new FormData();
        formData.append('file', audioBlob, `voice_note_${Date.now()}.wav`);
        formData.append('userId', '1'); // Replace with actual user ID
        formData.append('isVoiceNote', 'true');
        formData.append('voiceDuration', Math.floor(Date.now() / 1000).toString());
        
        fileUploadMutation.mutate(formData);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      // Send typing start to WebSocket
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'typing_start',
          roomId: currentRoom,
          userId: 1 // Replace with actual user ID
        }));
      }
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'typing_stop',
          roomId: currentRoom,
          userId: 1 // Replace with actual user ID
        }));
      }
    }, 2000);
  }, [isTyping, currentRoom]);

  // Handle edit message
  const handleEditMessage = useCallback((messageId: string, content: string) => {
    setEditingMessage(messageId);
    setEditContent(content);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingMessage && editContent.trim()) {
      editMessageMutation.mutate({
        messageId: editingMessage,
        content: editContent.trim()
      });
    }
  }, [editingMessage, editContent]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Render message content
  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.isDeleted) {
      return <span className="italic text-gray-500 dark:text-gray-400">This message was deleted</span>;
    }
    
    if (editingMessage === msg.messageId) {
      return (
        <div className="flex items-center space-x-2">
          <Input
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
            autoFocus
          />
          <Button size="sm" onClick={handleSaveEdit}>Save</Button>
          <Button size="sm" variant="outline" onClick={() => setEditingMessage(null)}>Cancel</Button>
        </div>
      );
    }
    
    switch (msg.messageType) {
      case 'file':
      case 'image':
        return (
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
            <Paperclip className="h-4 w-4" />
            <span className="text-sm">{msg.fileName}</span>
            {msg.fileSize && <span className="text-xs text-gray-500">({Math.round(msg.fileSize / 1024)} KB)</span>}
            <Button size="sm" variant="ghost" onClick={() => window.open(msg.fileUrl, '_blank')}>
              <Download className="h-3 w-3" />
            </Button>
          </div>
        );
      
      case 'voice':
        const isExpired = msg.voiceNoteExpiresAt && new Date(msg.voiceNoteExpiresAt) < new Date();
        return (
          <div className="flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <Volume2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm">Voice Note</span>
            {msg.voiceNoteDuration && <span className="text-xs text-gray-500">{msg.voiceNoteDuration}s</span>}
            {isExpired ? (
              <span className="text-xs text-red-500">Expired</span>
            ) : (
              <Button size="sm" variant="ghost" onClick={() => window.open(msg.voiceNoteUrl, '_blank')}>
                <Volume2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      
      default:
        return <p className="break-words">{msg.content}</p>;
    }
  };

  // Create room function
  const handleCreateRoom = async (name: string, description: string, type: string) => {
    try {
      await apiRequest('/api/waidchat/rooms', {
        method: 'POST',
        body: {
          name,
          description,
          type,
          createdBy: 1 // Replace with actual user ID
        }
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/waidchat/rooms'] });
      toast({
        title: "Room Created",
        description: `Room "${name}" has been created successfully.`
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create room. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (roomsLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading WaidChat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-2rem)]">
          
          {/* Sidebar - Room List & Users */}
          <div className="lg:w-80 flex flex-col space-y-4">
            
            {/* Room List */}
            <Card className="flex-1 bg-slate-800/50 border-purple-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Chat Rooms
                  </h2>
                  <Button size="sm" variant="outline" className="border-purple-500/50">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-48">
                  {rooms.map((room: ChatRoom) => (
                    <div
                      key={room.roomId}
                      className={`p-3 cursor-pointer hover:bg-slate-700/50 transition-colors border-l-2 ${
                        currentRoom === room.roomId ? 'border-purple-500 bg-slate-700/30' : 'border-transparent'
                      }`}
                      onClick={() => setCurrentRoom(room.roomId)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white">{room.name}</h3>
                          <p className="text-sm text-gray-400">{room.description}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge variant={room.type === 'public' ? 'default' : 'secondary'} className="text-xs">
                            {room.type}
                          </Badge>
                          <span className="text-xs text-gray-500 mt-1">{room.currentUsers} users</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Online Users */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardHeader className="pb-3">
                <h3 className="text-sm font-semibold text-white flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Online ({roomUsers.length})
                </h3>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="max-h-48">
                  {roomUsers.map((user: ChatUser) => (
                    <div key={user.id} className="flex items-center p-2 hover:bg-slate-700/30">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-purple-600 text-white">
                          {user.displayName?.slice(0, 2) || user.username.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm text-white">{user.displayName || user.username}</p>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            user.status === 'online' ? 'bg-green-500' :
                            user.status === 'away' ? 'bg-yellow-500' :
                            user.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                          <span className="text-xs text-gray-400 capitalize">{user.status}</span>
                          {user.isTyping && <span className="text-xs text-purple-400">typing...</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
            
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 bg-slate-800/50 border-purple-500/20 flex flex-col">
              
              {/* Chat Header */}
              <CardHeader className="border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-white">
                      #{rooms.find((r: ChatRoom) => r.roomId === currentRoom)?.name || currentRoom}
                    </h1>
                    <p className="text-sm text-gray-400">
                      {rooms.find((r: ChatRoom) => r.roomId === currentRoom)?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                      {roomUsers.length} online
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowModeratorPanel(!showModeratorPanel)}>
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {messages.map((msg: ChatMessage) => (
                      <div key={msg.messageId} className="group relative">
                        
                        {/* Reply indicator */}
                        {msg.replyToMessageId && (
                          <div className="ml-12 mb-1 text-xs text-gray-500 border-l-2 border-gray-600 pl-2">
                            Replying to previous message
                          </div>
                        )}
                        
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarFallback className={`text-white text-xs ${
                              msg.senderType === 'moderator' ? 'bg-red-600' :
                              msg.senderType === 'bot' ? 'bg-blue-600' :
                              msg.senderType === 'system' ? 'bg-gray-600' : 'bg-purple-600'
                            }`}>
                              {msg.senderName.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-white">{msg.senderName}</span>
                              {msg.senderType === 'moderator' && (
                                <Badge variant="destructive" className="text-xs">MOD</Badge>
                              )}
                              {msg.senderType === 'bot' && (
                                <Badge variant="default" className="text-xs bg-blue-600">BOT</Badge>
                              )}
                              <span className="text-xs text-gray-500">{formatTimestamp(msg.createdAt)}</span>
                              {msg.isEdited && <span className="text-xs text-gray-500">(edited)</span>}
                              {msg.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
                            </div>
                            
                            <div className="text-gray-200">
                              {renderMessageContent(msg)}
                            </div>
                            
                            {/* Message reactions */}
                            {Object.keys(msg.reactions).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {Object.entries(msg.reactions).map(([emoji, users]) => (
                                  <Badge key={emoji} variant="outline" className="text-xs bg-slate-700/50">
                                    {emoji} {users.length}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            {/* Message tags and mentions */}
                            {(msg.mentions.length > 0 || msg.tags.length > 0) && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {msg.mentions.map(mention => (
                                  <Badge key={mention} variant="secondary" className="text-xs">
                                    @{mention}
                                  </Badge>
                                ))}
                                {msg.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {/* Message actions */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(msg)}>
                              <Reply className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleEditMessage(msg.messageId, msg.content || '')}>
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteMessageMutation.mutate(msg.messageId)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-slate-700/50 p-4">
                
                {/* Reply indicator */}
                {replyingTo && (
                  <div className="mb-3 p-3 bg-slate-700/50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Reply className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        Replying to <strong>{replyingTo.senderName}</strong>: {replyingTo.content?.slice(0, 50)}...
                      </span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                      ×
                    </Button>
                  </div>
                )}
                
                {/* File preview */}
                {selectedFile && (
                  <div className="mb-3 p-3 bg-slate-700/50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{selectedFile.name}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedFile(null)}>
                      ×
                    </Button>
                  </div>
                )}
                
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Input
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type your message..."
                      className="bg-slate-700/50 border-slate-600/50 text-white placeholder-gray-400 min-h-[44px] resize-none"
                      disabled={sendMessageMutation.isPending || fileUploadMutation.isPending}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.txt,.mp3,.wav,.ogg,.m4a"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-purple-500/50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`border-purple-500/50 ${isRecording ? 'bg-red-600' : ''}`}
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                      disabled={(!message.trim() && !selectedFile) || sendMessageMutation.isPending || fileUploadMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
                
                {/* Typing indicators */}
                {roomUsers.some((user: ChatUser) => user.isTyping) && (
                  <div className="mt-2 text-xs text-gray-400">
                    {roomUsers
                      .filter((user: ChatUser) => user.isTyping)
                      .map((user: ChatUser) => user.displayName || user.username)
                      .join(', ')} {roomUsers.filter((user: ChatUser) => user.isTyping).length === 1 ? 'is' : 'are'} typing...
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Moderator Panel (if visible) */}
          {showModeratorPanel && (
            <div className="lg:w-80">
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Moderation
                  </h3>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                      <TabsTrigger value="moderators">Moderators</TabsTrigger>
                      <TabsTrigger value="actions">Actions</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="moderators" className="space-y-3">
                      <ScrollArea className="h-64">
                        {moderators.map((mod: ChatModerator) => (
                          <div key={mod.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded mb-2">
                            <div>
                              <p className="text-sm font-medium text-white">{mod.name}</p>
                              <p className="text-xs text-gray-400">{mod.email}</p>
                            </div>
                            <Badge variant={mod.isActive ? "default" : "secondary"}>
                              {mod.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        ))}
                      </ScrollArea>
                      
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        <UserCheck className="mr-2 h-4 w-4" />
                        Add Moderator
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="actions" className="space-y-3">
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start border-yellow-500/50 text-yellow-300">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Warn User
                        </Button>
                        <Button variant="outline" className="w-full justify-start border-red-500/50 text-red-300">
                          <Ban className="mr-2 h-4 w-4" />
                          Ban User
                        </Button>
                        <Button variant="outline" className="w-full justify-start border-orange-500/50 text-orange-300">
                          <Clock className="mr-2 h-4 w-4" />
                          Timeout User
                        </Button>
                        <Button variant="outline" className="w-full justify-start border-red-500/50 text-red-300">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Message
                        </Button>
                        <Button variant="outline" className="w-full justify-start border-blue-500/50 text-blue-300">
                          <Flag className="mr-2 h-4 w-4" />
                          Report User
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}