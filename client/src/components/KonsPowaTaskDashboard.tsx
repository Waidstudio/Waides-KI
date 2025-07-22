import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  Activity, 
  Zap, 
  Shield, 
  Database,
  Cpu,
  Network,
  Timer,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Sparkles
} from 'lucide-react';
import { SacredGrid, SacredGridItem, SacredContainer, SacredSection, SacredText } from '@/components/ui/SacredResponsiveGrid';
import { FloatingElement } from '@/components/ui/SacredMotion';

interface TaskStatus {
  id: string;
  name: string;
  category: 'system' | 'trading' | 'monitoring' | 'healing' | 'optimization';
  status: 'running' | 'completed' | 'failed' | 'pending';
  progress: number;
  lastRun: string;
  nextRun: string;
  executionTime: number;
  description: string;
}

interface SystemMetrics {
  totalTasks: number;
  activeTasks: number;
  completedToday: number;
  failureRate: number;
  systemHealth: number;
  autoHealingActive: boolean;
  tasksPerSecond: number;
  uptime: string;
}

export const KonsPowaTaskDashboard = () => {
  const [autoMode, setAutoMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalTasks: 150,
    activeTasks: 47,
    completedToday: 1247,
    failureRate: 0.2,
    systemHealth: 98.7,
    autoHealingActive: true,
    tasksPerSecond: 12.4,
    uptime: "7d 14h 23m"
  });

  const [tasks, setTasks] = useState<TaskStatus[]>([
    {
      id: 'trade-monitor',
      name: 'ETH Trade Monitoring',
      category: 'trading',
      status: 'running',
      progress: 100,
      lastRun: '2s ago',
      nextRun: '3s',
      executionTime: 142,
      description: 'Real-time ETH price monitoring and signal detection'
    },
    {
      id: 'system-health',
      name: 'System Health Check',
      category: 'system',
      status: 'completed',
      progress: 100,
      lastRun: '30s ago',
      nextRun: '30s',
      executionTime: 89,
      description: 'Comprehensive system health validation'
    },
    {
      id: 'db-optimize',
      name: 'Database Optimization',
      category: 'optimization',
      status: 'running',
      progress: 67,
      lastRun: '5m ago',
      nextRun: '15m',
      executionTime: 3420,
      description: 'Automated database performance optimization'
    },
    {
      id: 'auto-healing',
      name: 'Auto-Healing Engine',
      category: 'healing',
      status: 'running',
      progress: 100,
      lastRun: '1s ago',
      nextRun: '10s',
      executionTime: 45,
      description: 'Continuous system monitoring and auto-repair'
    },
    {
      id: 'risk-analysis',
      name: 'Risk Assessment',
      category: 'monitoring',
      status: 'running',
      progress: 89,
      lastRun: '10s ago',
      nextRun: '1m',
      executionTime: 234,
      description: 'Real-time trading risk analysis and alerts'
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => ({
        ...task,
        progress: task.status === 'running' ? Math.min(100, task.progress + Math.random() * 5) : task.progress,
        lastRun: task.status === 'running' ? `${Math.floor(Math.random() * 60)}s ago` : task.lastRun
      })));

      setMetrics(prev => ({
        ...prev,
        activeTasks: 45 + Math.floor(Math.random() * 10),
        tasksPerSecond: 10 + Math.random() * 5,
        completedToday: prev.completedToday + Math.floor(Math.random() * 3)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Activity className="h-4 w-4 text-green-400 animate-pulse" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-blue-400" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'pending': return <Timer className="h-4 w-4 text-yellow-400" />;
      default: return <Timer className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Cpu className="h-4 w-4" />;
      case 'trading': return <BarChart3 className="h-4 w-4" />;
      case 'monitoring': return <Shield className="h-4 w-4" />;
      case 'healing': return <Zap className="h-4 w-4" />;
      case 'optimization': return <Settings className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  return (
    <SacredContainer size="full" className="py-8">
      <SacredSection gradient="cosmic" padding="md" className="rounded-lg border border-purple-500/20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <SacredText variant="h2" gradient className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-400" />
              KonsPowa Task Engine
            </SacredText>
            <SacredText variant="body" className="mt-2">
              Autonomous system orchestration toward infinite scalability
            </SacredText>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <SacredText variant="caption">Auto Mode</SacredText>
              <Switch 
                checked={autoMode} 
                onCheckedChange={setAutoMode}
                className="data-[state=checked]:bg-purple-600"
              />
            </div>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              <Activity className="h-3 w-3 mr-1 animate-pulse" />
              {metrics.activeTasks} Active
            </Badge>
          </div>
        </div>

        {/* Metrics Dashboard */}
        <SacredGrid columns={4} gap="md" className="mb-8" animated>
          <SacredGridItem span={1} animated>
            <FloatingElement>
              <Card className="bg-slate-800/40 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <SacredText variant="caption" className="text-purple-300">System Health</SacredText>
                      <SacredText variant="h3" className="text-green-400 font-mono">
                        {metrics.systemHealth}%
                      </SacredText>
                    </div>
                    <Shield className="h-8 w-8 text-green-400" />
                  </div>
                  <Progress 
                    value={metrics.systemHealth} 
                    className="mt-3 h-2 bg-slate-700"
                  />
                </CardContent>
              </Card>
            </FloatingElement>
          </SacredGridItem>

          <SacredGridItem span={1} animated>
            <FloatingElement>
              <Card className="bg-slate-800/40 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <SacredText variant="caption" className="text-purple-300">Tasks/Second</SacredText>
                      <SacredText variant="h3" className="text-cyan-400 font-mono">
                        {metrics.tasksPerSecond.toFixed(1)}
                      </SacredText>
                    </div>
                    <Zap className="h-8 w-8 text-cyan-400 animate-pulse" />
                  </div>
                  <SacredText variant="caption" className="text-cyan-300 mt-2">
                    Processing Rate
                  </SacredText>
                </CardContent>
              </Card>
            </FloatingElement>
          </SacredGridItem>

          <SacredGridItem span={1} animated>
            <FloatingElement>
              <Card className="bg-slate-800/40 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <SacredText variant="caption" className="text-purple-300">Completed Today</SacredText>
                      <SacredText variant="h3" className="text-blue-400 font-mono">
                        {metrics.completedToday.toLocaleString()}
                      </SacredText>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-400" />
                  </div>
                  <SacredText variant="caption" className="text-blue-300 mt-2">
                    Success Rate: {(100 - metrics.failureRate).toFixed(1)}%
                  </SacredText>
                </CardContent>
              </Card>
            </FloatingElement>
          </SacredGridItem>

          <SacredGridItem span={1} animated>
            <FloatingElement>
              <Card className="bg-slate-800/40 border-purple-500/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <SacredText variant="caption" className="text-purple-300">Uptime</SacredText>
                      <SacredText variant="h3" className="text-purple-400 font-mono">
                        {metrics.uptime}
                      </SacredText>
                    </div>
                    <Network className="h-8 w-8 text-purple-400" />
                  </div>
                  <SacredText variant="caption" className="text-purple-300 mt-2">
                    Auto-Healing: {metrics.autoHealingActive ? 'Active' : 'Inactive'}
                  </SacredText>
                </CardContent>
              </Card>
            </FloatingElement>
          </SacredGridItem>
        </SacredGrid>

        {/* Task Management */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 bg-slate-800/40 mb-6">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600">All</TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-purple-600">System</TabsTrigger>
            <TabsTrigger value="trading" className="data-[state=active]:bg-purple-600">Trading</TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-purple-600">Monitor</TabsTrigger>
            <TabsTrigger value="healing" className="data-[state=active]:bg-purple-600">Healing</TabsTrigger>
            <TabsTrigger value="optimization" className="data-[state=active]:bg-purple-600">Optimize</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-0">
            <SacredGrid columns={1} gap="md" animated>
              <AnimatePresence>
                {filteredTasks.map((task, index) => (
                  <SacredGridItem key={task.id} span={1} animated>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-slate-800/30 border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {getCategoryIcon(task.category)}
                                <SacredText variant="h4" className="text-white font-semibold">
                                  {task.name}
                                </SacredText>
                                <Badge 
                                  variant="outline" 
                                  className={`${getStatusColor(task.status)} text-xs`}
                                >
                                  {getStatusIcon(task.status)}
                                  {task.status}
                                </Badge>
                              </div>
                              
                              <SacredText variant="caption" className="text-gray-400 mb-3">
                                {task.description}
                              </SacredText>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <SacredText variant="caption" className="text-purple-300">Last Run</SacredText>
                                  <SacredText variant="caption" className="text-white font-mono">
                                    {task.lastRun}
                                  </SacredText>
                                </div>
                                <div>
                                  <SacredText variant="caption" className="text-purple-300">Next Run</SacredText>
                                  <SacredText variant="caption" className="text-white font-mono">
                                    {task.nextRun}
                                  </SacredText>
                                </div>
                                <div>
                                  <SacredText variant="caption" className="text-purple-300">Execution</SacredText>
                                  <SacredText variant="caption" className="text-white font-mono">
                                    {task.executionTime}ms
                                  </SacredText>
                                </div>
                                <div>
                                  <SacredText variant="caption" className="text-purple-300">Progress</SacredText>
                                  <SacredText variant="caption" className="text-white font-mono">
                                    {task.progress}%
                                  </SacredText>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 sm:min-w-[200px]">
                              <Progress 
                                value={task.progress} 
                                className="h-2 bg-slate-700"
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/20"
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Run
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex-1 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                                >
                                  <Pause className="h-3 w-3 mr-1" />
                                  Pause
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                                >
                                  <Square className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </SacredGridItem>
                ))}
              </AnimatePresence>
            </SacredGrid>
          </TabsContent>
        </Tabs>
      </SacredSection>
    </SacredContainer>
  );
};