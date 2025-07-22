import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Zap, 
  Brain,
  Shield,
  TrendingUp,
  Settings,
  RefreshCw,
  Play,
  Square
} from "lucide-react";
import { useState, useEffect } from "react";

interface KonsPowaTask {
  id: number;
  title: string;
  area: string;
  description: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'failed';
  critical?: boolean;
  lastChecked?: number;
  executionCount?: number;
  autoHeal?: boolean;
}

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  failed: number;
  critical: number;
  autoHeal: number;
  completionPercentage: number;
}

export default function KonsPowaTaskDashboard() {
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [autoMode, setAutoMode] = useState(false);
  const queryClient = useQueryClient();

  // Fetch tasks and statistics
  const { data: tasks, isLoading } = useQuery<KonsPowaTask[]>({
    queryKey: ['/api/kons-powa/tasks'],
    refetchInterval: 10000 // Refresh every 10 seconds
  });

  const { data: stats } = useQuery<TaskStats>({
    queryKey: ['/api/kons-powa/stats'],
    refetchInterval: 5000 // Refresh stats every 5 seconds
  });

  const { data: nextTask } = useQuery<KonsPowaTask | null>({
    queryKey: ['/api/kons-powa/next-priority'],
    refetchInterval: 15000 // Check for next priority task every 15 seconds
  });

  // Mutation to run specific task
  const runTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await fetch(`/api/kons-powa/tasks/${taskId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/kons-powa'] });
    }
  });

  // Mutation to toggle auto mode
  const toggleAutoModeMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await fetch('/api/kons-powa/auto-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      return response.json();
    },
    onSuccess: () => {
      setAutoMode(!autoMode);
    }
  });

  // Get unique areas for filtering
  const areas = tasks ? [...new Set(tasks.map(task => task.area))] : [];
  
  // Filter tasks based on selected area
  const filteredTasks = tasks?.filter(task => 
    selectedArea === 'all' || task.area === selectedArea
  ) || [];

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Get status icon
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <Activity className="w-4 h-4 text-blue-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-400" />
            KonsPowa Task Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">Loading KonsPowa tasks...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-400" />
              KonsPowa Task Engine
              <Badge variant="outline" className="ml-2 border-purple-500 text-purple-400">
                {autoMode ? 'AUTO' : 'MANUAL'}
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => toggleAutoModeMutation.mutate(!autoMode)}
                variant="outline"
                size="sm"
                className={`border-slate-700 ${autoMode ? 'bg-purple-900/50 text-purple-400' : ''}`}
              >
                {autoMode ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {autoMode ? 'Stop Auto' : 'Start Auto'}
              </Button>
              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/kons-powa'] })}
                variant="outline"
                size="sm"
                className="border-slate-700 hover:bg-slate-800"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stats Cards */}
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-400 uppercase">Completion</div>
              <div className="text-2xl font-bold text-green-400">{stats?.completionPercentage || 0}%</div>
              <Progress value={stats?.completionPercentage || 0} className="mt-2" />
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-400 uppercase">Critical</div>
              <div className="text-2xl font-bold text-red-400">{stats?.critical || 0}</div>
              <div className="text-xs text-slate-500">High Priority</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-400 uppercase">Auto-Heal</div>
              <div className="text-2xl font-bold text-blue-400">{stats?.autoHeal || 0}</div>
              <div className="text-xs text-slate-500">Self-Healing</div>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-400 uppercase">Active</div>
              <div className="text-2xl font-bold text-purple-400">{stats?.inProgress || 0}</div>
              <div className="text-xs text-slate-500">Running Now</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Priority Task */}
      {nextTask && (
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/10 border-purple-500/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Next Priority Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="border-purple-500 text-purple-400">
                    {nextTask.area}
                  </Badge>
                  {nextTask.critical && (
                    <Badge variant="destructive" className="text-xs">
                      CRITICAL
                    </Badge>
                  )}
                  {nextTask.autoHeal && (
                    <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                      AUTO-HEAL
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-white mb-1">{nextTask.title}</h3>
                <p className="text-sm text-slate-300">{nextTask.description}</p>
              </div>
              <Button
                onClick={() => runTaskMutation.mutate(nextTask.id)}
                disabled={runTaskMutation.isPending}
                className="ml-4 bg-purple-600 hover:bg-purple-700"
              >
                {runTaskMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter and Tasks */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
              Task Management ({filteredTasks.length} tasks)
            </CardTitle>
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700">
                <SelectValue placeholder="Filter by area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {areas.map(area => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(task.status)}
                    <span className="text-xs text-slate-500">#{task.id}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-white text-sm">{task.title}</span>
                      <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                        {task.area}
                      </Badge>
                      {task.critical && (
                        <Badge variant="destructive" className="text-xs">
                          CRITICAL
                        </Badge>
                      )}
                      {task.autoHeal && (
                        <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          AUTO
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{task.description}</p>
                    {task.lastChecked && (
                      <p className="text-xs text-slate-500 mt-1">
                        Last checked: {new Date(task.lastChecked).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                  {task.status === 'pending' && (
                    <Button
                      onClick={() => runTaskMutation.mutate(task.id)}
                      disabled={runTaskMutation.isPending}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}