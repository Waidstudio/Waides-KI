import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Layers, 
  Zap, 
  Eye, 
  Rotate3D, 
  Maximize, 
  Minimize, 
  Play, 
  Pause,
  Settings,
  Volume2,
  VolumeX,
  RefreshCw,
  Globe
} from 'lucide-react';


interface HologramElement {
  id: string;
  name: string;
  type: 'chart' | 'bot' | 'data' | 'analytics';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  active: boolean;
  data?: any;
}

export default function HolographicUIPage() {
  const [isHologramActive, setIsHologramActive] = useState(false);
  const [hologramIntensity, setHologramIntensity] = useState([75]);
  const [rotationSpeed, setRotationSpeed] = useState([50]);
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'hologram'>('3d');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hologramElements, setHologramElements] = useState<HologramElement[]>([
    {
      id: 'eth-chart',
      name: 'ETH Price Chart',
      type: 'chart',
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: 1,
      active: true,
      data: { price: 3247.50, change: 2.3 }
    },
    {
      id: 'trading-bot',
      name: 'WaidBot Alpha',
      type: 'bot',
      position: { x: 150, y: 50, z: -100 },
      rotation: { x: 15, y: 45, z: 0 },
      scale: 0.8,
      active: true,
      data: { status: 'active', trades: 24, profit: 847.20 }
    },
    {
      id: 'market-data',
      name: 'Market Analytics',
      type: 'analytics',
      position: { x: -150, y: -50, z: 50 },
      rotation: { x: -10, y: -30, z: 5 },
      scale: 1.2,
      active: true,
      data: { volume: '2.4B', volatility: 0.15, sentiment: 0.72 }
    }
  ]);

  const [stats, setStats] = useState({
    hologramQuality: 95,
    renderFPS: 120,
    dataLatency: 12,
    neuralSync: 87
  });

  // Simulate holographic rendering
  useEffect(() => {
    if (!isHologramActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Clear canvas with holographic background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(0, 100, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render holographic elements
      hologramElements.forEach((element, index) => {
        if (!element.active) return;

        const time = Date.now() * 0.001;
        const centerX = canvas.width / 2 + element.position.x;
        const centerY = canvas.height / 2 + element.position.y;

        // Holographic glow effect
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((element.rotation.y + time * rotationSpeed[0] * 0.01) * Math.PI / 180);

        // Draw holographic frame
        const size = 60 * element.scale;
        ctx.strokeStyle = `rgba(0, 200, 255, ${0.3 + Math.sin(time * 2) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-size/2, -size/2, size, size);

        // Draw element icon based on type
        ctx.fillStyle = `rgba(0, 255, 200, ${0.7 + Math.sin(time * 3) * 0.3})`;
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        
        let icon = '';
        switch (element.type) {
          case 'chart': icon = '📈'; break;
          case 'bot': icon = '🤖'; break;
          case 'analytics': icon = '📊'; break;
          default: icon = '💎'; break;
        }
        
        ctx.fillText(icon, 0, 5);
        
        // Draw data overlay
        if (element.data) {
          ctx.font = '10px monospace';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          let dataText = '';
          if (element.type === 'chart' && element.data.price) {
            dataText = `$${element.data.price}`;
          } else if (element.type === 'bot' && element.data.profit) {
            dataText = `+$${element.data.profit}`;
          }
          ctx.fillText(dataText, 0, size/2 + 15);
        }

        ctx.restore();

        // Draw connecting lines between elements
        if (index < hologramElements.length - 1) {
          const nextElement = hologramElements[index + 1];
          if (nextElement.active) {
            const nextX = canvas.width / 2 + nextElement.position.x;
            const nextY = canvas.height / 2 + nextElement.position.y;
            
            ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 + Math.sin(time * 1.5) * 0.1})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(nextX, nextY);
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, [isHologramActive, hologramElements, rotationSpeed]);

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

  const toggleHologram = () => {
    setIsHologramActive(!isHologramActive);
  };

  const handleElementClick = (elementId: string) => {
    setSelectedElement(selectedElement === elementId ? null : elementId);
  };

  const updateElementPosition = (elementId: string, axis: 'x' | 'y' | 'z', value: number) => {
    setHologramElements(elements =>
      elements.map(el =>
        el.id === elementId
          ? { ...el, position: { ...el.position, [axis]: value } }
          : el
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Layers className="h-8 w-8 text-blue-400" />
                  Holographic Trading Interface
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400">FUTURE</Badge>
                </h1>
                <p className="text-slate-400 mt-2">
                  Experience next-generation 3D holographic trading visualization
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={toggleHologram}
                  className={`px-6 py-2 ${
                    isHologramActive
                      ? 'bg-cyan-600 hover:bg-cyan-700'
                      : 'bg-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {isHologramActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Deactivate Hologram
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Activate Hologram
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Holographic Viewport */}
            <div className="lg:col-span-3">
              <Card className="bg-slate-800/50 border-slate-700 h-[600px] relative overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-cyan-400 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Holographic Viewport
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {stats.renderFPS} FPS
                      </Badge>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        Quality: {stats.hologramQuality}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="h-full p-0 relative">
                  {/* 3D Canvas */}
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full bg-gradient-to-br from-slate-900/50 to-slate-800/50"
                    style={{ 
                      filter: isHologramActive ? 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.3))' : 'none' 
                    }}
                  />

                  {/* Overlay Controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewMode('2d')}
                      className={viewMode === '2d' ? 'bg-blue-600' : ''}
                    >
                      2D
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewMode('3d')}
                      className={viewMode === '3d' ? 'bg-blue-600' : ''}
                    >
                      3D
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setViewMode('hologram')}
                      className={viewMode === 'hologram' ? 'bg-cyan-600' : ''}
                    >
                      <Layers className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Status Overlay */}
                  {isHologramActive && (
                    <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3">
                      <div className="text-xs text-cyan-400 mb-1">HOLOGRAM ACTIVE</div>
                      <div className="flex items-center gap-4 text-xs text-slate-300">
                        <span>Neural Sync: {stats.neuralSync}%</span>
                        <span>Latency: {stats.dataLatency}ms</span>
                      </div>
                    </div>
                  )}

                  {/* Center activation prompt */}
                  {!isHologramActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Layers className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-400 mb-2">
                          Holographic System Standby
                        </h3>
                        <p className="text-slate-500 mb-4">
                          Activate holographic interface to experience 3D trading visualization
                        </p>
                        <Button onClick={toggleHologram} className="bg-cyan-600 hover:bg-cyan-700">
                          <Zap className="w-4 h-4 mr-2" />
                          Initialize Hologram
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
              {/* Hologram Controls */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Hologram Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">
                      Intensity: {hologramIntensity[0]}%
                    </label>
                    <Slider
                      value={hologramIntensity}
                      onValueChange={setHologramIntensity}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-300 mb-2 block">
                      Rotation Speed: {rotationSpeed[0]}%
                    </label>
                    <Slider
                      value={rotationSpeed}
                      onValueChange={setRotationSpeed}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Audio Effects</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAudioEnabled(!audioEnabled)}
                    >
                      {audioEnabled ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        <VolumeX className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Element Manager */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Rotate3D className="w-5 h-5" />
                    Holographic Elements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hologramElements.map((element) => (
                      <div
                        key={element.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedElement === element.id
                            ? 'border-cyan-400 bg-cyan-400/10'
                            : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                        }`}
                        onClick={() => handleElementClick(element.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white text-sm">
                              {element.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {element.type} • Scale: {element.scale.toFixed(1)}x
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              element.active
                                ? 'text-green-400 border-green-400'
                                : 'text-slate-400 border-slate-600'
                            }
                          >
                            {element.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        {selectedElement === element.id && (
                          <div className="mt-3 pt-3 border-t border-slate-600 space-y-2">
                            <div className="text-xs text-slate-300">Position Controls</div>
                            {(['x', 'y', 'z'] as const).map((axis) => (
                              <div key={axis} className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 w-4">
                                  {axis.toUpperCase()}:
                                </span>
                                <Slider
                                  value={[element.position[axis]]}
                                  onValueChange={([value]) =>
                                    updateElementPosition(element.id, axis, value)
                                  }
                                  min={-200}
                                  max={200}
                                  step={10}
                                  className="flex-1"
                                />
                                <span className="text-xs text-slate-400 w-8">
                                  {element.position[axis]}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Stats */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    System Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Render Quality</span>
                      <span className="text-sm text-white">{stats.hologramQuality}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Frame Rate</span>
                      <span className="text-sm text-white">{stats.renderFPS} FPS</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Data Latency</span>
                      <span className="text-sm text-white">{stats.dataLatency}ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Neural Sync</span>
                      <span className="text-sm text-white">{stats.neuralSync}%</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Optimize Performance
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