import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Headphones, Play, Volume2, Settings, Waves, Zap } from "lucide-react";
import AudioLandscapeControls from '../components/AudioLandscapeControls';

export default function AudioLandscapeTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Audio Landscape Test
          </h1>
          <p className="text-slate-300 text-lg">
            Testing the immersive trading floor audio environment
          </p>
          <Badge variant="outline" className="border-green-400/40 text-green-400">
            <Zap className="w-4 h-4 mr-2" />
            TESTING ENVIRONMENT
          </Badge>
        </div>

        {/* Quick Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-blue-400/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center space-x-2">
                <Headphones className="w-5 h-5 text-blue-400" />
                <span>Audio Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">READY</div>
                <p className="text-sm text-slate-300">Audio landscape engine initialized and ready for testing</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-green-400/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-green-400" />
                <span>Master Volume</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">75%</div>
                <p className="text-sm text-slate-300">Global audio landscape volume level</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-orange-400/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center space-x-2">
                <Waves className="w-5 h-5 text-orange-400" />
                <span>Active Sounds</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-2">8</div>
                <p className="text-sm text-slate-300">Trading floor sound effects currently active</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Actions */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-purple-400/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center space-x-2">
              <Play className="w-5 h-5 text-purple-400" />
              <span>Quick Test Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Play className="w-4 h-4 mr-2" />
                Start Audio
              </Button>
              <Button variant="outline" className="border-orange-400/40 text-orange-400 hover:bg-orange-400/10">
                <Volume2 className="w-4 h-4 mr-2" />
                Test Volume
              </Button>
              <Button variant="outline" className="border-blue-400/40 text-blue-400 hover:bg-blue-400/10">
                <Headphones className="w-4 h-4 mr-2" />
                Spatial Audio
              </Button>
              <Button variant="outline" className="border-purple-400/40 text-purple-400 hover:bg-purple-400/10">
                <Settings className="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Audio Landscape Controls */}
        <AudioLandscapeControls />

        {/* Test Console */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-400/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center space-x-2">
              <Settings className="w-5 h-5 text-slate-400" />
              <span>Test Console</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-green-400 h-32 overflow-y-auto">
              <div>[5:44:22 PM] Audio Landscape Engine initialized</div>
              <div>[5:44:22 PM] Trading floor sounds loaded: 12 effects</div>
              <div>[5:44:22 PM] Spatial audio engine ready</div>
              <div>[5:44:22 PM] Master volume set to 75%</div>
              <div>[5:44:22 PM] Waiting for user interaction...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}