import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, Brain, TrendingUp, TrendingDown, Minus, CheckCircle, XCircle, BarChart3, History, Zap, MessageCircle, Send, Bot, User, X, Settings } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface SpiritVision {
  vision: 'rise' | 'fall' | 'choppy';
  timestamp: string;
  energy_level: number;
  confidence: number;
}

interface VisionValidation {
  vision: string;
  confirmed: boolean;
  confirmation_strength: number;
  timestamp: string;
  indicators: {
    rsi: number;
    ema_50: number;
    ema_200: number;
    current_price: number;
  };
  validation_rules: string[];
}

interface VisionStats {
  total_visions: number;
  confirmed_visions: number;
  accuracy_rate: number;
  last_vision: SpiritVision | null;
  last_validation: VisionValidation | null;
  vision_history: Array<{
    vision: SpiritVision;
    validation: VisionValidation;
    actual_outcome?: 'correct' | 'incorrect' | 'pending';
  }>;
}

interface ValidationResult {
  isValid: boolean;
  reasons: string[];
  recommendation: string;
  confidence: number;
  indicators: {
    rsi: number;
    ema_50: number;
    ema_200: number;
    current_price: number;
  };
}

interface VisionSpiritProps {
  isFloatingVisible: boolean;
  activeFloatingPanel: string;
  onCloseFloating: () => void;
}

