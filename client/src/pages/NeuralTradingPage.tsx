import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Network, 
  Zap, 
  Target, 
  Activity, 
  Settings, 
  Play, 
  Pause,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Cpu,
  Eye,
  Shield
} from 'lucide-react';
import StableNavigation from '@/components/ui/StableNavigation';

interface NeuralNode {
  id: string;
  layer: number;
  x: number;
  y: number;
  activation: number;
  connections: string[];
  type: 'input' | 'hidden' | 'output';
}

interface TradeSignal {
  id: string;
  timestamp: Date;
  pair: string;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  neuralOutput: number[];
  reasoning: string;
}

export default function NeuralTradingPage() {
  const [isNetworkActive, setIsNetworkActive] = useState(false);
  const [learningRate, setLearningRate] = useState([0.001]);
  const [networkDepth, setNetworkDepth] = useState([4]);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [epochs, setEpochs] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [neuralNetwork, setNeuralNetwork] = useState<NeuralNode[]>([]);
  const [recentSignals, setRecentSignals] = useState<TradeSignal[]>([]);
  
  const [networkStats, setNetworkStats] = useState({
    accuracy: 87.5,
    loss: 0.023,
    learningSpeed: 95,
    predictions: 1247,
    correctPredictions: 1091,
    totalTrades: 342,
    profitableTrades: 289,
    roi: 24.7
  });

  // Initialize neural network structure
  useEffect(() => {
    const layers = [6, 12, 8, 4, 1]; // input, hidden layers, output
    const nodes: NeuralNode[] = [];
    let nodeId = 0;

    layers.forEach((layerSize, layerIndex) => {
      for (let i = 0; i < layerSize; i++) {
        const node: NeuralNode = {
          id: `node_${nodeId++}`,
          layer: layerIndex,
          x: (layerIndex * 150) + 50,
          y: (i * 60) + 50 + (layerIndex % 2) * 30,
          activation: Math.random(),
          connections: [],
          type: layerIndex === 0 ? 'input' : layerIndex === layers.length - 1 ? 'output' : 'hidden'
        };

        // Create connections to next layer
        if (layerIndex < layers.length - 1) {
          const nextLayerStart = layers.slice(0, layerIndex + 1).reduce((sum, size) => sum + size, 0);
          const nextLayerSize = layers[layerIndex + 1];
          for (let j = 0; j < nextLayerSize; j++) {
            node.connections.push(`node_${nextLayerStart + j}`);
          }
        }

        nodes.push(node);
      }
    });

    setNeuralNetwork(nodes);
  }, [networkDepth]);

  // Generate mock trading signals
  useEffect(() => {
    if (!isNetworkActive) return;

    const generateSignal = () => {
      const pairs = ['ETH/USDT', 'BTC/USDT', 'ADA/USDT', 'DOT/USDT'];
      const signals: ('BUY' | 'SELL' | 'HOLD')[] = ['BUY', 'SELL', 'HOLD'];
      
      const signal: TradeSignal = {
        id: `signal_${Date.now()}`,
        timestamp: new Date(),
        pair: pairs[Math.floor(Math.random() * pairs.length)],
        signal: signals[Math.floor(Math.random() * signals.length)],
        confidence: 70 + Math.random() * 30,
        neuralOutput: Array.from({ length: 5 }, () => Math.random()),
        reasoning: 'Neural network detected favorable market conditions based on price action analysis'
      };

      setRecentSignals(prev => [signal, ...prev.slice(0, 9)]);
    };

    const interval = setInterval(generateSignal, 5000);
    return () => clearInterval(interval);
  }, [isNetworkActive]);

  // Neural network visualization
  useEffect(() => {
    if (!canvasRef.current || neuralNetwork.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      neuralNetwork.forEach(node => {
        node.connections.forEach(connectionId => {
          const targetNode = neuralNetwork.find(n => n.id === connectionId);
          if (!targetNode) return;

          const opacity = isNetworkActive ? 0.3 + (node.activation * 0.7) : 0.1;
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
          ctx.lineWidth = isNetworkActive ? 1 + (node.activation * 2) : 1;
          
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.stroke();
        });
      });

      // Draw nodes
      neuralNetwork.forEach(node => {
        const radius = 8 + (isNetworkActive ? node.activation * 4 : 0);
        let color = 'rgba(148, 163, 184, 0.8)';
        
        if (isNetworkActive) {
          if (node.type === 'input') color = `rgba(34, 197, 94, ${0.5 + node.activation * 0.5})`;
          else if (node.type === 'output') color = `rgba(239, 68, 68, ${0.5 + node.activation * 0.5})`;
          else color = `rgba(99, 102, 241, ${0.3 + node.activation * 0.7})`;
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect for active nodes
        if (isNetworkActive && node.activation > 0.7) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Update activations
      if (isNetworkActive) {
        setNeuralNetwork(prev => prev.map(node => ({
          ...node,
          activation: Math.max(0, Math.min(1, node.activation + (Math.random() - 0.5) * 0.1))
        })));
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [neuralNetwork, isNetworkActive]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Simulate training progress
  useEffect(() => {
    if (!isNetworkActive) return;

    const interval = setInterval(() => {
      setEpochs(prev => prev + 1);
      setTrainingProgress(prev => {
        const newProgress = prev + Math.random() * 2;
        if (newProgress >= 100) {
          // Update stats after training completion
          setNetworkStats(prev => ({
            ...prev,
            accuracy: Math.min(99, prev.accuracy + Math.random() * 2),
            loss: Math.max(0.001, prev.loss - Math.random() * 0.005),
            predictions: prev.predictions + Math.floor(Math.random() * 10),
            correctPredictions: prev.correctPredictions + Math.floor(Math.random() * 8)
          }));
          return 0;
        }
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isNetworkActive]);

  const toggleNetwork = () => {
    setIsNetworkActive(!isNetworkActive);
    if (!isNetworkActive) {
      setEpochs(0);
      setTrainingProgress(0);
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-400 border-green-400';
      case 'SELL': return 'text-red-400 border-red-400';
      default: return 'text-yellow-400 border-yellow-400';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return TrendingUp;
      case 'SELL': return TrendingDown;
      default: return Activity;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <StableNavigation />
      
      <div className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Brain className="h-8 w-8 text-purple-400" />
                  Neural Trading System
                  <Badge variant="outline" className="text-purple-400 border-purple-400">PRO</Badge>
                </h1>
                <p className="text-slate-400 mt-2">
                  Deep learning autonomous trading with advanced neural networks
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={toggleNetwork}
                  className={`px-6 py-2 ${
                    isNetworkActive
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {isNetworkActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Stop Training
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Training
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Neural Network Visualization */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700 h-[500px]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-400 flex items-center gap-2">
                      <Network className="w-5 h-5" />
                      Neural Network Architecture
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {networkStats.accuracy.toFixed(1)}% Accuracy
                      </Badge>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        Epoch: {epochs}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="h-full p-0">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ 
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))' 
                    }}
                  />

                  {/* Training Progress Overlay */}
                  {isNetworkActive && trainingProgress > 0 && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-purple-400">Training Progress</span>
                          <span className="text-sm text-white">{trainingProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={trainingProgress} className="h-2" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Signals */}
              <Card className="bg-slate-800/50 border-slate-700 mt-6">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Recent Neural Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentSignals.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No signals generated yet. Start the neural network to begin trading.</p>
                      </div>
                    ) : (
                      recentSignals.map((signal) => {
                        const Icon = getSignalIcon(signal.signal);
                        return (
                          <div
                            key={signal.id}
                            className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-purple-400" />
                              <div>
                                <div className="font-medium text-white">{signal.pair}</div>
                                <div className="text-xs text-slate-400">
                                  {signal.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={getSignalColor(signal.signal)}>
                                {signal.signal}
                              </Badge>
                              <div className="text-right">
                                <div className="text-sm text-white">
                                  {signal.confidence.toFixed(1)}%
                                </div>
                                <div className="text-xs text-slate-400">confidence</div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
              {/* Network Configuration */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Network Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">
                      Learning Rate: {learningRate[0]}
                    </label>
                    <Slider
                      value={learningRate}
                      onValueChange={setLearningRate}
                      min={0.0001}
                      max={0.01}
                      step={0.0001}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">
                      Network Depth: {networkDepth[0]} layers
                    </label>
                    <Slider
                      value={networkDepth}
                      onValueChange={setNetworkDepth}
                      min={3}
                      max={8}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={isNetworkActive}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Rebuild Network
                  </Button>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Model Accuracy</span>
                      <span className="text-sm text-white font-semibold">
                        {networkStats.accuracy.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Training Loss</span>
                      <span className="text-sm text-white font-semibold">
                        {networkStats.loss.toFixed(4)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Predictions Made</span>
                      <span className="text-sm text-white font-semibold">
                        {networkStats.predictions.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Correct Predictions</span>
                      <span className="text-sm text-white font-semibold">
                        {networkStats.correctPredictions.toLocaleString()}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">ROI</span>
                        <span className="text-sm text-green-400 font-semibold">
                          +{networkStats.roi.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Neural Engine</span>
                      <Badge variant="outline" className={
                        isNetworkActive 
                          ? "text-green-400 border-green-400" 
                          : "text-slate-400 border-slate-400"
                      }>
                        {isNetworkActive ? 'Active' : 'Standby'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Learning Speed</span>
                      <span className="text-sm text-white">{networkStats.learningSpeed}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Memory Usage</span>
                      <span className="text-sm text-white">2.4 GB</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">GPU Utilization</span>
                      <span className="text-sm text-white">78%</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Detailed Logs
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}