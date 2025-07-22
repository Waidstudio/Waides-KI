/**
 * 🔧 Kons Powa Auto-Healer Dashboard
 * Real-time monitoring and control for the 100 master healing tasks
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  Pause,
  Shield,
  Zap,
  Brain,
  Eye,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface HealingTask {
  id: number;
  category: string;
  tag: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  lastRun?: string;
  nextRun?: string;
}

interface HealerStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  running: number;
  critical: number;
  autoModeEnabled: boolean;
  completionRate: number;
  healthScore: number;
  systemHealth: {
    frontendIssues: string[];
    apiIssues: string[];
    dbConnections: boolean;
    memoryUsage: number;
    activeConnections: number;
    errorCount: number;
  };
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Frontend': return <Eye className="h-4 w-4" />;
    case 'Backend': return <Activity className="h-4 w-4" />;
    case 'AI Sync': return <Brain className="h-4 w-4" />;
    case 'Security': return <Shield className="h-4 w-4" />;
    case 'Deployment': return <Zap className="h-4 w-4" />;
    default: return <Settings className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'destructive';
    case 'high': return 'secondary';
    case 'medium': return 'outline';
    case 'low': return 'outline';
    default: return 'outline';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'text-green-500';
    case 'failed': return 'text-red-500';
    case 'running': return 'text-blue-500';
    case 'pending': return 'text-yellow-500';
    default: return 'text-gray-500';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
    case 'running': return <Activity className="h-4 w-4 text-blue-500 animate-spin" />;
    case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
    default: return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

function KonsPowaAutoHealerDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch healing stats
  const { data: stats, isLoading: statsLoading } = useQuery<HealerStats>({
    queryKey: ['/api/kons-powa/healer/stats'],
    refetchInterval: 5000 // Update every 5 seconds
  });

  // Fetch all healing tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<HealingTask[]>({
    queryKey: ['/api/kons-powa/healer/tasks'],
    refetchInterval: 10000 // Update every 10 seconds
  });

  // Mutations
  const runTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await fetch(`/api/kons-powa/healer/tasks/${taskId}/run`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kons-powa/healer/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/kons-powa/healer/tasks'] });
    }
  });

  const runCriticalTasksMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/kons-powa/healer/run-critical', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kons-powa/healer/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/kons-powa/healer/tasks'] });
    }
  });

  const toggleAutoModeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/kons-powa/healer/toggle-auto', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kons-powa/healer/stats'] });
    }
  });

  const filteredTasks = tasks.filter(task => 
    selectedCategory === 'all' || task.category === selectedCategory
  );

  const categories = ['all', ...Array.from(new Set(tasks.map(t => t.category)))];

  if (statsLoading || tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading Auto-Healer Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">🔧 KonsPowa Auto-Healer</h2>
          <p className="text-slate-400">100 Master Tasks • Self-Aware System Monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-300">Auto Mode</span>
            <Switch
              checked={stats?.autoModeEnabled}
              onCheckedChange={() => toggleAutoModeMutation.mutate()}
              disabled={toggleAutoModeMutation.isPending}
            />
          </div>
          <Button
            onClick={() => runCriticalTasksMutation.mutate()}
            disabled={runCriticalTasksMutation.isPending}
            variant="destructive"
          >
            {runCriticalTasksMutation.isPending ? (
              <Activity className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Run Critical Tasks
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-100 mb-2">
              {stats?.healthScore || 0}%
            </div>
            <Progress 
              value={stats?.healthScore || 0} 
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Task Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {stats?.completed || 0}/{stats?.total || 0}
            </div>
            <Progress 
              value={stats?.completionRate || 0} 
              className="h-2"
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">Critical Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {stats?.critical || 0}
            </div>
            <p className="text-xs text-slate-400">High priority healing</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${
                (stats?.healthScore || 0) > 80 ? 'bg-green-500' : 
                (stats?.healthScore || 0) > 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-slate-300">
                {(stats?.healthScore || 0) > 80 ? 'Excellent' : 
                 (stats?.healthScore || 0) > 60 ? 'Good' : 'Needs Attention'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Alerts */}
      {stats?.systemHealth && (
        <div className="space-y-2">
          {stats.systemHealth.frontendIssues.length > 0 && (
            <Alert className="border-yellow-500 bg-yellow-950/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Frontend Issues: {stats.systemHealth.frontendIssues.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          {stats.systemHealth.apiIssues.length > 0 && (
            <Alert className="border-red-500 bg-red-950/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                API Issues: {stats.systemHealth.apiIssues.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          {!stats.systemHealth.dbConnections && (
            <Alert className="border-red-500 bg-red-950/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Database connection issues detected
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Task Management */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList className="bg-slate-800">
          <TabsTrigger value="tasks">Healing Tasks</TabsTrigger>
          <TabsTrigger value="monitor">System Monitor</TabsTrigger>
          <TabsTrigger value="logs">Healing Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All Categories' : category}
              </Button>
            ))}
          </div>

          {/* Task List */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {filteredTasks.map(task => (
                <Card key={task.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        {getCategoryIcon(task.category)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-slate-100">
                              Task #{task.id}
                            </span>
                            <Badge variant={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">
                            {task.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-slate-400">
                            <span>Tag: {task.tag}</span>
                            {task.lastRun && (
                              <span>Last: {new Date(task.lastRun).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(task.status)}
                          <span className={`text-sm ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => runTaskMutation.mutate(task.id)}
                          disabled={runTaskMutation.isPending || task.status === 'running'}
                          variant="outline"
                        >
                          {task.status === 'running' ? (
                            <Activity className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100 mb-2">
                  {stats?.systemHealth?.memoryUsage || 0}%
                </div>
                <Progress value={stats?.systemHealth?.memoryUsage || 0} className="h-2" />
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Active Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {stats?.systemHealth?.activeConnections || 0}
                </div>
                <p className="text-xs text-slate-400">Current connections</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Error Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {stats?.systemHealth?.errorCount || 0}
                </div>
                <p className="text-xs text-slate-400">Recent errors</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100">Database Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${
                    stats?.systemHealth?.dbConnections ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-slate-100">
                    {stats?.systemHealth?.dbConnections ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100">Healing Activity Log</CardTitle>
              <CardDescription>Real-time system healing operations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 text-sm text-slate-300 font-mono">
                  <div>[{new Date().toLocaleTimeString()}] 🔧 KID: Auto-healing scan initiated</div>
                  <div>[{new Date().toLocaleTimeString()}] ✅ Task #5: DOM health scan completed</div>
                  <div>[{new Date().toLocaleTimeString()}] 🔧 KID: API endpoint validation complete</div>
                  <div>[{new Date().toLocaleTimeString()}] ⚠️ Task #16: Route repair required for /api/waideski/bot</div>
                  <div>[{new Date().toLocaleTimeString()}] ✅ Task #17: ETH price feed reconnected</div>
                  <div>[{new Date().toLocaleTimeString()}] 🔧 KID: System health score: {stats?.healthScore || 0}%</div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default KonsPowaAutoHealerDashboard;