export default function VisionSpirit({ 
  isFloatingVisible, 
  activeFloatingPanel, 
  onCloseFloating 
}: VisionSpiritProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: currentVision, isLoading: currentVisionLoading } = useQuery({
    queryKey: ['/api/waides-ki/vision-spirit/current'],
    refetchInterval: 30000
  });

  const { data: visionStats } = useQuery({
    queryKey: ['/api/waides-ki/vision-spirit/stats'],
    refetchInterval: 30000
  });

  const { data: visionHistory } = useQuery({
    queryKey: ['/api/waides-ki/vision-spirit/history'],
    refetchInterval: 60000
  });

  // Mutations
  const receiveMutation = useMutation({
    mutationFn: () => apiRequest('/api/waides-ki/vision-spirit/receive', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/stats'] });
    }
  });

  const verifyVisionMutation = useMutation({
    mutationFn: () => apiRequest('/api/waides-ki/vision-spirit/verify', {}),
    onSuccess: (data) => {
      setValidationResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/history'] });
    }
  });

  const completeWorkflowMutation = useMutation({
    mutationFn: () => apiRequest('/api/waides-ki/vision-spirit/receive', {}).then(() => 
      apiRequest('/api/waides-ki/vision-spirit/verify', {})),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/vision-spirit/history'] });
    }
  });

  // Helper functions
  const getVisionIcon = (vision: string) => {
    switch (vision) {
      case 'rise': return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'fall': return <TrendingDown className="h-5 w-5 text-red-400" />;
      case 'choppy': return <Minus className="h-5 w-5 text-yellow-400" />;
      default: return <Eye className="h-5 w-5 text-slate-400" />;
    }
  };

  const getVisionColor = (vision: string) => {
    switch (vision) {
      case 'rise': return 'bg-green-100 text-green-800 border-green-200';
      case 'fall': return 'bg-red-100 text-red-800 border-red-200';
      case 'choppy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleVerifyCurrentVision = () => {
    if (currentVision?.currentVision) {
      verifyVisionMutation.mutate();
    }
  };

  // Extract data from API responses properly
  const currentVisionData = currentVision?.currentVision || null;
  const statsData: VisionStats = visionStats?.stats || {
    total_visions: 0,
    confirmed_visions: 0,
    accuracy_rate: 0,
    last_vision: null,
    last_validation: null,
    vision_history: []
  };
  const historyData = visionHistory?.history || [];

  if (!isFloatingVisible) {
    return (
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-40">
        {/* Floating action buttons for Vision Spirit features */}
        <Button
          onClick={() => onCloseFloating()}
          className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg"
        >
          <Eye className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-slate-100">
              {activeFloatingPanel === 'current' && 'Current Vision'}
              {activeFloatingPanel === 'validation' && 'Vision Validation'}
              {activeFloatingPanel === 'stats' && 'Vision Statistics'}
              {activeFloatingPanel === 'history' && 'Vision History'}
              {activeFloatingPanel === 'controls' && 'Vision Controls'}
            </h2>
          </div>
          <Button
            onClick={onCloseFloating}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeFloatingPanel === 'current' && (
            <div className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-400" />
                    Current Vision State
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentVisionData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getVisionIcon(currentVisionData.vision)}
                          <Badge className={getVisionColor(currentVisionData.vision)}>
                            {currentVisionData.vision.toUpperCase()}
                          </Badge>
                        </div>
                        <span className="text-slate-400 text-sm">
                          {formatTimestamp(currentVisionData.timestamp)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Energy Level</label>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={currentVisionData.energy_level * 100} 
                              className="flex-1 bg-slate-600"
                            />
                            <span className="text-sm text-slate-400">
                              {(currentVisionData.energy_level * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Confidence</label>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={currentVisionData.confidence * 100} 
                              className="flex-1 bg-slate-600"
                            />
                            <span className="text-sm text-slate-400">
                              {(currentVisionData.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleVerifyCurrentVision} 
                        disabled={verifyVisionMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {verifyVisionMutation.isPending ? "Validating..." : "Validate Vision"}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Eye className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No current vision available</p>
                      <Button 
                        onClick={() => receiveMutation.mutate()}
                        disabled={receiveMutation.isPending}
                        className="mt-4 bg-purple-600 hover:bg-purple-700"
                      >
                        {receiveMutation.isPending ? "Receiving..." : "Receive New Vision"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeFloatingPanel === 'validation' && (
            <div className="space-y-4">
              {validationResult && (
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-slate-100 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-400" />
                      Vision Validation Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      {validationResult.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <span className={`font-medium ${validationResult.isValid ? 'text-green-400' : 'text-red-400'}`}>
                        {validationResult.isValid ? 'Vision Confirmed' : 'Vision Rejected'}
                      </span>
                      <Badge variant="outline" className="ml-auto">
                        {(validationResult.confidence * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Market Indicators</label>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">RSI:</span>
                          <span className="text-slate-200">{validationResult.indicators.rsi.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">EMA 50:</span>
                          <span className="text-slate-200">${validationResult.indicators.ema_50.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">EMA 200:</span>
                          <span className="text-slate-200">${validationResult.indicators.ema_200.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Current Price:</span>
                          <span className="text-slate-200">${validationResult.indicators.current_price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Validation Reasons</label>
                      <ul className="space-y-1">
                        {validationResult.reasons.map((reason, index) => (
                          <li key={index} className="text-sm text-slate-400 flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-slate-800 p-3 rounded-lg">
                      <label className="text-sm font-medium text-slate-300 block mb-1">Recommendation</label>
                      <p className="text-sm text-slate-200">{validationResult.recommendation}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          {activeFloatingPanel === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-100">{stats.total_visions}</div>
                      <div className="text-sm text-slate-400">Total Visions</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{stats.confirmed_visions}</div>
                      <div className="text-sm text-slate-400">Confirmed</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{(stats.accuracy_rate * 100).toFixed(1)}%</div>
                      <div className="text-sm text-slate-400">Accuracy</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-700 border-slate-600">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">{stats.vision_history.length}</div>
                      <div className="text-sm text-slate-400">History Records</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          {activeFloatingPanel === 'history' && (
            <div className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {visionHistory?.history && visionHistory.history.length > 0 ? (
                    visionHistory.history.map((record: any, index: number) => (
                      <Card key={index} className="bg-slate-700 border-slate-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getVisionIcon(record.vision.vision)}
                              <Badge className={getVisionColor(record.vision.vision)}>
                                {record.vision.vision.toUpperCase()}
                              </Badge>
                            </div>
                            <span className="text-sm text-slate-400">
                              {formatTimestamp(record.vision.timestamp)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-slate-400">Energy: </span>
                              <span className="text-slate-200">{(record.vision.energy_level * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Confidence: </span>
                              <span className="text-slate-200">{(record.vision.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Outcome: </span>
                              <span className={`${
                                record.actual_outcome === 'correct' ? 'text-green-400' :
                                record.actual_outcome === 'incorrect' ? 'text-red-400' : 'text-yellow-400'
                              }`}>
                                {record.actual_outcome || 'pending'}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No vision history available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {activeFloatingPanel === 'controls' && (
            <div className="space-y-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-red-400" />
                    Vision Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => receiveMutation.mutate()}
                    disabled={receiveMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {receiveMutation.isPending ? "Receiving..." : "Receive New Vision"}
                  </Button>
                  
                  <Button 
                    onClick={() => completeWorkflowMutation.mutate()}
                    disabled={completeWorkflowMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {completeWorkflowMutation.isPending ? "Processing..." : "Complete Workflow"}
                  </Button>
                  
                  <Button 
                    onClick={() => {/* Add any test functionality */}}
                    variant="outline"
                    className="w-full border-slate-600 text-slate-200 hover:bg-slate-600"
                  >
                    Test Vision System
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}