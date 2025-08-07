import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Send,
  User,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Minimize2,
  Maximize2,
  X,
  Hash,
  Phone,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    role: "user" | "admin" | "moderator";
    avatar?: string;
    isOnline: boolean;
  };
  type: "text" | "file" | "system";
  status: "sent" | "delivered" | "read";
  ticketId?: string;
}

interface ChatTicket {
  id: string;
  userId: string;
  subject: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "assigned" | "in_progress" | "resolved" | "closed";
  assignedTo?: string;
  createdAt: Date;
  lastActivity: Date;
  messages: ChatMessage[];
  category: "technical" | "trading" | "billing" | "general";
}

interface AdminChatSystemProps {
  isAdmin?: boolean;
  userId?: string;
  className?: string;
}

const AdminChatSystem: React.FC<AdminChatSystemProps> = ({ 
  isAdmin = false, 
  userId,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTicket, setCurrentTicket] = useState<ChatTicket | null>(null);
  const [tickets, setTickets] = useState<ChatTicket[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockTickets: ChatTicket[] = [
      {
        id: "ticket_1",
        userId: "user_123",
        subject: "Trading bot configuration help",
        priority: "medium",
        status: "open",
        createdAt: new Date(Date.now() - 3600000),
        lastActivity: new Date(Date.now() - 300000),
        category: "technical",
        messages: [
          {
            id: "msg_1",
            content: "Hi, I need help configuring my WaidBot Pro settings. The stop-loss isn't working as expected.",
            timestamp: new Date(Date.now() - 3600000),
            sender: {
              id: "user_123",
              name: "John Doe",
              role: "user",
              avatar: undefined,
              isOnline: true
            },
            type: "text",
            status: "read",
            ticketId: "ticket_1"
          },
          {
            id: "msg_2",
            content: "Hello John! I'll help you with the WaidBot Pro configuration. Can you tell me what stop-loss percentage you've set?",
            timestamp: new Date(Date.now() - 3300000),
            sender: {
              id: "admin_1",
              name: "Sarah (Admin)",
              role: "admin",
              avatar: undefined,
              isOnline: true
            },
            type: "text",
            status: "read",
            ticketId: "ticket_1"
          }
        ]
      },
      {
        id: "ticket_2",
        userId: "user_456",
        subject: "Wallet balance not updating",
        priority: "high",
        status: "assigned",
        assignedTo: "admin_2",
        createdAt: new Date(Date.now() - 7200000),
        lastActivity: new Date(Date.now() - 1800000),
        category: "billing",
        messages: [
          {
            id: "msg_3",
            content: "My SmaiSika wallet balance hasn't updated after my latest deposit. Can you check this?",
            timestamp: new Date(Date.now() - 7200000),
            sender: {
              id: "user_456",
              name: "Alice Smith",
              role: "user",
              avatar: undefined,
              isOnline: false
            },
            type: "text",
            status: "delivered",
            ticketId: "ticket_2"
          }
        ]
      }
    ];

    setTickets(mockTickets);
    if (!isAdmin && userId) {
      const userTicket = mockTickets.find(t => t.userId === userId);
      if (userTicket) {
        setCurrentTicket(userTicket);
      }
    }
  }, [isAdmin, userId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentTicket?.messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentTicket) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      content: newMessage,
      timestamp: new Date(),
      sender: {
        id: isAdmin ? "admin_current" : userId || "user_current",
        name: isAdmin ? "Admin" : "You",
        role: isAdmin ? "admin" : "user",
        isOnline: true
      },
      type: "text",
      status: "sent",
      ticketId: currentTicket.id
    };

    setCurrentTicket(prev => prev ? {
      ...prev,
      messages: [...prev.messages, message],
      lastActivity: new Date()
    } : null);

    setNewMessage("");

    // Simulate admin/user response after 2 seconds
    setTimeout(() => {
      const responseMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        content: isAdmin 
          ? "Thank you for your message. I'm looking into this now."
          : "Thanks for contacting support. An admin will respond shortly.",
        timestamp: new Date(),
        sender: {
          id: isAdmin ? "user_auto" : "admin_auto",
          name: isAdmin ? "User" : "Support Bot",
          role: isAdmin ? "user" : "admin",
          isOnline: true
        },
        type: "text",
        status: "sent",
        ticketId: currentTicket.id
      };

      setCurrentTicket(prev => prev ? {
        ...prev,
        messages: [...prev.messages, responseMessage]
      } : null);
    }, 2000);
  };

  const createNewTicket = () => {
    const newTicket: ChatTicket = {
      id: `ticket_${Date.now()}`,
      userId: userId || "current_user",
      subject: "New support request",
      priority: "medium",
      status: "open",
      createdAt: new Date(),
      lastActivity: new Date(),
      category: "general",
      messages: [
        {
          id: `msg_${Date.now()}`,
          content: "Hello! How can we help you today?",
          timestamp: new Date(),
          sender: {
            id: "system",
            name: "Support System",
            role: "admin",
            isOnline: true
          },
          type: "system",
          status: "delivered"
        }
      ]
    };

    setCurrentTicket(newTicket);
    setTickets(prev => [newTicket, ...prev]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "text-green-400";
      case "assigned": return "text-blue-400";
      case "in_progress": return "text-yellow-400";
      case "resolved": return "text-purple-400";
      case "closed": return "text-gray-400";
      default: return "text-gray-400";
    }
  };

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl",
      isMinimized ? "w-80 h-14" : "w-96 h-[600px]",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-blue-400" />
          <h3 className="text-white font-semibold">
            {isAdmin ? "Admin Support Center" : "Support Chat"}
          </h3>
          {currentTicket && (
            <Badge variant="outline" className={getStatusColor(currentTicket.status)}>
              {currentTicket.status}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Admin Ticket List */}
          {isAdmin && !currentTicket && (
            <div className="flex-1 p-4">
              <div className="space-y-3">
                <h4 className="text-white font-medium">Active Tickets</h4>
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setCurrentTicket(ticket)}
                    className="p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">
                        {ticket.subject}
                      </span>
                      <div className={cn("w-2 h-2 rounded-full", getPriorityColor(ticket.priority))} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{ticket.category}</span>
                      <span>{ticket.lastActivity.toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {currentTicket && (
            <>
              <ScrollArea className="flex-1 p-4 h-96">
                <div className="space-y-4">
                  {currentTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.sender.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-xs lg:max-w-md px-4 py-2 rounded-lg",
                          message.sender.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-700 text-white",
                          message.type === "system" && "bg-gray-800 text-gray-300 text-center"
                        )}
                      >
                        {message.sender.role !== "user" && message.type !== "system" && (
                          <div className="flex items-center space-x-2 mb-1">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="bg-gray-600 text-xs">
                                {message.sender.role === "admin" ? "A" : "M"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-300">{message.sender.name}</span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.sender.role === "user" && (
                            <div className="ml-2">
                              {message.status === "sent" && <Clock className="h-3 w-3 opacity-50" />}
                              {message.status === "delivered" && <CheckCircle className="h-3 w-3 opacity-50" />}
                              {message.status === "read" && <CheckCircle className="h-3 w-3 text-blue-400" />}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Button onClick={sendMessage} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* New Chat for Users */}
          {!isAdmin && !currentTicket && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">Need Help?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Start a conversation with our support team
                </p>
                <Button onClick={createNewTicket} className="bg-blue-600 hover:bg-blue-700">
                  Start New Chat
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminChatSystem;