import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Eye, Zap, Activity, Lock, Unlock, AlertCircle } from 'lucide-react';

export function ShadowOverrideDefense() {
  const queryClient = useQueryClient();
  const [emergencyReason, setEmergencyReason] = useState('');
  const [bypassCode, setBypassCode] = useState('');
  const [bypassReason, setBypassReason] = useState('');

  // Fetch shadow defense data
  const { data: defenseStatus } = useQuery({
    queryKey: ['/api/waides-ki/shadow/status'],
    refetchInterval: 5000
  });

  const { data: quickStatus } = useQuery({
    queryKey: ['/api/waides-ki/shadow/quick-status'],
    refetchInterval: 2000
  });

  const { data: defenseStats } = useQuery({
    queryKey: ['/api/waides-ki/shadow/stats'],
    refetchInterval: 30000
  });

  const { data: lockdownStatus } = useQuery({
    queryKey: ['/api/waides-ki/shadow/lockdown/status'],
    refetchInterval: 5000
  });

  const { data: instinctStatus } = useQuery({
    queryKey: ['/api/waides-ki/shadow/instinct/status'],
    refetchInterval: 5000
  });

  const { data: recoveryStats } = useQuery({
    queryKey: ['/api/waides-ki/shadow/recovery/stats'],
    refetchInterval: 30000
  });

  // Mutations for shadow defense operations
  const forceActivateMutation = useMutation({
    mutationFn: ({ reason, duration }: { reason: string; duration?: number }) =>
      fetch('/api/waides-ki/shadow/force-activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, duration })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/shadow/status'] });
      setEmergencyReason('');
    }
  });

  const forceDeactivateMutation = useMutation({
    mutationFn: (reason: string) =>
      fetch('/api/waides-ki/shadow/force-deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/shadow/status'] });
    }
  });

  const demoChaosMutation = useMutation({
    mutationFn: () =>
      fetch('/api/waides-ki/shadow/demo-chaos-defense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waides-ki/shadow/status'] });
    }
  });

  const attemptBypassMutation = useMutation({
    mutationFn: ({ code, reason }: { code: string; reason: string }) =>
      fetch('/api/waides-ki/shadow/lockdown/attempt-bypass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          authorization_code: code, 
          bypass_reason: reason,
          trade_data: {}
        })
      }).then(res => res.json()),
    onSuccess: () => {
      setBypassCode('');
      setBypassReason('');
    }
  });

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'EMERGENCY': return 'text-red-400 bg-red-900/20';
      case 'HIGH': return 'text-orange-400 bg-orange-900/20';
      case 'MODERATE': return 'text-yellow-400 bg-yellow-900/20';
      case 'LOW': return 'text-green-400 bg-green-900/20';
      default: return 'text-slate-400 bg-slate-900/20';
    }
  };

  const getInstinctLevelColor = (level: string) => {
    switch (level) {
      case 'TRANSCENDENT': return 'text-purple-400';
      case 'HYPER_ACTIVE': return 'text-red-400';
      case 'ACTIVE': return 'text-orange-400';
      case 'AWAKENING': return 'text-yellow-400';
      case 'DORMANT': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (60 * 1000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-100 flex items-center justify-center gap-2">
          <Shield className="w-8 h-8 text-red-500" />
          Shadow Override Defense
        </h2>
        <p className="text-slate-400">
          "When logic fails... instinct awakens. Ultimate survival protocol."
        </p>
      </div>

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {quickStatus?.shadow_active ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <Shield className="w-5 h-5 text-green-400" />
              )}
              <div>
                <div className="text-xs text-slate-400">Defense Status</div>
                <div className="text-lg font-bold text-slate-100">
                  {quickStatus?.shadow_active ? 'ACTIVE' : 'DORMANT'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-xs text-slate-400">Threat Level</div>
                <Badge className={getThreatLevelColor(quickStatus?.threat_level || 'LOW')}>
                  {quickStatus?.threat_level || 'LOW'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-xs text-slate-400">Instinct Level</div>
                <div className={`text-lg font-bold ${getInstinctLevelColor(defenseStatus?.instinct_level || 'DORMANT')}`}>
                  {defenseStatus?.instinct_level || 'DORMANT'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-xs text-slate-400">Trades Protected</div>
                <div className="text-lg font-bold text-slate-100">
                  {defenseStatus?.total_trades_protected || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defense Active Warning */}
      {quickStatus?.shadow_active && (
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div className="flex-1">
                <div className="text-red-300 font-semibold">Shadow Override Defense Active</div>
                <div className="text-red-400 text-sm">
                  {instinctStatus?.activation_reason || 'Emergency protection protocol engaged'}
                </div>
                <div className="text-red-500 text-sm italic mt-1">
                  {defenseStatus?.konslang_state || "Kol'thain mor'protection — Sacred barriers shield from destruction"}
                </div>
              </div>
              {instinctStatus?.time_remaining && (
                <div className="text-right">
                  <div className="text-xs text-red-400">Recovery in</div>
                  <div className="text-sm font-bold text-red-300">
                    {formatTime(instinctStatus.time_remaining)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="defense-control" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800">
          <TabsTrigger value="defense-control">Defense Control</TabsTrigger>
          <TabsTrigger value="threat-detection">Threat Detection</TabsTrigger>
          <TabsTrigger value="instinct-monitor">Instinct Monitor</TabsTrigger>
          <TabsTrigger value="lockdown-control">Lockdown Control</TabsTrigger>
          <TabsTrigger value="recovery-monitor">Recovery Monitor</TabsTrigger>
          <TabsTrigger value="demo-chaos">Demo Chaos</TabsTrigger>
        </TabsList>

        {/* Defense Control Tab */}
        <TabsContent value="defense-control" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Current Status */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  Defense Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Defense Active</span>
                    <span className={defenseStatus?.defense_active ? 'text-red-400' : 'text-green-400'}>
                      {defenseStatus?.defense_active ? 'YES' : 'NO'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chaos Level</span>
                    <span className="text-orange-400">
                      {(defenseStatus?.chaos_level * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Protection Layers</span>
                    <span className="text-blue-400">
                      {defenseStatus?.protection_layers?.length || 0}
                    </span>
                  </div>
                  {defenseStatus?.time_in_shadow_mode > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time in Shadow</span>
                      <span className="text-purple-400">
                        {formatTime(defenseStatus.time_in_shadow_mode)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Effectiveness</span>
                    <span className="text-green-400">
                      {defenseStatus?.defense_effectiveness?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>

                {defenseStatus?.protection_layers?.length > 0 && (
                  <div>
                    <div className="text-slate-400 text-sm mb-2">Active Protections</div>
                    <div className="flex flex-wrap gap-1">
                      {defenseStatus.protection_layers.map((layer: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {layer.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Controls */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Emergency Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>Emergency Reason</Label>
                    <Input
                      value={emergencyReason}
                      onChange={(e) => setEmergencyReason(e.target.value)}
                      placeholder="Describe the emergency..."
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => {
                        if (emergencyReason.trim()) {
                          forceActivateMutation.mutate({ reason: emergencyReason });
                        }
                      }}
                      disabled={!emergencyReason.trim() || forceActivateMutation.isPending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Force Activate
                    </Button>

                    <Button
                      onClick={() => forceDeactivateMutation.mutate('Manual override')}
                      disabled={!defenseStatus?.defense_active || forceDeactivateMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      Force Deactivate
                    </Button>
                  </div>
                </div>

                {defenseStatus?.konslang_state && (
                  <div className="p-3 bg-slate-800 rounded">
                    <div className="text-xs text-slate-400 mb-1">Konslang State</div>
                    <div className="text-purple-300 italic text-sm">
                      "{defenseStatus.konslang_state}"
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle>Defense Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-100">
                    {defenseStats?.total_activations || 0}
                  </div>
                  <div className="text-sm text-slate-400">Total Activations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {defenseStats?.successful_protections || 0}
                  </div>
                  <div className="text-sm text-slate-400">Successful Protections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {(defenseStats?.defense_accuracy || 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-400">Defense Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {(defenseStats?.system_resilience_score || 0).toFixed(0)}
                  </div>
                  <div className="text-sm text-slate-400">System Resilience</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Threat Detection Tab */}
        <TabsContent value="threat-detection" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-orange-400" />
                Chaos Detection System
              </CardTitle>
              <CardDescription>
                Advanced threat detection monitoring market chaos and invisible dangers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-slate-800 rounded">
                  <div className="text-lg font-bold text-orange-400 mb-2">
                    Current Chaos Level
                  </div>
                  <Progress 
                    value={(defenseStatus?.chaos_level || 0) * 100} 
                    className="w-full h-3 mb-2"
                  />
                  <div className="text-sm text-slate-400">
                    {((defenseStatus?.chaos_level || 0) * 100).toFixed(1)}% - 
                    {(defenseStatus?.chaos_level || 0) > 0.8 ? ' LETHAL' :
                     (defenseStatus?.chaos_level || 0) > 0.6 ? ' HIGH' :
                     (defenseStatus?.chaos_level || 0) > 0.4 ? ' MODERATE' : ' LOW'}
                  </div>
                </div>

                <div className="text-center text-slate-400">
                  Next chaos scan in: {Math.ceil((quickStatus?.next_scan_in || 30000) / 1000)}s
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instinct Monitor Tab */}
        <TabsContent value="instinct-monitor" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Instinct Switch Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getInstinctLevelColor(instinctStatus?.instinct_level || 'DORMANT')}`}>
                      {instinctStatus?.instinct_level || 'DORMANT'}
                    </div>
                    <div className="text-sm text-slate-400">Instinct Level</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-100">
                      {instinctStatus?.protection_count || 0}
                    </div>
                    <div className="text-sm text-slate-400">Protection Layers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-100">
                      {instinctStatus?.time_active ? formatTime(instinctStatus.time_active) : '0m'}
                    </div>
                    <div className="text-sm text-slate-400">Time Active</div>
                  </div>
                </div>

                {instinctStatus?.konslang_state && (
                  <div className="p-3 bg-slate-800 rounded">
                    <div className="text-xs text-slate-400 mb-1">Konslang State</div>
                    <div className="text-blue-300 italic text-sm">
                      "{instinctStatus.konslang_state}"
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lockdown Control Tab */}
        <TabsContent value="lockdown-control" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-400" />
                  Lockdown Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shadow Override</span>
                    <span className={lockdownStatus?.shadow_override_active ? 'text-red-400' : 'text-green-400'}>
                      {lockdownStatus?.shadow_override_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Lockdown</span>
                    <span className={lockdownStatus?.emergency_lockdown_active ? 'text-red-400' : 'text-green-400'}>
                      {lockdownStatus?.emergency_lockdown_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Override Level</span>
                    <Badge className={getThreatLevelColor(lockdownStatus?.override_level || 'NONE')}>
                      {lockdownStatus?.override_level || 'NONE'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bypass Possible</span>
                    <span className={lockdownStatus?.bypass_possible ? 'text-yellow-400' : 'text-red-400'}>
                      {lockdownStatus?.bypass_possible ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>

                {lockdownStatus?.lockdown_reason && (
                  <div className="mt-4 p-3 bg-slate-800 rounded">
                    <div className="text-xs text-slate-400 mb-1">Lockdown Reason</div>
                    <div className="text-red-300 text-sm">
                      {lockdownStatus.lockdown_reason}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bypass Controls */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Unlock className="w-5 h-5 text-yellow-400" />
                  Emergency Bypass
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label>Authorization Code</Label>
                    <Select value={bypassCode} onValueChange={setBypassCode}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select code..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMERGENCY_OVERRIDE">EMERGENCY_OVERRIDE</SelectItem>
                        <SelectItem value="ADMIN_BYPASS">ADMIN_BYPASS</SelectItem>
                        <SelectItem value="CRITICAL_TRADE">CRITICAL_TRADE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Bypass Reason</Label>
                    <Input
                      value={bypassReason}
                      onChange={(e) => setBypassReason(e.target.value)}
                      placeholder="Justify bypass reason..."
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      if (bypassCode && bypassReason.trim()) {
                        attemptBypassMutation.mutate({ code: bypassCode, reason: bypassReason });
                      }
                    }}
                    disabled={!bypassCode || !bypassReason.trim() || attemptBypassMutation.isPending || !lockdownStatus?.bypass_possible}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Unlock className="w-4 h-4 mr-2" />
                    Attempt Bypass
                  </Button>
                </div>

                {attemptBypassMutation.data && (
                  <div className={`p-3 rounded ${attemptBypassMutation.data.bypass_granted ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                    <div className="text-sm font-semibold mb-1">
                      {attemptBypassMutation.data.bypass_granted ? 'Bypass Granted' : 'Bypass Denied'}
                    </div>
                    <div className="text-xs italic">
                      {attemptBypassMutation.data.konslang_blessing}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recovery Monitor Tab */}
        <TabsContent value="recovery-monitor" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-400" />
                Clarity Recovery Monitor
              </CardTitle>
              <CardDescription>
                Monitoring market clarity restoration and safe recovery signals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {recoveryStats?.successful_recoveries || 0}
                  </div>
                  <div className="text-sm text-slate-400">Successful Recoveries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {(recoveryStats?.recovery_accuracy || 0).toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-400">Recovery Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {recoveryStats?.average_recovery_time ? formatTime(recoveryStats.average_recovery_time) : '0m'}
                  </div>
                  <div className="text-sm text-slate-400">Average Recovery Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Chaos Tab */}
        <TabsContent value="demo-chaos" className="space-y-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Chaos Defense Demo
              </CardTitle>
              <CardDescription>
                Test the Shadow Override Defense system with simulated chaos events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => demoChaosMutation.mutate()}
                disabled={demoChaosMutation.isPending}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {demoChaosMutation.isPending ? 'Simulating Chaos...' : 'Simulate Chaos Event'}
              </Button>

              {demoChaosMutation.data && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4 space-y-3">
                    <div className="text-center text-orange-400 font-medium">
                      🌑 {demoChaosMutation.data.message}
                    </div>

                    {demoChaosMutation.data.chaos_threat && (
                      <div className="p-3 bg-slate-900 rounded">
                        <div className="text-sm text-slate-400 mb-2">Threat Detected</div>
                        <div className="text-orange-300">
                          {demoChaosMutation.data.chaos_threat.threat_type} ({demoChaosMutation.data.chaos_threat.severity})
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Chaos Score: {(demoChaosMutation.data.chaos_threat.chaos_score * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}

                    {demoChaosMutation.data.defense_activation && (
                      <div className="p-3 bg-slate-900 rounded">
                        <div className="text-sm text-slate-400 mb-2">Defense Activated</div>
                        <div className="text-red-300 mb-1">
                          {demoChaosMutation.data.defense_activation.trigger_event}
                        </div>
                        <div className="text-xs text-purple-300 italic">
                          {demoChaosMutation.data.defense_activation.konslang_blessing}
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-slate-900 rounded">
                      <div className="text-sm text-slate-400 mb-2">Trade Permission</div>
                      <div className={`font-semibold ${demoChaosMutation.data.trade_permission?.trade_allowed ? 'text-green-400' : 'text-red-400'}`}>
                        {demoChaosMutation.data.trade_permission?.trade_allowed ? 'ALLOWED' : 'BLOCKED'}
                      </div>
                      {demoChaosMutation.data.trade_permission?.block_reason && (
                        <div className="text-xs text-red-300 mt-1">
                          {demoChaosMutation.data.trade_permission.block_reason}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}