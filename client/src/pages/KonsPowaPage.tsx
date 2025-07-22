import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KonsPowaTaskDashboard from "@/components/KonsPowaTaskDashboard";
import KonsPowaAutoHealerDashboard from "@/components/KonsPowaAutoHealerDashboard";
import { Brain, Zap, Activity, Settings } from "lucide-react";

export default function KonsPowaPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-600 rounded-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">KonsPowa Engine</h1>
                <p className="text-slate-400">Autonomous Task Management & System Healing</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400">System Status</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Task Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="healing" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Auto-Healing</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configuration</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <KonsPowaTaskDashboard />
          </TabsContent>

          <TabsContent value="healing">
            <KonsPowaAutoHealerDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-400" />
                  KonsPowa Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-white mb-3">Task Execution Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Auto-execution mode</span>
                        <Button variant="outline" size="sm" className="border-slate-600">
                          Configure
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Task priority weighting</span>
                        <Button variant="outline" size="sm" className="border-slate-600">
                          Configure
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Healing thresholds</span>
                        <Button variant="outline" size="sm" className="border-slate-600">
                          Configure
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-3">Monitoring Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Health check frequency</span>
                        <span className="text-slate-400 text-sm">Every 10 seconds</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Task completion alerts</span>
                        <span className="text-green-400 text-sm">Enabled</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Error notification level</span>
                        <span className="text-yellow-400 text-sm">Medium+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}