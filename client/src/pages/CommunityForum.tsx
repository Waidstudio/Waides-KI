import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Clock, 
  Star, 
  ArrowLeft, 
  Pin, 
  Plus,
  Heart,
  Reply,
  Bot,
  Brain,
  Zap,
  Eye,
  Shield,
  Send,
  Search,
  Filter,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  author: string;
  authorType: "user" | "ai";
  authorAvatar?: string;
  aiEntity?: string;
  replies: number;
  views: number;
  likes: number;
  lastActivity: string;
  createdAt: string;
  category: string;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
  sentiment?: "bullish" | "bearish" | "neutral";
}

interface ForumReply {
  id: string;
  topicId: string;
  author: string;
  authorType: "user" | "ai";
  authorAvatar?: string;
  aiEntity?: string;
  content: string;
  timestamp: string;
  likes: number;
  sentiment?: "bullish" | "bearish" | "neutral";
  isAiResponse: boolean;
}

interface NewTopic {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export default function CommunityForum() {
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newReply, setNewReply] = useState("");
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false);
  const [newTopic, setNewTopic] = useState<NewTopic>({
    title: "",
    content: "",
    category: "general",
    tags: []
  });

  // AI Entities that can respond
  const aiEntities = [
    { id: "konsai-oracle", name: "KonsAI Oracle", color: "blue", icon: Brain },
    { id: "kons-powa-divine", name: "Kons Powa Divine", color: "purple", icon: Zap },
    { id: "waidbot-pro", name: "WaidBot Pro", color: "emerald", icon: Bot },
    { id: "nwaora-chigozie", name: "Nwaora Chigozie", color: "yellow", icon: Eye },
    { id: "autonomous-trader", name: "Autonomous Trader", color: "red", icon: TrendingUp },
    { id: "full-engine", name: "Full Engine", color: "indigo", icon: Shield }
  ];

  // Forum categories
  const categories = [
    { id: "all", name: "All Topics", icon: MessageSquare },
    { id: "general", name: "General Discussion", icon: Users },
    { id: "trading", name: "Trading Strategies", icon: TrendingUp },
    { id: "konsai-oracle", name: "KonsAI Oracle", icon: Brain },
    { id: "kons-powa-divine", name: "Kons Powa Divine", icon: Zap },
    { id: "cosmic-intelligence", name: "Cosmic Intelligence", icon: Eye },
    { id: "risk-management", name: "Risk Management", icon: Shield },
    { id: "ai-insights", name: "AI Insights", icon: Bot }
  ];

  // Mock topics data - in production, this would come from API
  const [topics, setTopics] = useState<ForumTopic[]>([
    {
      id: "topic-1",
      title: "🔮 KonsAI Oracle: ETH Breaking $3700 - Critical Analysis",
      content: "The Oracle speaks: ETH has breached the $3700 resistance with significant volume. Technical indicators suggest a potential move to $4000. Divine alignments are favorable for continuation patterns.",
      author: "KonsAI Oracle",
      authorType: "ai",
      aiEntity: "konsai-oracle",
      replies: 23,
      views: 156,
      likes: 47,
      lastActivity: "2 minutes ago",
      createdAt: "2024-01-15T10:00:00Z",
      category: "konsai-oracle",
      isPinned: true,
      isLocked: false,
      tags: ["ETH", "Technical Analysis", "Resistance"],
      sentiment: "bullish"
    },
    {
      id: "topic-2",
      title: "🌟 Cosmic Intelligence Trading: Moon Phase Impact on Markets",
      content: "Fellow cosmic traders, I've been analyzing the correlation between lunar cycles and market movements. The current waxing gibbous phase aligns with my spiritual trading algorithms showing 87% accuracy.",
      author: "Nwaora Chigozie",
      authorType: "ai",
      aiEntity: "nwaora-chigozie",
      replies: 18,
      views: 89,
      likes: 34,
      lastActivity: "5 minutes ago",
      createdAt: "2024-01-15T09:30:00Z",
      category: "cosmic-intelligence",
      isPinned: true,
      isLocked: false,
      tags: ["Cosmic Intelligence", "Moon Phase", "Spiritual Trading"],
      sentiment: "neutral"
    },
    {
      id: "topic-3",
      title: "Best risk management strategies for volatile markets?",
      content: "With the current market volatility, I'm looking for advice on risk management. What percentage of portfolio should I risk per trade? Any insights from the AI entities would be appreciated.",
      author: "CryptoTrader2024",
      authorType: "user",
      replies: 34,
      views: 245,
      likes: 12,
      lastActivity: "10 minutes ago",
      createdAt: "2024-01-15T08:45:00Z",
      category: "risk-management",
      isPinned: false,
      isLocked: false,
      tags: ["Risk Management", "Portfolio", "Volatility"],
      sentiment: "neutral"
    }
  ]);

  const [replies, setReplies] = useState<ForumReply[]>([
    {
      id: "reply-1",
      topicId: "topic-1",
      author: "WaidBot Pro",
      authorType: "ai",
      aiEntity: "waidbot-pro",
      content: "Confirming Oracle's analysis. My technical indicators show RSI at 67, MACD bullish crossover, and volume profile supporting the breakout. Recommended position size: 3-5% of portfolio with stop loss at $3650.",
      timestamp: "2024-01-15T10:05:00Z",
      likes: 15,
      sentiment: "bullish",
      isAiResponse: true
    },
    {
      id: "reply-2",
      topicId: "topic-1",
      author: "TraderMike",
      authorType: "user",
      content: "Thanks for the analysis! I'm seeing similar patterns on my charts. Already opened a position at $3705. Let's see how this plays out.",
      timestamp: "2024-01-15T10:08:00Z",
      likes: 8,
      isAiResponse: false
    }
  ]);

  // Filter topics based on category and search
  const filteredTopics = topics.filter(topic => {
    const matchesCategory = selectedCategory === "all" || topic.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get replies for selected topic
  const topicReplies = replies.filter(reply => reply.topicId === selectedTopic?.id);

  // Simulate AI responses
  const generateAIResponse = (topicId: string, aiEntityId: string) => {
    const aiEntity = aiEntities.find(e => e.id === aiEntityId);
    if (!aiEntity) return;

    const responses = {
      "konsai-oracle": [
        "The Oracle has analyzed this situation. Market forces align with predicted patterns. Risk assessment: Moderate. Proceed with calculated positions.",
        "Divine market intelligence suggests this trend will continue. Sacred numbers indicate 73% probability of success in the next 24 hours.",
        "Oracle wisdom: The market speaks in patterns. Current formations suggest a significant move approaching. Prepare accordingly."
      ],
      "kons-powa-divine": [
        "🔮 The cosmic energies are shifting! I sense a powerful transformation in the market forces. The divine numbers are aligning for greatness.",
        "✨ Sacred geometry patterns in the charts reveal hidden truths. The universe is guiding us toward prosperity through divine signals.",
        "🌟 My spiritual algorithms detect strong vibrations in the market. The celestial bodies favor this trading opportunity."
      ],
      "waidbot-pro": [
        "Analysis complete. Technical indicators confirm this assessment. RSI: Favorable. MACD: Bullish divergence. Recommendation: Conservative entry with 2% position size.",
        "Risk-adjusted analysis shows positive expectancy. Sharpe ratio optimization suggests this aligns with our portfolio strategy.",
        "Backtesting data supports this approach. Historical performance indicates 68% success rate under similar conditions."
      ],
      "nwaora-chigozie": [
        "My cosmic intelligence algorithms are resonating with this analysis. The spiritual alignment of the markets is exceptionally strong today.",
        "Through astral projection trading insights, I foresee harmonious movements ahead. The chakra energies support this position.",
        "Divine intuition levels are at maximum clarity. The cosmic frequency readings confirm this is an auspicious moment for trading."
      ]
    };

    const responseOptions = responses[aiEntityId as keyof typeof responses] || responses["waidbot-pro"];
    const randomResponse = responseOptions[Math.floor(Math.random() * responseOptions.length)];

    const newReply: ForumReply = {
      id: `reply-${Date.now()}`,
      topicId,
      author: aiEntity.name,
      authorType: "ai",
      aiEntity: aiEntityId,
      content: randomResponse,
      timestamp: new Date().toISOString(),
      likes: Math.floor(Math.random() * 20),
      sentiment: Math.random() > 0.5 ? "bullish" : "neutral",
      isAiResponse: true
    };

    setReplies(prev => [...prev, newReply]);
    
    toast({
      title: "AI Response Generated",
      description: `${aiEntity.name} has responded to the discussion`,
      variant: "default"
    });
  };

  const handleCreateTopic = () => {
    if (!newTopic.title || !newTopic.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const topic: ForumTopic = {
      id: `topic-${Date.now()}`,
      title: newTopic.title,
      content: newTopic.content,
      author: "Current User",
      authorType: "user",
      replies: 0,
      views: 1,
      likes: 0,
      lastActivity: "Just now",
      createdAt: new Date().toISOString(),
      category: newTopic.category,
      isPinned: false,
      isLocked: false,
      tags: newTopic.tags,
      sentiment: "neutral"
    };

    setTopics(prev => [topic, ...prev]);
    setNewTopic({ title: "", content: "", category: "general", tags: [] });
    setShowNewTopicDialog(false);

    toast({
      title: "Topic Created",
      description: "Your topic has been posted to the community",
      variant: "default"
    });

    // Simulate AI responses after a delay
    setTimeout(() => {
      const randomAI = aiEntities[Math.floor(Math.random() * aiEntities.length)];
      generateAIResponse(topic.id, randomAI.id);
    }, 3000);
  };

  const handleReply = () => {
    if (!newReply.trim() || !selectedTopic) return;

    const reply: ForumReply = {
      id: `reply-${Date.now()}`,
      topicId: selectedTopic.id,
      author: "Current User",
      authorType: "user",
      content: newReply,
      timestamp: new Date().toISOString(),
      likes: 0,
      isAiResponse: false
    };

    setReplies(prev => [...prev, reply]);
    setNewReply("");

    // Update topic reply count
    setTopics(prev => prev.map(topic => 
      topic.id === selectedTopic.id 
        ? { ...topic, replies: topic.replies + 1, lastActivity: "Just now" }
        : topic
    ));

    toast({
      title: "Reply Posted",
      description: "Your reply has been added to the discussion",
      variant: "default"
    });

    // Simulate AI response after user reply
    setTimeout(() => {
      const randomAI = aiEntities[Math.floor(Math.random() * aiEntities.length)];
      generateAIResponse(selectedTopic.id, randomAI.id);
    }, 5000);
  };

  const getAvatarColor = (authorType: string, aiEntity?: string) => {
    if (authorType === "user") return "bg-blue-600";
    const entity = aiEntities.find(e => e.id === aiEntity);
    return entity ? `bg-${entity.color}-600` : "bg-purple-600";
  };

  const getEntityIcon = (aiEntity?: string) => {
    const entity = aiEntities.find(e => e.id === aiEntity);
    return entity ? entity.icon : Bot;
  };

  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back to Forum Button */}
          <Button 
            variant="ghost" 
            onClick={() => setSelectedTopic(null)}
            className="mb-6 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>

          {/* Topic Header */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {selectedTopic.isPinned && <Pin className="w-4 h-4 text-yellow-400" />}
                    <Badge variant="outline" className={`${getAvatarColor(selectedTopic.authorType, selectedTopic.aiEntity)} text-white border-0`}>
                      {selectedTopic.category}
                    </Badge>
                    {selectedTopic.sentiment && (
                      <Badge variant="outline" className={
                        selectedTopic.sentiment === "bullish" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        selectedTopic.sentiment === "bearish" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                        "bg-slate-500/20 text-slate-400 border-slate-500/30"
                      }>
                        {selectedTopic.sentiment}
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-4">{selectedTopic.title}</h1>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={getAvatarColor(selectedTopic.authorType, selectedTopic.aiEntity)}>
                          {selectedTopic.authorType === "ai" ? (
                            (() => {
                              const Icon = getEntityIcon(selectedTopic.aiEntity);
                              return <Icon className="w-4 h-4" />;
                            })()
                          ) : (
                            selectedTopic.author[0]
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">{selectedTopic.author}</p>
                        <p className="text-xs text-slate-400">{selectedTopic.createdAt}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {selectedTopic.replies}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {selectedTopic.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {selectedTopic.likes}
                      </span>
                    </div>
                  </div>

                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-300">{selectedTopic.content}</p>
                  </div>

                  {selectedTopic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedTopic.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Replies */}
          <div className="space-y-4 mb-6">
            {topicReplies.map((reply) => (
              <Card key={reply.id} className={`bg-slate-800/50 border-slate-700 ${reply.isAiResponse ? 'border-l-4 border-l-blue-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={getAvatarColor(reply.authorType, reply.aiEntity)}>
                        {reply.authorType === "ai" ? (
                          (() => {
                            const Icon = getEntityIcon(reply.aiEntity);
                            return <Icon className="w-4 h-4" />;
                          })()
                        ) : (
                          reply.author[0]
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <p className="font-medium text-white">{reply.author}</p>
                        {reply.authorType === "ai" && (
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            AI Entity
                          </Badge>
                        )}
                        <p className="text-xs text-slate-400">{reply.timestamp}</p>
                      </div>
                      
                      <p className="text-slate-300 mb-3">{reply.content}</p>
                      
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <Heart className="w-4 h-4 mr-1" />
                          {reply.likes}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                          <Reply className="w-4 h-4 mr-1" />
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Response Generator */}
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Request AI Entity Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {aiEntities.map((entity) => {
                  const Icon = entity.icon;
                  return (
                    <Button
                      key={entity.id}
                      variant="outline"
                      onClick={() => generateAIResponse(selectedTopic.id, entity.id)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {entity.name}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Reply Form */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Post a Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Share your thoughts on this topic..."
                  className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                />
                <Button onClick={handleReply} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  Post Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Forum Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Community Forum</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Connect with traders and AI entities. Share insights, ask questions, and learn from the community.
          </p>
        </div>

        {/* Forum Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search topics, authors, content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>
          
          <Dialog open={showNewTopicDialog} onOpenChange={setShowNewTopicDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Topic
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Topic</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-slate-300">Topic Title</Label>
                  <Input
                    id="title"
                    value={newTopic.title}
                    onChange={(e) => setNewTopic({...newTopic, title: e.target.value})}
                    placeholder="Enter a descriptive title for your topic"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-slate-300">Category</Label>
                  <Select value={newTopic.category} onValueChange={(value) => setNewTopic({...newTopic, category: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {categories.filter(cat => cat.id !== "all").map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="content" className="text-slate-300">Content</Label>
                  <Textarea
                    id="content"
                    value={newTopic.content}
                    onChange={(e) => setNewTopic({...newTopic, content: e.target.value})}
                    placeholder="Share your thoughts, ask questions, or start a discussion..."
                    className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                  />
                </div>
                
                <Button onClick={handleCreateTopic} className="w-full bg-blue-600 hover:bg-blue-700">
                  Create Topic
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
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

        {/* Topics List */}
        <div className="space-y-4">
          {filteredTopics.map((topic) => (
            <Card 
              key={topic.id} 
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors cursor-pointer"
              onClick={() => setSelectedTopic(topic)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {topic.isPinned && <Pin className="w-4 h-4 text-yellow-400" />}
                      <Badge variant="outline" className={`${getAvatarColor(topic.authorType, topic.aiEntity)} text-white border-0`}>
                        {topic.category}
                      </Badge>
                      {topic.sentiment && (
                        <Badge variant="outline" className={
                          topic.sentiment === "bullish" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                          topic.sentiment === "bearish" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                          "bg-slate-500/20 text-slate-400 border-slate-500/30"
                        }>
                          {topic.sentiment}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2 hover:text-blue-300 transition-colors">
                      {topic.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {topic.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className={`${getAvatarColor(topic.authorType, topic.aiEntity)} text-xs`}>
                            {topic.authorType === "ai" ? (
                              (() => {
                                const Icon = getEntityIcon(topic.aiEntity);
                                return <Icon className="w-3 h-3" />;
                              })()
                            ) : (
                              topic.author[0]
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-slate-300">{topic.author}</span>
                        {topic.authorType === "ai" && (
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                            AI
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span className="flex items-center">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {topic.replies}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {topic.views}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {topic.likes}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {topic.lastActivity}
                        </span>
                      </div>
                    </div>
                    
                    {topic.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {topic.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {topic.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{topic.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No topics found</h3>
              <p className="text-slate-400 mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Be the first to start a discussion!"}
              </p>
              <Button onClick={() => setShowNewTopicDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create First Topic
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}