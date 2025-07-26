import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Crown, 
  Zap, 
  Brain, 
  Eye, 
  Shield, 
  Command,
  Play,
  Pause,
  Square,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Activity
} from 'lucide-react';
import type { DivineCommandData } from '@/types/componentTypes';

interface CommandTemplate {
  id: string;
  name: string;
  description: string;
  command: string;
  parameters: Record<string, any>;
  category: 'trading' | 'analysis' | 'system' | 'divine';
}

export default function DivineCommandCenter() {
  const [selectedCommand, setSelectedCommand] = useState('');
  const [commandParameters, setCommandParameters] = useState('{}');
  const [customCommand, setCustomCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<DivineCommandData[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available command templates
  const { data: commandTemplates = [], isLoading: isTemplatesLoading } = useQuery({
    queryKey: ['/api/divine-commands/templates'],
    refetchInterval: 30000,
  });

  // Fetch active commands
  const { data: activeCommands = [], isLoading: isActiveLoading } = useQuery({
    queryKey: ['/api/divine-commands/active'],
    refetchInterval: 2000, // Real-time updates
  });

  // Fetch command execution history
  const { data: executionHistory = [], isLoading: isHistoryLoading } = useQuery({
    queryKey: ['/api/divine-commands/history'],
    refetchInterval: 10000,
  });

  // Fetch system status for divine operations
  const { data: divineSystemStatus, isLoading: isStatusLoading } = useQuery({
    queryKey: ['/api/divine-commands/system-status'],
    refetchInterval: 5000,
  });

  // Execute command mutation
  const executeCommandMutation = useMutation({
    mutationFn: async (commandData: { command: string; parameters: Record<string, any>; priority: string }) => {
      const response = await apiRequest('POST', '/api/divine-commands/execute', commandData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Divine Command Executed",
        description: `Command "${data.command}" has been initiated with divine authority`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-commands'] });
      setCustomCommand('');
      setCommandParameters('{}');
    },
    onError: (error) => {
      toast({
        title: "Command Execution Failed",
        description: error instanceof Error ? error.message : "Divine command could not be processed",
        variant: "destructive",
      });
    }
  });

  // Cancel command mutation
  const cancelCommandMutation = useMutation({
    mutationFn: async (commandId: string) => {
      const response = await apiRequest('POST', `/api/divine-commands/${commandId}/cancel`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Command Cancelled",
        description: "Divine command has been cancelled",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/divine-commands'] });
    },
    onError: (error) => {
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Failed to cancel command",
        variant: "destructive",
      });
    }
  });

  const defaultTemplates: CommandTemplate[] = [
    {
      id: 'activate_all_bots',
      name: 'Activate All Trading Bots',
      description: 'Activate WaidBot, WaidBot Pro, and all autonomous trading systems',
      command: 'ACTIVATE_TRADING_BOTS',
      parameters: { mode: 'all', risk_level: 'medium' },
      category: 'trading'
    },
    {
      id: 'market_analysis',
      name: 'Deep Market Analysis',
      description: 'Perform comprehensive ETH market analysis with divine insights',
      command: 'DEEP_MARKET_ANALYSIS',
      parameters: { timeframe: '24h', include_predictions: true },
      category: 'analysis'
    },
    {
      id: 'kons_powa_reading',
      name: 'Kons Powa Divine Reading',
      description: 'Generate divine market prediction using Kons Powa energy',
      command: 'KONS_POWA_PREDICTION',
      parameters: { depth: 'spiritual', timeframe: 'next_hour' },
      category: 'divine'
    },
    {
      id: 'risk_assessment',
      name: 'Portfolio Risk Assessment',
      description: 'Analyze current portfolio risk and suggest adjustments',
      command: 'PORTFOLIO_RISK_ANALYSIS',
      parameters: { include_suggestions: true, severity: 'high' },
      category: 'analysis'
    },
    {
      id: 'emergency_stop',
      name: 'Emergency Stop All Trading',
      description: 'Immediately halt all trading activities and protect capital',
      command: 'EMERGENCY_STOP_TRADING',
      parameters: { immediate: true, protect_capital: true },
      category: 'trading'
    },
    {
      id: 'system_purge',
      name: 'System Purification',
      description: 'Clear all negative energy and reset divine algorithms',
      command: 'DIVINE_SYSTEM_PURGE',
      parameters: { purge_level: 'deep', reset_algorithms: true },
      category: 'system'
    }
  ];

  const handleTemplateSelect = (templateId: string) => {
    const template = [...defaultTemplates, ...commandTemplates].find(t => t.id === templateId);
    if (template) {
      setSelectedCommand(template.command);
      setCommandParameters(JSON.stringify(template.parameters, null, 2));
    }
  };

  const handleExecuteCommand = () => {
    try {
      const parameters = JSON.parse(commandParameters);
      const command = customCommand || selectedCommand;
      
      if (!command) {
        toast({
          title: "No Command Selected",
          description: "Please select a template or enter a custom command",
          variant: "destructive",
        });
        return;
      }

      executeCommandMutation.mutate({
        command,
        parameters,
        priority: 'high'
      });
    } catch (error) {
      toast({
        title: "Invalid Parameters",
        description: "Please check your command parameters JSON format",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'executing':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'executing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trading':
        return <Zap className="w-4 h-4" />;
      case 'analysis':
        return <Brain className="w-4 h-4" />;
      case 'divine':
        return <Crown className="w-4 h-4" />;
      case 'system':
        return <Shield className="w-4 h-4" />;
      default:
        return <Command className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Crown className="w-8 h-8 text-yellow-400" />
          Divine Command Center
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-yellow-400 border-yellow-400">
            Divine Authority Active
          </Badge>
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        </div>
      </div>

      {/* System Status */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Divine System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isStatusLoading ? (
            <div className="text-gray-400">Loading divine system status...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-white">Protection Level</div>
                <div className="text-lg text-blue-300">
                  {divineSystemStatus?.protection_level || 'MAXIMUM'}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-white">Divine Energy</div>
                <div className="text-lg text-yellow-300">
                  {divineSystemStatus?.divine_energy || '98%'}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                <Brain className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-white">AI Systems</div>
                <div className="text-lg text-purple-300">
                  {divineSystemStatus?.ai_systems_status || 'ACTIVE'}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                <Zap className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-white">Trading Bots</div>
                <div className="text-lg text-green-300">
                  {divineSystemStatus?.trading_bots_active || '3'} Active
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Command Templates */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Command className="w-5 h-5" />
            Divine Command Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50 hover:border-yellow-400/50 cursor-pointer transition-colors"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(template.category)}
                    <h3 className="font-semibold text-white">{template.name}</h3>
                  </div>
                  <Badge className={`text-xs ${
                    template.category === 'divine' ? 'bg-yellow-500/20 text-yellow-300' :
                    template.category === 'trading' ? 'bg-green-500/20 text-green-300' :
                    template.category === 'analysis' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {template.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-300 mb-2">{template.description}</p>
                <code className="text-xs text-yellow-400 bg-gray-800/50 px-2 py-1 rounded">
                  {template.command}
                </code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Command Execution */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Play className="w-5 h-5" />
            Execute Divine Command
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Command (or use template above)
            </label>
            <Input
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              placeholder="Enter divine command (e.g., ACTIVATE_TRADING_BOTS)"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Command Parameters (JSON)
            </label>
            <Textarea
              value={commandParameters}
              onChange={(e) => setCommandParameters(e.target.value)}
              placeholder='{"risk_level": "medium", "timeframe": "1h"}'
              rows={4}
              className="bg-gray-700 border-gray-600 text-white font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleExecuteCommand}
            disabled={executeCommandMutation.isPending}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
          >
            {executeCommandMutation.isPending ? 'Executing Divine Command...' : 'Execute Divine Command'}
          </Button>
        </CardContent>
      </Card>

      {/* Active Commands */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Active Divine Commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isActiveLoading ? (
            <div className="text-gray-400">Loading active commands...</div>
          ) : activeCommands.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No active divine commands</div>
          ) : (
            <div className="space-y-3">
              {activeCommands.map((command: DivineCommandData) => (
                <div key={command.timestamp.toString()} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(command.status)}
                      <div>
                        <div className="font-semibold text-white">{command.command}</div>
                        <div className="text-sm text-gray-300">
                          {new Date(command.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(command.priority)}>
                        {command.priority}
                      </Badge>
                      <Badge className={getStatusColor(command.status)}>
                        {command.status}
                      </Badge>
                      {command.status === 'executing' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelCommandMutation.mutate(command.timestamp.toString())}
                          disabled={cancelCommandMutation.isPending}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                  {command.result && (
                    <div className="mt-2 p-2 bg-gray-800/50 rounded text-sm">
                      <span className="text-gray-400">Result: </span>
                      <span className="text-gray-200">{JSON.stringify(command.result)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Command Execution History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isHistoryLoading ? (
            <div className="text-gray-400">Loading execution history...</div>
          ) : executionHistory.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No execution history</div>
          ) : (
            <div className="space-y-2">
              {executionHistory.slice(0, 10).map((command: DivineCommandData, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(command.status)}
                    <div>
                      <span className="text-white font-medium">{command.command}</span>
                      <div className="text-xs text-gray-400">
                        {new Date(command.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(command.priority)} size="sm">
                      {command.priority}
                    </Badge>
                    <Badge className={getStatusColor(command.status)} size="sm">
                      {command.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}