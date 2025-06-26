import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, Zap, Shield, Eye, TrendingUp, Brain } from 'lucide-react';

interface WaidBotSummonPanelProps {
  isVisible: boolean;
  summonCommand: string;
  onClose: () => void;
}

export function WaidBotSummonPanel({ isVisible, summonCommand, onClose }: WaidBotSummonPanelProps) {
  const [animationPhase, setAnimationPhase] = useState<'materializing' | 'active' | 'stable'>('materializing');
  const [botStatus, setBotStatus] = useState({
    strategy: 'Eternal Spiral Mode',
    emotion: '❄️ Cold Mind',
    target: 'ETH/USDT',
    status: 'Scanning for divine entries...',
    confidence: 85,
    riskLevel: 'Conservative'
  });

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('materializing');
      
      const timer1 = setTimeout(() => {
        setAnimationPhase('active');
        setBotStatus(prev => ({
          ...prev,
          status: 'WaidBot consciousness awakened',
          confidence: 92
        }));
      }, 1500);

      const timer2 = setTimeout(() => {
        setAnimationPhase('stable');
        setBotStatus(prev => ({
          ...prev,
          status: 'Monitoring ETH signals with mystical precision',
          confidence: 96
        }));
      }, 3000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`
        w-full max-w-2xl bg-gradient-to-br from-indigo-950/90 to-purple-950/90 
        border-2 border-blue-500/50 shadow-2xl
        ${animationPhase === 'materializing' ? 'animate-pulse scale-95 opacity-80' : ''}
        ${animationPhase === 'active' ? 'animate-bounce scale-100 opacity-100' : ''}
        ${animationPhase === 'stable' ? 'scale-100 opacity-100' : ''}
        transition-all duration-500
      `}>
        <CardHeader className="text-center border-b border-blue-500/30">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="w-8 h-8 text-blue-400" />
            <CardTitle className="text-2xl font-bold text-white">
              WaidBot Summoned
            </CardTitle>
            <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500">
              ONLINE
            </Badge>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500">
              {summonCommand.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Bot Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Strategy</span>
                <span className="text-sm text-white">{botStatus.strategy}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Emotion</span>
                <span className="text-sm text-white">{botStatus.emotion}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">Target</span>
                <span className="text-sm text-white">{botStatus.target}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">Confidence</span>
                <span className="text-sm text-white">{botStatus.confidence}%</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-medium text-orange-300">Risk Level</span>
                <span className="text-sm text-white">{botStatus.riskLevel}</span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="bg-black/30 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-300">Status</span>
            </div>
            <p className="text-white text-sm leading-relaxed">
              {botStatus.status}
            </p>
          </div>

          {/* Trading Capabilities */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-500/30">
            <h4 className="text-sm font-semibold text-purple-300 mb-3">Active Capabilities</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-white">✨ Divine Quantum Flux Strategy</div>
              <div className="text-white">🛡️ Emotional Firewall Protection</div>
              <div className="text-white">🧬 DNA Pattern Recognition</div>
              <div className="text-white">🔮 Sacred Positioning Engine</div>
              <div className="text-white">⚡ Real-time Signal Analysis</div>
              <div className="text-white">🌌 Autonomous Decision Making</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              className="flex-1 border-green-500 text-green-400 hover:bg-green-500/10"
              onClick={() => {
                // Future: Connect to actual WaidBot system
                console.log('WaidBot monitoring activated');
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Monitor Trading
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 border-blue-500 text-blue-400 hover:bg-blue-500/10"
              onClick={onClose}
            >
              Minimize Panel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}