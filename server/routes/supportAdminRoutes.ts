import { Router } from 'express';

// Simple auth middleware for support admin routes
const authMiddleware = (req: any, res: any, next: any) => {
  // In production, this would verify admin authentication
  // For now, we'll allow all requests to pass through
  next();
};

const router = Router();

// Mock support ticket data
const getSupportTickets = () => [
  {
    id: 'TK-2024-001',
    userId: 'user_123',
    username: 'john_trader',
    email: 'john@example.com',
    subject: 'Unable to connect to Binance API',
    category: ['technical', 'billing', 'account', 'trading', 'general'][Math.floor(Math.random() * 5)],
    priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
    status: ['open', 'in_progress', 'resolved', 'closed'][Math.floor(Math.random() * 4)],
    created: `${Math.floor(Math.random() * 24)} hours ago`,
    lastUpdate: `${Math.floor(Math.random() * 120)} min ago`,
    assignedTo: Math.random() > 0.3 ? ['Sarah Chen', 'Mike Johnson', 'Lisa Wong', 'David Kim'][Math.floor(Math.random() * 4)] : null,
    messageCount: Math.floor(Math.random() * 15) + 1
  },
  {
    id: 'TK-2024-002',
    userId: 'user_456',
    username: 'crypto_mary',
    email: 'mary@example.com',
    subject: 'SmaiSika wallet balance not updating',
    category: ['technical', 'billing', 'account', 'trading', 'general'][Math.floor(Math.random() * 5)],
    priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
    status: ['open', 'in_progress', 'resolved', 'closed'][Math.floor(Math.random() * 4)],
    created: `${Math.floor(Math.random() * 24)} hours ago`,
    lastUpdate: `${Math.floor(Math.random() * 120)} min ago`,
    assignedTo: Math.random() > 0.3 ? ['Sarah Chen', 'Mike Johnson', 'Lisa Wong', 'David Kim'][Math.floor(Math.random() * 4)] : null,
    messageCount: Math.floor(Math.random() * 15) + 1
  },
  {
    id: 'TK-2024-003',
    userId: 'user_789',
    username: 'trader_bob',
    email: 'bob@example.com',
    subject: 'Billing question about Pro subscription',
    category: ['technical', 'billing', 'account', 'trading', 'general'][Math.floor(Math.random() * 5)],
    priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
    status: ['open', 'in_progress', 'resolved', 'closed'][Math.floor(Math.random() * 4)],
    created: `${Math.floor(Math.random() * 48)} hours ago`,
    lastUpdate: `${Math.floor(Math.random() * 240)} min ago`,
    assignedTo: Math.random() > 0.3 ? ['Sarah Chen', 'Mike Johnson', 'Lisa Wong', 'David Kim'][Math.floor(Math.random() * 4)] : null,
    messageCount: Math.floor(Math.random() * 15) + 1
  },
  {
    id: 'TK-2024-004',
    userId: 'user_012',
    username: 'new_user_2024',
    email: 'newuser@example.com',
    subject: 'Account verification issues',
    category: ['technical', 'billing', 'account', 'trading', 'general'][Math.floor(Math.random() * 5)],
    priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
    status: ['open', 'in_progress', 'resolved', 'closed'][Math.floor(Math.random() * 4)],
    created: `${Math.floor(Math.random() * 12)} hours ago`,
    lastUpdate: `${Math.floor(Math.random() * 60)} min ago`,
    assignedTo: Math.random() > 0.3 ? ['Sarah Chen', 'Mike Johnson', 'Lisa Wong', 'David Kim'][Math.floor(Math.random() * 4)] : null,
    messageCount: Math.floor(Math.random() * 15) + 1
  },
  {
    id: 'TK-2024-005',
    userId: 'user_345',
    username: 'advanced_trader',
    email: 'advanced@example.com',
    subject: 'Bot configuration not saving',
    category: ['technical', 'billing', 'account', 'trading', 'general'][Math.floor(Math.random() * 5)],
    priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
    status: ['open', 'in_progress', 'resolved', 'closed'][Math.floor(Math.random() * 4)],
    created: `${Math.floor(Math.random() * 6)} hours ago`,
    lastUpdate: `${Math.floor(Math.random() * 30)} min ago`,
    assignedTo: Math.random() > 0.3 ? ['Sarah Chen', 'Mike Johnson', 'Lisa Wong', 'David Kim'][Math.floor(Math.random() * 4)] : null,
    messageCount: Math.floor(Math.random() * 15) + 1
  }
];

const getSupportMetrics = () => {
  const tickets = getSupportTickets();
  const totalTickets = Math.floor(Math.random() * 1000) + 500;
  const openTickets = tickets.filter(t => t.status === 'open').length + Math.floor(Math.random() * 50);
  const resolvedToday = Math.floor(Math.random() * 50) + 20;
  const activeAgents = Math.floor(Math.random() * 5) + 6;

  return {
    totalTickets,
    openTickets,
    resolvedToday,
    avgResponseTime: (Math.random() * 3) + 1, // 1-4 hours
    customerSatisfaction: (Math.random() * 1.5) + 3.5, // 3.5-5.0
    activeAgents,
    pendingTickets: Math.floor(Math.random() * 30) + 10,
    escalatedTickets: Math.floor(Math.random() * 10)
  };
};

const getSupportAgents = () => [
  {
    id: 'agent_001',
    name: 'Sarah Chen',
    email: 'sarah@waideski.com',
    status: ['online', 'busy', 'away', 'offline'][Math.floor(Math.random() * 4)],
    activeTickets: Math.floor(Math.random() * 15) + 5,
    resolvedToday: Math.floor(Math.random() * 15) + 2,
    avgRating: (Math.random() * 1.5) + 3.5,
    responseTime: Math.random() * 2 + 0.5
  },
  {
    id: 'agent_002',
    name: 'Mike Johnson',
    email: 'mike@waideski.com',
    status: ['online', 'busy', 'away', 'offline'][Math.floor(Math.random() * 4)],
    activeTickets: Math.floor(Math.random() * 15) + 5,
    resolvedToday: Math.floor(Math.random() * 15) + 2,
    avgRating: (Math.random() * 1.5) + 3.5,
    responseTime: Math.random() * 2 + 0.5
  },
  {
    id: 'agent_003',
    name: 'Lisa Wong',
    email: 'lisa@waideski.com',
    status: ['online', 'busy', 'away', 'offline'][Math.floor(Math.random() * 4)],
    activeTickets: Math.floor(Math.random() * 15) + 5,
    resolvedToday: Math.floor(Math.random() * 15) + 2,
    avgRating: (Math.random() * 1.5) + 3.5,
    responseTime: Math.random() * 2 + 0.5
  },
  {
    id: 'agent_004',
    name: 'David Kim',
    email: 'david@waideski.com',
    status: ['online', 'busy', 'away', 'offline'][Math.floor(Math.random() * 4)],
    activeTickets: Math.floor(Math.random() * 15) + 5,
    resolvedToday: Math.floor(Math.random() * 15) + 2,
    avgRating: (Math.random() * 1.5) + 3.5,
    responseTime: Math.random() * 2 + 0.5
  }
];

const getCustomerFeedback = () => [
  {
    id: 'fb_001',
    ticketId: 'TK-2024-003',
    rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
    comment: 'Excellent support! Resolved my billing issue quickly.',
    customerName: 'trader_bob',
    date: `${Math.floor(Math.random() * 24)} hours ago`,
    category: 'billing'
  },
  {
    id: 'fb_002',
    ticketId: 'TK-2024-006',
    rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars
    comment: 'Good support, but took a bit longer than expected.',
    customerName: 'crypto_enthusiast',
    date: `${Math.floor(Math.random() * 48)} hours ago`,
    category: 'technical'
  },
  {
    id: 'fb_003',
    ticketId: 'TK-2024-007',
    rating: 5,
    comment: 'Amazing help with bot configuration!',
    customerName: 'pro_trader_x',
    date: `${Math.floor(Math.random() * 72)} hours ago`,
    category: 'trading'
  }
];

// Get support metrics
router.get('/support/metrics', authMiddleware, (req, res) => {
  try {
    const metrics = getSupportMetrics();
    res.json({ success: true, metrics });
  } catch (error) {
    console.error('Failed to get support metrics:', error);
    res.status(500).json({ success: false, message: 'Failed to get support metrics' });
  }
});

// Get support tickets
router.get('/support/tickets', authMiddleware, (req, res) => {
  try {
    const tickets = getSupportTickets();
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Failed to get support tickets:', error);
    res.status(500).json({ success: false, message: 'Failed to get support tickets' });
  }
});

// Get support agents
router.get('/support/agents', authMiddleware, (req, res) => {
  try {
    const agents = getSupportAgents();
    res.json({ success: true, agents });
  } catch (error) {
    console.error('Failed to get support agents:', error);
    res.status(500).json({ success: false, message: 'Failed to get support agents' });
  }
});

// Get customer feedback
router.get('/support/feedback', authMiddleware, (req, res) => {
  try {
    const feedback = getCustomerFeedback();
    res.json({ success: true, feedback });
  } catch (error) {
    console.error('Failed to get customer feedback:', error);
    res.status(500).json({ success: false, message: 'Failed to get customer feedback' });
  }
});

// Assign ticket to agent
router.post('/support/tickets/:ticketId/assign', authMiddleware, (req, res) => {
  try {
    const { ticketId } = req.params;
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ success: false, message: 'Agent ID is required' });
    }
    
    // In production, this would update the ticket assignment in the database
    console.log(`🎫 Ticket assigned: ${ticketId} to agent ${agentId}`);
    
    res.json({ 
      success: true, 
      message: `Ticket ${ticketId} assigned successfully`,
      ticketId,
      agentId 
    });
  } catch (error) {
    console.error('Failed to assign ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to assign ticket' });
  }
});

// Update ticket status
router.post('/support/tickets/:ticketId/status', authMiddleware, (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed', 'escalated'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    // In production, this would update the ticket status in the database
    console.log(`🎫 Ticket status updated: ${ticketId} to ${status}`);
    
    res.json({ 
      success: true, 
      message: `Ticket ${ticketId} status updated to ${status}`,
      ticketId,
      status 
    });
  } catch (error) {
    console.error('Failed to update ticket status:', error);
    res.status(500).json({ success: false, message: 'Failed to update ticket status' });
  }
});

// Create new support ticket
router.post('/support/tickets', authMiddleware, (req, res) => {
  try {
    const { userId, subject, category, priority, description } = req.body;
    
    if (!userId || !subject || !category) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const ticketId = `TK-2024-${Math.floor(Math.random() * 9999).toString().padStart(3, '0')}`;
    
    // In production, this would create the ticket in the database
    console.log(`🎫 New ticket created: ${ticketId} - ${subject}`);
    
    res.json({ 
      success: true, 
      message: 'Support ticket created successfully',
      ticketId,
      ticket: {
        id: ticketId,
        userId,
        subject,
        category,
        priority: priority || 'medium',
        status: 'open',
        created: 'just now',
        lastUpdate: 'just now',
        messageCount: 1
      }
    });
  } catch (error) {
    console.error('Failed to create ticket:', error);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
});

export default router;