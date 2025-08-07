import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  HelpCircle,
  MessageSquare,
  FileText,
  Search,
  Bot,
  Zap,
  Shield,
  Wallet,
  TrendingUp,
  Brain,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  BookOpen,
  Video,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  lastUpdate: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

const SupportPage = () => {
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [ticketForm, setTicketForm] = useState({
    title: '',
    category: 'general',
    priority: 'medium',
    description: ''
  });

  const [tickets] = useState<SupportTicket[]>([
    {
      id: 'TKT-001',
      title: 'WaidBot Pro not executing trades',
      status: 'in_progress',
      priority: 'high',
      category: 'trading',
      createdAt: '2024-01-15T10:00:00Z',
      lastUpdate: '2024-01-15T14:30:00Z'
    },
    {
      id: 'TKT-002',
      title: 'Cosmic Intelligence settings not saving',
      status: 'resolved',
      priority: 'medium',
      category: 'nwaora-chigozie',
      createdAt: '2024-01-14T16:20:00Z',
      lastUpdate: '2024-01-15T09:15:00Z'
    }
  ]);

  const faqs: FAQ[] = [
    {
      id: 'faq-1',
      question: 'How do I activate Nwaora Chigozie cosmic intelligence features?',
      answer: 'Navigate to the WaidBot Engine page, select Nwaora Chigozie, and go to the Settings tab. Enable cosmic intelligence features including divine intuition levels, spiritual alignment, and chakra focus. Set your preferred cosmic frequency (432-963 Hz) and enable astral projection trading for enhanced market insights.',
      category: 'nwaora-chigozie',
      helpful: 47
    },
    {
      id: 'faq-2',
      question: 'Why is my bot not executing trades automatically?',
      answer: 'Check these common issues: 1) Ensure auto-trading is enabled in bot settings, 2) Verify sufficient balance in your trading account, 3) Check if emergency stop is activated, 4) Confirm your API keys are properly configured, 5) Review risk management settings for trade limits.',
      category: 'trading',
      helpful: 92
    },
    {
      id: 'faq-3',
      question: 'How do I set up cosmic frequency alignment for better trading?',
      answer: 'In Nwaora Chigozie settings, configure cosmic frequency between 432-963 Hz. 528 Hz is optimal for manifestation, 432 Hz for grounding, and 963 Hz for divine connection. Enable moon phase synchronization and crystal energy amplification for enhanced cosmic alignment.',
      category: 'nwaora-chigozie',
      helpful: 34
    },
    {
      id: 'faq-4',
      question: 'What are the different bot tiers and their features?',
      answer: 'Maibot (Free): Basic trading signals. WaidBot (Premium): Advanced AI with risk management. WaidBot Pro (Elite): Professional features with enhanced analytics. Autonomous Trader (Expert): Fully automated trading. Full Engine (Master): Complete system with all features. Nwaora Chigozie (Cosmic): Spiritual AI with cosmic intelligence.',
      category: 'bots',
      helpful: 156
    },
    {
      id: 'faq-5',
      question: 'How do I configure risk management settings?',
      answer: 'Access Settings → Trading Preferences. Set stop loss percentage (recommended 5-10%), take profit percentage (10-25%), maximum daily trades, and risk level (conservative/moderate/aggressive). Enable position sizing based on Kelly Criterion for optimal risk management.',
      category: 'risk-management',
      helpful: 73
    },
    {
      id: 'faq-6',
      question: 'How do I withdraw profits from my SmaiSika wallet?',
      answer: 'Go to Wallet → Withdraw. Select your preferred method (bank transfer, mobile money, crypto). Enter amount and destination details. Withdrawals are processed within 24 hours for verified accounts. Minimum withdrawal amounts apply based on method.',
      category: 'wallet',
      helpful: 89
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: HelpCircle },
    { id: 'trading', name: 'Trading & Bots', icon: Bot },
    { id: 'nwaora-chigozie', name: 'Cosmic Intelligence', icon: Zap },
    { id: 'wallet', name: 'Wallet & Payments', icon: Wallet },
    { id: 'risk-management', name: 'Risk Management', icon: Shield },
    { id: 'bots', name: 'Bot Management', icon: Brain },
    { id: 'technical', name: 'Technical Issues', icon: AlertCircle }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-slate-400" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitTicket = () => {
    if (!ticketForm.title || !ticketForm.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Support Ticket Created",
      description: `Your ticket has been submitted. Ticket ID: TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      variant: "default",
    });

    setTicketForm({
      title: '',
      category: 'general',
      priority: 'medium',
      description: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Support Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Support Center</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Get help with Waides KI, from basic trading questions to advanced cosmic intelligence features
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Documentation</h3>
              <p className="text-slate-400 text-sm">Comprehensive guides and tutorials</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <Video className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Video Tutorials</h3>
              <p className="text-slate-400 text-sm">Step-by-step video guides</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageSquare className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
              <p className="text-slate-400 text-sm">Chat with our support team</p>
            </CardContent>
          </Card>
        </div>

        {/* Support Tabs */}
        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="faq" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
              <FileText className="w-4 h-4 mr-2" />
              Support Tickets
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-300">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Us
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <div className="space-y-6">
              {/* Search and Filter */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Search FAQs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(category.id)}
                            className={selectedCategory === category.id 
                              ? "bg-blue-600 hover:bg-blue-700" 
                              : "border-slate-600 text-slate-300 hover:bg-slate-700"
                            }
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {category.name}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ List */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFAQs.map((faq, index) => (
                      <AccordionItem key={faq.id} value={`item-${index}`} className="border-slate-700">
                        <AccordionTrigger className="text-left text-white hover:text-blue-300">
                          <div className="flex items-start justify-between w-full mr-4">
                            <span>{faq.question}</span>
                            <div className="flex items-center space-x-2 ml-4">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm text-slate-400">{faq.helpful}</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-300">
                          <p className="mb-4">{faq.answer}</p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {faq.category.replace('-', ' ')}
                            </Badge>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-slate-400">Was this helpful?</span>
                              <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tickets Tab */}
          <TabsContent value="tickets">
            <div className="space-y-6">
              {/* My Tickets */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">My Support Tickets</CardTitle>
                  <CardDescription>View and track your support requests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-medium">{ticket.title}</h3>
                          <p className="text-sm text-slate-400">#{ticket.id}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(ticket.status)}
                          <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-400">
                        <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Create New Ticket */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Create New Support Ticket</CardTitle>
                  <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-slate-300">Subject *</Label>
                      <Input
                        id="title"
                        value={ticketForm.title}
                        onChange={(e) => setTicketForm({...ticketForm, title: e.target.value})}
                        placeholder="Brief description of your issue"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-slate-300">Category</Label>
                      <select
                        id="category"
                        value={ticketForm.category}
                        onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                        className="w-full p-3 bg-slate-700 border-slate-600 text-white rounded-md"
                      >
                        <option value="general">General Support</option>
                        <option value="trading">Trading & Bots</option>
                        <option value="nwaora-chigozie">Cosmic Intelligence</option>
                        <option value="wallet">Wallet & Payments</option>
                        <option value="technical">Technical Issues</option>
                        <option value="account">Account Management</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-slate-300">Priority</Label>
                    <select
                      id="priority"
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                      className="w-full p-3 bg-slate-700 border-slate-600 text-white rounded-md"
                    >
                      <option value="low">Low - General inquiry</option>
                      <option value="medium">Medium - Standard issue</option>
                      <option value="high">High - Important issue</option>
                      <option value="urgent">Urgent - Critical issue</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-300">Description *</Label>
                    <Textarea
                      id="description"
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                      placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable"
                      className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                    />
                  </div>

                  <Button onClick={handleSubmitTicket} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Support Ticket
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Contact Information</CardTitle>
                  <CardDescription>Get in touch with our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Live Chat</h3>
                    <p className="text-sm text-slate-400 mb-3">Available 24/7 for immediate assistance</p>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Live Chat
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Email Support</h3>
                    <p className="text-sm text-slate-400 mb-3">support@waidesai.com</p>
                    <p className="text-xs text-slate-500">Response time: 2-4 hours</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Phone Support</h3>
                    <p className="text-sm text-slate-400 mb-3">+234 800 WAIDES (923377)</p>
                    <p className="text-xs text-slate-500">Available: 9 AM - 6 PM WAT</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Additional Resources</CardTitle>
                  <CardDescription>Helpful links and downloads</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
                      <BookOpen className="w-4 h-4 mr-2" />
                      User Guide PDF
                      <Download className="w-4 h-4 ml-auto" />
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Video className="w-4 h-4 mr-2" />
                      Video Tutorials
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Bot className="w-4 h-4 mr-2" />
                      Bot Setup Guide
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Zap className="w-4 h-4 mr-2" />
                      Cosmic Intelligence Manual
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupportPage;