import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Headphones, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Mail,
  Phone,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  FileText,
  Star,
  MessageCircle,
  Zap
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  userId: string;
  username: string;
  email: string;
  subject: string;
  category: 'technical' | 'billing' | 'account' | 'trading' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created: string;
  lastUpdate: string;
  assignedTo?: string;
  messageCount: number;
}

interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  avgResponseTime: number;
  customerSatisfaction: number;
  activeAgents: number;
  pendingTickets: number;
  escalatedTickets: number;
}

interface SupportAgent {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  activeTickets: number;
  resolvedToday: number;
  avgRating: number;
  responseTime: number;
}

interface CustomerFeedback {
  id: string;
  ticketId: string;
  rating: number;
  comment: string;
  customerName: string;
  date: string;
  category: string;
}

export default function SupportAdminDashboard() {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data for support dashboard
  const mockSupportMetrics: SupportMetrics = {
    totalTickets: 1247,
    openTickets: 89,
    resolvedToday: 45,
    avgResponseTime: 2.4, // hours
    customerSatisfaction: 4.6,
    activeAgents: 8,
    pendingTickets: 23,
    escalatedTickets: 5
  };

  const mockSupportTickets: SupportTicket[] = [
    {
      id: 'TK-2024-001',
      userId: 'user_123',
      username: 'john_trader',
      email: 'john@example.com',
      subject: 'Unable to connect to Binance API',
      category: 'technical',
      priority: 'high',
      status: 'open',
      created: '2 hours ago',
      lastUpdate: '30 min ago',
      assignedTo: 'Sarah Chen',
      messageCount: 3
    },
    {
      id: 'TK-2024-002',
      userId: 'user_456',
      username: 'crypto_mary',
      email: 'mary@example.com',
      subject: 'SmaiSika wallet balance not updating',
      category: 'technical',
      priority: 'medium',
      status: 'in_progress',
      created: '4 hours ago',
      lastUpdate: '1 hour ago',
      assignedTo: 'Mike Johnson',
      messageCount: 7
    },
    {
      id: 'TK-2024-003',
      userId: 'user_789',
      username: 'trader_bob',
      email: 'bob@example.com',
      subject: 'Billing question about Pro subscription',
      category: 'billing',
      priority: 'low',
      status: 'resolved',
      created: '1 day ago',
      lastUpdate: '2 hours ago',
      assignedTo: 'Lisa Wong',
      messageCount: 4
    },
    {
      id: 'TK-2024-004',
      userId: 'user_012',
      username: 'new_user_2024',
      email: 'newuser@example.com',
      subject: 'Account verification issues',
      category: 'account',
      priority: 'medium',
      status: 'open',
      created: '6 hours ago',
      lastUpdate: '45 min ago',
      messageCount: 2
    },
    {
      id: 'TK-2024-005',
      userId: 'user_345',
      username: 'advanced_trader',
      email: 'advanced@example.com',
      subject: 'Bot configuration not saving',
      category: 'trading',
      priority: 'urgent',
      status: 'escalated',
      created: '3 hours ago',
      lastUpdate: '15 min ago',
      assignedTo: 'David Kim',
      messageCount: 8
    }
  ];

  const mockSupportAgents: SupportAgent[] = [
    {
      id: 'agent_001',
      name: 'Sarah Chen',
      email: 'sarah@waideski.com',
      status: 'online',
      activeTickets: 12,
      resolvedToday: 8,
      avgRating: 4.8,
      responseTime: 1.2
    },
    {
      id: 'agent_002',
      name: 'Mike Johnson',
      email: 'mike@waideski.com',
      status: 'busy',
      activeTickets: 15,
      resolvedToday: 6,
      avgRating: 4.6,
      responseTime: 2.1
    },
    {
      id: 'agent_003',
      name: 'Lisa Wong',
      email: 'lisa@waideski.com',
      status: 'online',
      activeTickets: 9,
      resolvedToday: 11,
      avgRating: 4.9,
      responseTime: 0.8
    },
    {
      id: 'agent_004',
      name: 'David Kim',
      email: 'david@waideski.com',
      status: 'away',
      activeTickets: 7,
      resolvedToday: 4,
      avgRating: 4.7,
      responseTime: 1.5
    }
  ];

  const mockCustomerFeedback: CustomerFeedback[] = [
    {
      id: 'fb_001',
      ticketId: 'TK-2024-003',
      rating: 5,
      comment: 'Excellent support! Resolved my billing issue quickly.',
      customerName: 'trader_bob',
      date: '2 hours ago',
      category: 'billing'
    },
    {
      id: 'fb_002',
      ticketId: 'TK-2024-006',
      rating: 4,
      comment: 'Good support, but took a bit longer than expected.',
      customerName: 'crypto_enthusiast',
      date: '5 hours ago',
      category: 'technical'
    },
    {
      id: 'fb_003',
      ticketId: 'TK-2024-007',
      rating: 5,
      comment: 'Amazing help with bot configuration!',
      customerName: 'pro_trader_x',
      date: '1 day ago',
      category: 'trading'
    }
  ];

  // Ticket management mutations
  const assignTicketMutation = useMutation({
    mutationFn: async ({ ticketId, agentId }: { ticketId: string; agentId: string }) => {
      return await apiRequest('POST', `/api/support/tickets/${ticketId}/assign`, { agentId });
    },
    onSuccess: () => {
      toast({
        title: "Ticket Assigned",
        description: "Ticket has been assigned successfully",
      });
    },
  });

  const updateTicketStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      return await apiRequest('POST', `/api/support/tickets/${ticketId}/status`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Ticket status has been updated",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-500';
      case 'in_progress': return 'text-yellow-500';
      case 'resolved': return 'text-green-500';
      case 'closed': return 'text-gray-500';
      case 'escalated': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed': return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'escalated': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-500 bg-green-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'urgent': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'busy': return 'text-yellow-500';
      case 'away': return 'text-orange-500';
      case 'offline': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const filteredTickets = filterStatus === 'all' 
    ? mockSupportTickets 
    : mockSupportTickets.filter(ticket => ticket.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Support Admin Dashboard</h1>
            <p className="text-slate-400">Customer support management and ticket monitoring</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Badge variant="outline" className="border-green-500 text-green-400">
              {mockSupportMetrics.activeAgents} Agents Online
            </Badge>
          </div>
        </div>

        {/* Support Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Open Tickets */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Open Tickets</CardTitle>
              <MessageSquare className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{mockSupportMetrics.openTickets}</div>
              <p className="text-xs text-slate-500">
                {mockSupportMetrics.pendingTickets} pending review
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-3 h-3 text-blue-500 mr-1" />
                <span className="text-xs text-blue-400">Active support queue</span>
              </div>
            </CardContent>
          </Card>

          {/* Resolved Today */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Resolved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{mockSupportMetrics.resolvedToday}</div>
              <p className="text-xs text-slate-500">
                {mockSupportMetrics.totalTickets} total tickets
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-xs text-green-400">+15% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          {/* Response Time */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{mockSupportMetrics.avgResponseTime}h</div>
              <p className="text-xs text-slate-500">
                Target: 2h response time
              </p>
              <Progress value={75} className="mt-2" />
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Customer Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{mockSupportMetrics.customerSatisfaction}/5</div>
              <p className="text-xs text-slate-500">
                Based on 127 reviews
              </p>
              <div className="flex items-center mt-2">
                <Star className="w-3 h-3 text-yellow-500 mr-1" />
                <span className="text-xs text-yellow-400">Excellent rating</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="tickets" className="data-[state=active]:bg-slate-700">Support Tickets</TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-slate-700">Support Agents</TabsTrigger>
            <TabsTrigger value="feedback" className="data-[state=active]:bg-slate-700">Customer Feedback</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">Settings</TabsTrigger>
          </TabsList>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Support Tickets
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Manage and monitor customer support tickets
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white rounded px-3 py-1 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="escalated">Escalated</option>
                    </select>
                    <Button size="sm" variant="outline">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(ticket.status)}
                            <div>
                              <div className="text-white font-medium">{ticket.id} - {ticket.subject}</div>
                              <div className="text-sm text-slate-400">
                                {ticket.username} ({ticket.email}) • {ticket.created}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                              {ticket.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-white">
                              {ticket.assignedTo || 'Unassigned'}
                            </div>
                            <div className="text-xs text-slate-400">
                              {ticket.messageCount} messages • {ticket.lastUpdate}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <User className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Active Support Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSupportAgents.map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getAgentStatusColor(agent.status).replace('text-', 'bg-')}`}></div>
                          <div>
                            <div className="text-white font-medium">{agent.name}</div>
                            <div className="text-sm text-slate-400">{agent.email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white">{agent.activeTickets} active</div>
                          <div className="text-xs text-slate-400">{agent.resolvedToday} resolved today</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Agent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSupportAgents.map((agent) => (
                      <div key={agent.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">{agent.name}</span>
                          <span className="text-white">{agent.avgRating}/5 ⭐</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Response time: {agent.responseTime}h</span>
                          <span>Rating: {agent.avgRating}</span>
                        </div>
                        <Progress value={agent.avgRating * 20} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customer Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Customer Feedback</CardTitle>
                <CardDescription className="text-slate-400">
                  Customer satisfaction ratings and comments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCustomerFeedback.map((feedback) => (
                    <div key={feedback.id} className="p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-slate-500'}`} 
                                />
                              ))}
                            </div>
                            <span className="text-white font-medium">{feedback.customerName}</span>
                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                              {feedback.category}
                            </Badge>
                          </div>
                          <p className="text-slate-300">{feedback.comment}</p>
                          <div className="text-xs text-slate-400 mt-2">
                            Ticket {feedback.ticketId} • {feedback.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Support Analytics</CardTitle>
                <CardDescription className="text-slate-400">
                  Performance metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{mockSupportMetrics.totalTickets}</div>
                    <div className="text-sm text-slate-400">Total Tickets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{((mockSupportMetrics.resolvedToday / mockSupportMetrics.totalTickets) * 100).toFixed(1)}%</div>
                    <div className="text-sm text-slate-400">Resolution Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{mockSupportMetrics.customerSatisfaction}</div>
                    <div className="text-sm text-slate-400">Avg. Satisfaction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Support Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure support system preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-16">
                    <div className="text-center">
                      <Mail className="w-6 h-6 mx-auto mb-1" />
                      <div>Email Templates</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-16">
                    <div className="text-center">
                      <Users className="w-6 h-6 mx-auto mb-1" />
                      <div>Agent Management</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-16">
                    <div className="text-center">
                      <AlertTriangle className="w-6 h-6 mx-auto mb-1" />
                      <div>Escalation Rules</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-16">
                    <div className="text-center">
                      <Activity className="w-6 h-6 mx-auto mb-1" />
                      <div>Analytics Setup</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}