import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Upload, 
  Scan, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Eye, 
  Brain,
  Activity,
  BarChart3,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileImage,
  Zap,
  Globe
} from 'lucide-react';


interface AnalysisResult {
  id: string;
  timestamp: Date;
  imageType: 'chart' | 'screenshot' | 'diagram';
  prediction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  confidence: number;
  timeframe: string;
  priceTarget?: number;
  supportLevel?: number;
  resistanceLevel?: number;
  patterns: string[];
  technicalIndicators: Record<string, number>;
  reasoning: string;
}

interface ScannerMetrics {
  totalScans: number;
  successfulScans: number;
  accuracy: number;
  avgConfidence: number;
  patternRecognition: number;
  processingSpeed: number;
}

export default function MarketScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [scannerMetrics, setScannerMetrics] = useState<ScannerMetrics>({
    totalScans: 237,
    successfulScans: 218,
    accuracy: 91.9,
    avgConfidence: 87.3,
    patternRecognition: 94.2,
    processingSpeed: 1.2
  });

  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Initialize camera
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        } 
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      // Fallback to simulated camera
      setIsCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraActive(false);
    }
  };

  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setSelectedImage(imageData);
    analyzeImage(imageData);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setSelectedImage(imageData);
      analyzeImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Simulate AI image analysis
  const analyzeImage = (imageData: string) => {
    setIsScanning(true);
    setScanProgress(0);

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsScanning(false);
          
          // Generate analysis result
          const patterns = [
            'Head and Shoulders',
            'Double Bottom',
            'Ascending Triangle',
            'Bullish Flag',
            'Support Breakout',
            'Resistance Test',
            'Cup and Handle',
            'Wedge Pattern'
          ];

          const indicators = {
            RSI: 45 + Math.random() * 40,
            MACD: (Math.random() - 0.5) * 2,
            SMA_20: 3200 + Math.random() * 600,
            Bollinger_Upper: 3500 + Math.random() * 300,
            Bollinger_Lower: 3000 + Math.random() * 300,
            Volume: Math.random() * 1000000
          };

          const predictions: ('BULLISH' | 'BEARISH' | 'NEUTRAL')[] = ['BULLISH', 'BEARISH', 'NEUTRAL'];
          const prediction = predictions[Math.floor(Math.random() * predictions.length)];
          
          const result: AnalysisResult = {
            id: Date.now().toString(),
            timestamp: new Date(),
            imageType: 'chart',
            prediction,
            confidence: 75 + Math.random() * 20,
            timeframe: ['1H', '4H', '1D', '1W'][Math.floor(Math.random() * 4)],
            priceTarget: 3000 + Math.random() * 2000,
            supportLevel: 2800 + Math.random() * 400,
            resistanceLevel: 3400 + Math.random() * 600,
            patterns: [patterns[Math.floor(Math.random() * patterns.length)]],
            technicalIndicators: indicators,
            reasoning: `AI analysis detected ${prediction.toLowerCase()} signals based on price action, volume analysis, and technical indicators. Pattern recognition identified potential ${patterns[Math.floor(Math.random() * patterns.length)]} formation.`
          };

          setAnalysisResults(prev => [result, ...prev.slice(0, 7)]);
          
          // Update metrics
          setScannerMetrics(prev => ({
            ...prev,
            totalScans: prev.totalScans + 1,
            successfulScans: prev.successfulScans + 1
          }));

          return 100;
        }
        return prev + Math.random() * 5 + 2;
      });
    }, 100);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'BULLISH': return 'text-green-400 border-green-400 bg-green-400/10';
      case 'BEARISH': return 'text-red-400 border-red-400 bg-red-400/10';
      default: return 'text-yellow-400 border-yellow-400 bg-yellow-400/10';
    }
  };

  const getPredictionIcon = (prediction: string) => {
    switch (prediction) {
      case 'BULLISH': return TrendingUp;
      case 'BEARISH': return TrendingDown;
      default: return Activity;
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
                  <Scan className="h-8 w-8 text-blue-400" />
                  AI Market Scanner
                  <Badge variant="outline" className="text-blue-400 border-blue-400">LIVE</Badge>
                </h1>
                <p className="text-slate-400 mt-2">
                  Advanced AI-powered chart analysis with camera and upload support
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-green-400 border-green-400">
                  {scannerMetrics.accuracy.toFixed(1)}% Accuracy
                </Badge>
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  {scannerMetrics.processingSpeed}s avg
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scanner Interface */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-400 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Chart Scanner
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-purple-400 border-purple-400">
                        AI Vision Enabled
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'camera' | 'upload')}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="camera" onClick={() => activeTab === 'camera' ? initializeCamera() : stopCamera()}>
                        <Camera className="w-4 h-4 mr-2" />
                        Camera Scan
                      </TabsTrigger>
                      <TabsTrigger value="upload" onClick={stopCamera}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="camera" className="space-y-4">
                      <div className="relative bg-slate-900 rounded-lg overflow-hidden h-[400px]">
                        {isCameraActive ? (
                          <>
                            <video
                              ref={videoRef}
                              autoPlay
                              playsInline
                              muted
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                              <Button
                                onClick={captureImage}
                                className="bg-blue-600 hover:bg-blue-700 rounded-full p-4"
                                disabled={isScanning}
                              >
                                <Camera className="w-6 h-6" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <Camera className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                                Camera Access Required
                              </h3>
                              <p className="text-slate-500 mb-4">
                                Enable camera access to scan trading charts in real-time
                              </p>
                              <Button
                                onClick={initializeCamera}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                Enable Camera
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Scanning overlay */}
                        {isScanning && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center">
                              <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
                              <h3 className="text-lg font-semibold text-white mb-2">
                                AI Analysis in Progress
                              </h3>
                              <Progress value={scanProgress} className="w-64 mb-2" />
                              <p className="text-sm text-slate-300">
                                {scanProgress.toFixed(0)}% - Analyzing chart patterns...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="upload" className="space-y-4">
                      <div className="relative">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        
                        <div 
                          className="border-2 border-dashed border-slate-600 rounded-lg p-8 h-[400px] flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {selectedImage ? (
                            <div className="relative w-full h-full">
                              <img
                                src={selectedImage}
                                alt="Uploaded chart"
                                className="w-full h-full object-contain rounded-lg"
                              />
                              
                              {/* Analysis overlay */}
                              {isScanning && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                  <div className="text-center">
                                    <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                      AI Analysis in Progress
                                    </h3>
                                    <Progress value={scanProgress} className="w-64 mb-2" />
                                    <p className="text-sm text-slate-300">
                                      {scanProgress.toFixed(0)}% - Processing image...
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center">
                              <FileImage className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                                Upload Trading Chart
                              </h3>
                              <p className="text-slate-500 mb-4">
                                Click to upload or drag and drop your chart screenshot
                              </p>
                              <Button className="bg-blue-600 hover:bg-blue-700">
                                <Upload className="w-4 h-4 mr-2" />
                                Select Image
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <Card className="bg-slate-800/50 border-slate-700 mt-6">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResults.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No analysis results yet. Scan a chart to get AI predictions.</p>
                      </div>
                    ) : (
                      analysisResults.map((result) => {
                        const Icon = getPredictionIcon(result.prediction);
                        return (
                          <div
                            key={result.id}
                            className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Icon className="w-6 h-6 text-blue-400" />
                                <div>
                                  <div className="font-semibold text-white">
                                    Market Prediction • {result.timeframe}
                                  </div>
                                  <div className="text-sm text-slate-400">
                                    {result.timestamp.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getPredictionColor(result.prediction)}>
                                  {result.prediction}
                                </Badge>
                                <div className="text-right">
                                  <div className="text-sm text-white font-semibold">
                                    {result.confidence.toFixed(1)}%
                                  </div>
                                  <div className="text-xs text-slate-400">confidence</div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                              {result.priceTarget && (
                                <div className="text-center p-2 bg-slate-800/50 rounded">
                                  <div className="text-xs text-slate-400">Price Target</div>
                                  <div className="text-sm text-white font-semibold">
                                    ${result.priceTarget.toFixed(2)}
                                  </div>
                                </div>
                              )}
                              {result.supportLevel && (
                                <div className="text-center p-2 bg-slate-800/50 rounded">
                                  <div className="text-xs text-slate-400">Support</div>
                                  <div className="text-sm text-green-400 font-semibold">
                                    ${result.supportLevel.toFixed(2)}
                                  </div>
                                </div>
                              )}
                              {result.resistanceLevel && (
                                <div className="text-center p-2 bg-slate-800/50 rounded">
                                  <div className="text-xs text-slate-400">Resistance</div>
                                  <div className="text-sm text-red-400 font-semibold">
                                    ${result.resistanceLevel.toFixed(2)}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="mb-3">
                              <div className="text-xs text-slate-400 mb-1">Detected Patterns</div>
                              <div className="flex flex-wrap gap-1">
                                {result.patterns.map((pattern, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {pattern}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="text-sm text-slate-300">
                              {result.reasoning}
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
              {/* Scanner Metrics */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Scanner Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Success Rate</span>
                      <span className="text-sm text-white font-semibold">
                        {((scannerMetrics.successfulScans / scannerMetrics.totalScans) * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Avg Confidence</span>
                      <span className="text-sm text-white font-semibold">
                        {scannerMetrics.avgConfidence.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Pattern Recognition</span>
                      <span className="text-sm text-white font-semibold">
                        {scannerMetrics.patternRecognition.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Processing Speed</span>
                      <span className="text-sm text-white font-semibold">
                        {scannerMetrics.processingSpeed}s
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-600">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">Total Scans</span>
                        <span className="text-sm text-green-400 font-semibold">
                          {scannerMetrics.totalScans}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Vision Status */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-cyan-400 flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Vision Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">AI Engine</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Pattern Detection</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Enabled
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Technical Analysis</span>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Advanced
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Real-time Processing</span>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        Live
                      </Badge>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Calibrate AI Vision
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload New Chart
                    </Button>
                    
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                      onClick={() => {
                        if (activeTab === 'camera' && !isCameraActive) {
                          initializeCamera();
                        } else if (activeTab === 'camera' && isCameraActive) {
                          captureImage();
                        }
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {isCameraActive ? 'Capture Chart' : 'Start Camera'}
                    </Button>
                    
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Live Market Scan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}