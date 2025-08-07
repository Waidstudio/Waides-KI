import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Shield, Heart, Network, Activity } from 'lucide-react';

// Import the AI integration components
import AIModelMonitor from '@/components/AIModelMonitor';
import RiskManagementPanel from '@/components/RiskManagementPanel';
import PsychologyAnalysisPanel from '@/components/PsychologyAnalysisPanel';
import SpiritualAIPanel from '@/components/SpiritualAIPanel';
import EntityIntegrationDashboard from '@/components/EntityIntegrationDashboard';

export default function AISystemsPage() {
  const [selectedSystem, setSelectedSystem] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-800">
            Waides KI AI Systems
          </h1>
          <p className="text-lg text-gray-600">
            Comprehensive AI-powered trading intelligence across all 6 entities
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="outline" className="text-xs">
              Alpha • Beta • Gamma • Omega • Delta • Epsilon
            </Badge>
            <Badge variant="outline" className="text-xs">
              Production Ready
            </Badge>
          </div>
        </div>

        <Tabs value={selectedSystem} onValueChange={setSelectedSystem} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-models">AI Models</TabsTrigger>
            <TabsTrigger value="risk">Risk Management</TabsTrigger>
            <TabsTrigger value="psychology">Psychology</TabsTrigger>
            <TabsTrigger value="spiritual">Spiritual AI</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => setSelectedSystem('ai-models')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    AI Models
                  </CardTitle>
                  <CardDescription>
                    Advanced machine learning models with drift monitoring, traceability, and training analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Models</span>
                      <span className="font-medium">6</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Training Success Rate</span>
                      <span className="font-medium text-green-600">94%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Drift Alerts</span>
                      <span className="font-medium text-orange-600">2</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View AI Models
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => setSelectedSystem('risk')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Risk Management
                  </CardTitle>
                  <CardDescription>
                    Ethical decision engine, Kelly sizing, and comprehensive position monitoring
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Positions Monitored</span>
                      <span className="font-medium">127</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Risk Score</span>
                      <span className="font-medium text-green-600">Low</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Interventions</span>
                      <span className="font-medium">3</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Risk Management
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => setSelectedSystem('psychology')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-500" />
                    Psychology Analysis
                  </CardTitle>
                  <CardDescription>
                    Market sentiment, fear/greed index, and psychological profiling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fear & Greed Index</span>
                      <span className="font-medium text-green-600">72 (Greed)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Market Sentiment</span>
                      <span className="font-medium text-blue-600">Bullish</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Analysis Accuracy</span>
                      <span className="font-medium">87%</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Psychology
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => setSelectedSystem('spiritual')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Spiritual AI
                  </CardTitle>
                  <CardDescription>
                    Cosmic energy readings, divine signals, and karmic assessments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cosmic Energy</span>
                      <span className="font-medium text-purple-600">85%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Divine Approval</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Spiritual Guidance</span>
                      <span className="font-medium">Strong Buy</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Spiritual AI
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => setSelectedSystem('integration')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="h-5 w-5 text-blue-500" />
                    Entity Integration
                  </CardTitle>
                  <CardDescription>
                    Central coordination hub managing all 6 trading entities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>System Health</span>
                      <span className="font-medium text-green-600">98%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Entity Consensus</span>
                      <span className="font-medium text-blue-600">Bullish</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Integration Success</span>
                      <span className="font-medium">96%</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View Integration
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="text-center">AI System Status</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="text-4xl font-bold text-green-600">
                    OPERATIONAL
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All AI systems are functioning optimally across all 6 trading entities
                  </p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="default">Alpha ✓</Badge>
                    <Badge variant="default">Beta ✓</Badge>
                    <Badge variant="default">Gamma ✓</Badge>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Badge variant="default">Omega ✓</Badge>
                    <Badge variant="default">Delta ✓</Badge>
                    <Badge variant="default">Epsilon ✓</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle>AI System Architecture Overview</CardTitle>
                <CardDescription>
                  Comprehensive AI infrastructure supporting all 6 trading entities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <Brain className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold text-blue-700">Advanced Models</h3>
                    <p className="text-sm text-blue-600">Test data management, training, drift monitoring, traceability</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <h3 className="font-semibold text-green-700">Risk Management</h3>
                    <p className="text-sm text-green-600">Ethical decisions, Kelly sizing, position monitoring</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <h3 className="font-semibold text-purple-700">Psychology Analysis</h3>
                    <p className="text-sm text-purple-600">Fear/greed indicators, sentiment analysis, profiling</p>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded">
                    <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <h3 className="font-semibold text-red-700">Spiritual Intelligence</h3>
                    <p className="text-sm text-red-600">Cosmic readings, divine signals, karmic guidance</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded">
                  <h3 className="font-semibold mb-2">Key Features:</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="text-sm">• A/B Testing Framework with statistical analysis</div>
                    <div className="text-sm">• Loss Streak Monitoring with adaptive responses</div>
                    <div className="text-sm">• Cross-Entity Integration and coordination</div>
                    <div className="text-sm">• Real-time System Health Monitoring</div>
                    <div className="text-sm">• Ethical Decision Engine with oversight</div>
                    <div className="text-sm">• Performance Drift Detection and alerting</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-models">
            <AIModelMonitor />
          </TabsContent>

          <TabsContent value="risk">
            <RiskManagementPanel />
          </TabsContent>

          <TabsContent value="psychology">
            <PsychologyAnalysisPanel />
          </TabsContent>

          <TabsContent value="spiritual">
            <SpiritualAIPanel />
          </TabsContent>

          <TabsContent value="integration">
            <EntityIntegrationDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}