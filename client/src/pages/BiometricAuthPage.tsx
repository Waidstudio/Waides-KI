import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Fingerprint, 
  Eye, 
  Mic, 
  Shield, 
  Lock, 
  Unlock, 
  CheckCircle, 
  XCircle,
  Settings,
  RefreshCw,
  AlertTriangle,
  User,
  Camera,
  Scan,
  Key
} from 'lucide-react';


interface BiometricData {
  type: 'fingerprint' | 'face' | 'voice' | 'iris';
  status: 'enrolled' | 'not_enrolled' | 'scanning' | 'verified' | 'failed';
  confidence: number;
  lastUsed?: Date;
}

interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: 'login_attempt' | 'enrollment' | 'verification' | 'security_alert';
  biometric: string;
  status: 'success' | 'failure' | 'warning';
  details: string;
}

export default function BiometricAuthPage() {
  const [selectedBiometric, setSelectedBiometric] = useState<string>('fingerprint');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isSecurityEnabled, setIsSecurityEnabled] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [biometricData, setBiometricData] = useState<Record<string, BiometricData>>({
    fingerprint: { type: 'fingerprint', status: 'enrolled', confidence: 97.3, lastUsed: new Date() },
    face: { type: 'face', status: 'enrolled', confidence: 94.8, lastUsed: new Date() },
    voice: { type: 'voice', status: 'not_enrolled', confidence: 0 },
    iris: { type: 'iris', status: 'not_enrolled', confidence: 0 }
  });

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000),
      type: 'login_attempt',
      biometric: 'fingerprint',
      status: 'success',
      details: 'Successful authentication via fingerprint'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 900000),
      type: 'verification',
      biometric: 'face',
      status: 'success',
      details: 'Face recognition verified for wallet access'
    }
  ]);

  const [securityStats, setSecurityStats] = useState({
    totalAttempts: 147,
    successfulAttempts: 142,
    failedAttempts: 5,
    securityLevel: 'Maximum',
    authenticationSpeed: 0.8,
    falsePositiveRate: 0.001,
    falseNegativeRate: 0.002
  });

  // Biometric scanner visualization
  useEffect(() => {
    if (!canvasRef.current || !isScanning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let progress = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const time = Date.now() * 0.001;

      // Background gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.1)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.9)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Scanning effect based on biometric type
      if (selectedBiometric === 'fingerprint') {
        // Fingerprint scanning pattern
        ctx.strokeStyle = `rgba(34, 197, 94, ${0.5 + Math.sin(time * 4) * 0.3})`;
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 8; i++) {
          const radius = 30 + i * 10;
          const opacity = 0.8 - (i * 0.1);
          ctx.strokeStyle = `rgba(34, 197, 94, ${opacity})`;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Scanning line
        const scanY = centerY - 80 + (progress * 1.6);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 80, scanY);
        ctx.lineTo(centerX + 80, scanY);
        ctx.stroke();

      } else if (selectedBiometric === 'face') {
        // Face recognition grid
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
        ctx.lineWidth = 1;
        
        // Grid pattern
        for (let x = 0; x < 10; x++) {
          for (let y = 0; y < 10; y++) {
            const gridX = centerX - 100 + (x * 20);
            const gridY = centerY - 100 + (y * 20);
            const opacity = 0.3 + Math.sin(time * 2 + x + y) * 0.3;
            
            ctx.fillStyle = `rgba(34, 197, 94, ${opacity})`;
            ctx.fillRect(gridX, gridY, 2, 2);
          }
        }

        // Face outline
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 10, 60, 80, 0, 0, Math.PI * 2);
        ctx.stroke();

      } else if (selectedBiometric === 'voice') {
        // Voice wave pattern
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.lineWidth = 2;
        
        for (let x = 0; x < canvas.width; x += 5) {
          const amplitude = 50 + Math.sin(time * 3 + x * 0.02) * 30;
          const y = centerY + Math.sin(time * 4 + x * 0.05) * amplitude * (progress / 100);
          
          if (x === 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();

      } else if (selectedBiometric === 'iris') {
        // Iris scanning pattern
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.lineWidth = 2;
        
        // Outer circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.stroke();
        
        // Scanning rays
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2 + time;
          const x1 = centerX + Math.cos(angle) * 25;
          const y1 = centerY + Math.sin(angle) * 25;
          const x2 = centerX + Math.cos(angle) * 55;
          const y2 = centerY + Math.sin(angle) * 55;
          
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // Progress indicator
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(progress)}%`, centerX, centerY + 120);

      progress += 1.5;
      setScanProgress(progress);

      if (progress < 100) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Scanning complete
        setIsScanning(false);
        setScanProgress(0);
        
        // Update biometric data
        setBiometricData(prev => ({
          ...prev,
          [selectedBiometric]: {
            ...prev[selectedBiometric],
            status: 'verified',
            confidence: 85 + Math.random() * 15,
            lastUsed: new Date()
          }
        }));

        // Add security event
        const newEvent: SecurityEvent = {
          id: Date.now().toString(),
          timestamp: new Date(),
          type: 'verification',
          biometric: selectedBiometric,
          status: 'success',
          details: `${selectedBiometric} verification completed successfully`
        };
        setSecurityEvents(prev => [newEvent, ...prev.slice(0, 9)]);
      }
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isScanning, selectedBiometric]);

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

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
  };

  const getBiometricIcon = (type: string) => {
    switch (type) {
      case 'fingerprint': return Fingerprint;
      case 'face': return Camera;
      case 'voice': return Mic;
      case 'iris': return Eye;
      default: return Shield;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
      case 'verified': return 'text-green-400 border-green-400';
      case 'scanning': return 'text-blue-400 border-blue-400';
      case 'failed': return 'text-red-400 border-red-400';
      default: return 'text-slate-400 border-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enrolled':
      case 'verified': return CheckCircle;
      case 'scanning': return Scan;
      case 'failed': return XCircle;
      default: return AlertTriangle;
    }
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
                  <Shield className="h-8 w-8 text-green-400" />
                  Biometric Security System
                  <Badge variant="outline" className="text-green-400 border-green-400">SECURE</Badge>
                </h1>
                <p className="text-slate-400 mt-2">
                  Advanced biometric authentication for maximum security
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="outline" className={
                  isSecurityEnabled 
                    ? "text-green-400 border-green-400" 
                    : "text-red-400 border-red-400"
                }>
                  {isSecurityEnabled ? (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Security Enabled
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 mr-1" />
                      Security Disabled
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Biometric Scanner */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700 h-[500px]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <Scan className="w-5 h-5" />
                      Biometric Scanner
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {securityStats.securityLevel} Security
                      </Badge>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {securityStats.authenticationSpeed}s avg
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="h-full flex flex-col">
                  {/* Biometric Type Selector */}
                  <Tabs value={selectedBiometric} onValueChange={setSelectedBiometric} className="mb-4">
                    <TabsList className="grid w-full grid-cols-4 bg-slate-700/50">
                      <TabsTrigger value="fingerprint" className="text-xs">
                        <Fingerprint className="w-4 h-4 mr-1" />
                        Print
                      </TabsTrigger>
                      <TabsTrigger value="face" className="text-xs">
                        <Camera className="w-4 h-4 mr-1" />
                        Face
                      </TabsTrigger>
                      <TabsTrigger value="voice" className="text-xs">
                        <Mic className="w-4 h-4 mr-1" />
                        Voice
                      </TabsTrigger>
                      <TabsTrigger value="iris" className="text-xs">
                        <Eye className="w-4 h-4 mr-1" />
                        Iris
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Scanner Display */}
                  <div className="flex-1 relative">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-full rounded-lg border border-slate-600"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))' 
                      }}
                    />

                    {/* Scanner Status Overlay */}
                    {isScanning && (
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-green-400">
                              Scanning {selectedBiometric}...
                            </span>
                            <span className="text-sm text-white">{scanProgress.toFixed(0)}%</span>
                          </div>
                          <Progress value={scanProgress} className="h-2" />
                        </div>
                      </div>
                    )}

                    {/* Center prompt when not scanning */}
                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          {(() => {
                            const Icon = getBiometricIcon(selectedBiometric);
                            return <Icon className="w-16 h-16 text-slate-600 mx-auto mb-4" />;
                          })()}
                          <h3 className="text-xl font-semibold text-slate-400 mb-2">
                            {selectedBiometric.charAt(0).toUpperCase() + selectedBiometric.slice(1)} Scanner Ready
                          </h3>
                          <p className="text-slate-500 mb-4">
                            Click to start {selectedBiometric} authentication
                          </p>
                          <Button 
                            onClick={startScan} 
                            className="bg-green-600 hover:bg-green-700"
                            disabled={biometricData[selectedBiometric]?.status === 'not_enrolled'}
                          >
                            <Scan className="w-4 h-4 mr-2" />
                            Start Scan
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Security Events */}
              <Card className="bg-slate-800/50 border-slate-700 mt-6">
                <CardHeader>
                  <CardTitle className="text-blue-400 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Recent Security Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {securityEvents.map((event) => {
                      const StatusIcon = event.status === 'success' ? CheckCircle : 
                                       event.status === 'failure' ? XCircle : AlertTriangle;
                      const statusColor = event.status === 'success' ? 'text-green-400' :
                                        event.status === 'failure' ? 'text-red-400' : 'text-yellow-400';
                      
                      return (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                        >
                          <div className="flex items-center gap-3">
                            <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                            <div>
                              <div className="font-medium text-white text-sm">
                                {event.details}
                              </div>
                              <div className="text-xs text-slate-400">
                                {event.timestamp.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          <Badge variant="outline" className={`text-xs ${statusColor.replace('text-', 'border-')}`}>
                            {event.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
              {/* Biometric Status */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Biometric Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(biometricData).map(([type, data]) => {
                      const Icon = getBiometricIcon(type);
                      const StatusIcon = getStatusIcon(data.status);
                      
                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-slate-400" />
                            <div>
                              <div className="font-medium text-white text-sm capitalize">
                                {type}
                              </div>
                              {data.confidence > 0 && (
                                <div className="text-xs text-slate-400">
                                  Confidence: {data.confidence.toFixed(1)}%
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${getStatusColor(data.status).split(' ')[0]}`} />
                            <Badge variant="outline" className={`text-xs ${getStatusColor(data.status)}`}>
                              {data.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Biometrics
                  </Button>
                </CardContent>
              </Card>

              {/* Security Metrics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Security Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Success Rate</span>
                      <span className="text-sm text-white font-semibold">
                        {((securityStats.successfulAttempts / securityStats.totalAttempts) * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">False Positive Rate</span>
                      <span className="text-sm text-white font-semibold">
                        {(securityStats.falsePositiveRate * 100).toFixed(3)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">False Negative Rate</span>
                      <span className="text-sm text-white font-semibold">
                        {(securityStats.falseNegativeRate * 100).toFixed(3)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Auth Speed</span>
                      <span className="text-sm text-white font-semibold">
                        {securityStats.authenticationSpeed}s
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">Total Attempts</span>
                        <span className="text-sm text-green-400 font-semibold">
                          {securityStats.totalAttempts}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Multi-Factor Auth</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Enabled
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Liveness Detection</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Active
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Anti-Spoofing</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Maximum
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Session Timeout</span>
                      <span className="text-sm text-white">15 minutes</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update Security Policy
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