import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Search, Download, Upload, RotateCcw, Settings, Save, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface ComprehensiveConfig {
  system: Record<string, any>;
  trading: Record<string, any>;
  wallet: Record<string, any>;
  security: Record<string, any>;
  konsai: Record<string, any>;
  ui: Record<string, any>;
  performance: Record<string, any>;
  notifications: Record<string, any>;
  integrations: Record<string, any>;
  compliance: Record<string, any>;
  _metadata?: {
    settingCount: number;
    lastUpdated: string;
    version: string;
  };
}

export function ComprehensiveAdminPanel() {
  const [selectedSection, setSelectedSection] = useState("system");
  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch comprehensive configuration
  const { data: config, isLoading } = useQuery({
    queryKey: ["/api/admin/comprehensive-config"],
    refetchInterval: 5000,
  }) as { data: ComprehensiveConfig; isLoading: boolean };

  // Fetch configuration statistics
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/comprehensive-config/stats"],
    refetchInterval: 10000,
  });

  // Search settings
  const { data: searchResults } = useQuery({
    queryKey: ["/api/admin/comprehensive-config/search", { q: searchQuery }],
    enabled: searchQuery.length > 2,
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ section, key, value }: { section: string; key: string; value: any }) => {
      return apiRequest("PUT", `/api/admin/comprehensive-config/${section}/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comprehensive-config"] });
      toast({ title: "Setting updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update setting", variant: "destructive" });
    },
  });

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async ({ section, updates }: { section: string; updates: Record<string, any> }) => {
      return apiRequest("PUT", `/api/admin/comprehensive-config/${section}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comprehensive-config"] });
      toast({ title: "Section updated successfully" });
      setPendingChanges({});
    },
    onError: () => {
      toast({ title: "Failed to update section", variant: "destructive" });
    },
  });

  // Reset section mutation
  const resetSectionMutation = useMutation({
    mutationFn: async (section: string) => {
      return apiRequest("POST", `/api/admin/comprehensive-config/${section}/reset`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comprehensive-config"] });
      toast({ title: "Section reset to defaults" });
      setPendingChanges({});
    },
    onError: () => {
      toast({ title: "Failed to reset section", variant: "destructive" });
    },
  });

  // Export configuration
  const exportConfig = async () => {
    try {
      const response = await fetch('/api/admin/comprehensive-config/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'waides-ki-config.json';
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Configuration exported successfully" });
    } catch (error) {
      toast({ title: "Failed to export configuration", variant: "destructive" });
    }
  };

  const renderSettingControl = (section: string, key: string, value: any, type?: string) => {
    const currentValue = pendingChanges[`${section}.${key}`] !== undefined 
      ? pendingChanges[`${section}.${key}`] 
      : value;

    const updateValue = (newValue: any) => {
      if (editMode) {
        setPendingChanges(prev => ({ ...prev, [`${section}.${key}`]: newValue }));
      } else {
        updateSettingMutation.mutate({ section, key, value: newValue });
      }
    };

    // Determine control type based on value type or explicit type
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={currentValue}
            onCheckedChange={updateValue}
            className="data-[state=checked]:bg-blue-600"
          />
          <Label>{currentValue ? 'Enabled' : 'Disabled'}</Label>
        </div>
      );
    }

    if (typeof value === 'number') {
      // Check if it's a percentage or ratio (0-1)
      if (key.includes('percentage') || key.includes('rate') || key.includes('threshold') || 
          (value >= 0 && value <= 1 && key.includes('ratio'))) {
        const isPercentage = key.includes('percentage') || value > 1;
        const max = isPercentage ? 100 : 1;
        const step = isPercentage ? 1 : 0.01;
        
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Slider
                value={[currentValue]}
                onValueChange={(vals) => updateValue(vals[0])}
                max={max}
                step={step}
                className="flex-1"
              />
              <span className="text-sm font-mono w-16 text-right">
                {isPercentage ? `${currentValue}%` : currentValue.toFixed(2)}
              </span>
            </div>
          </div>
        );
      }
      
      // Regular number input
      return (
        <Input
          type="number"
          value={currentValue}
          onChange={(e) => updateValue(Number(e.target.value))}
          className="w-32"
        />
      );
    }

    if (Array.isArray(value)) {
      return (
        <Textarea
          value={JSON.stringify(currentValue, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              updateValue(parsed);
            } catch (err) {
              // Handle JSON parsing error
            }
          }}
          className="font-mono text-xs"
          rows={3}
        />
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <Textarea
          value={JSON.stringify(currentValue, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              updateValue(parsed);
            } catch (err) {
              // Handle JSON parsing error
            }
          }}
          className="font-mono text-xs"
          rows={4}
        />
      );
    }

    // String values - check for predefined options
    const predefinedOptions = getPredefinedOptions(key);
    if (predefinedOptions.length > 0) {
      return (
        <Select value={currentValue} onValueChange={updateValue}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {predefinedOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Default string input
    return (
      <Input
        value={currentValue}
        onChange={(e) => updateValue(e.target.value)}
        className="w-64"
      />
    );
  };

  const getPredefinedOptions = (key: string): string[] => {
    const optionsMap: Record<string, string[]> = {
      log_level: ["debug", "info", "warn", "error"],
      log_format: ["json", "text", "structured"],
      cache_strategy: ["lru", "fifo", "lfu", "ttl"],
      trading_mode: ["conservative", "moderate", "aggressive", "expert"],
      risk_level: ["low", "moderate", "high", "extreme"],
      position_sizing: ["fixed", "kelly_criterion", "volatility_adjusted", "risk_parity"],
      intelligence_level: ["basic", "intermediate", "advanced", "expert"],
      personality_mode: ["conservative", "balanced", "aggressive", "mystical"],
      theme: ["dark", "light", "cosmic", "matrix"],
      encryption_algorithm: ["AES-256-GCM", "AES-256-CBC", "ChaCha20-Poly1305"],
      ssl_version: ["TLSv1.2", "TLSv1.3"],
      regulatory_framework: ["us_cftc", "eu_mifid", "uk_fca", "sg_mas"],
      jurisdiction: ["united_states", "european_union", "united_kingdom", "singapore"],
    };
    
    return optionsMap[key] || [];
  };

  const saveAllChanges = () => {
    if (Object.keys(pendingChanges).length === 0) {
      toast({ title: "No changes to save" });
      return;
    }

    // Group changes by section
    const changesBySection: Record<string, Record<string, any>> = {};
    Object.entries(pendingChanges).forEach(([path, value]) => {
      const [section, key] = path.split('.');
      if (!changesBySection[section]) {
        changesBySection[section] = {};
      }
      changesBySection[section][key] = value;
    });

    // Save each section
    Object.entries(changesBySection).forEach(([section, updates]) => {
      updateSectionMutation.mutate({ section, updates });
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const sections = [
    { key: "system", label: "System", count: config?.system ? Object.keys(config.system).length : 0 },
    { key: "trading", label: "Trading", count: config?.trading ? Object.keys(config.trading).length : 0 },
    { key: "wallet", label: "Wallet", count: config?.wallet ? Object.keys(config.wallet).length : 0 },
    { key: "security", label: "Security", count: config?.security ? Object.keys(config.security).length : 0 },
    { key: "konsai", label: "KonsAi", count: config?.konsai ? Object.keys(config.konsai).length : 0 },
    { key: "ui", label: "Interface", count: config?.ui ? Object.keys(config.ui).length : 0 },
    { key: "performance", label: "Performance", count: config?.performance ? Object.keys(config.performance).length : 0 },
    { key: "notifications", label: "Notifications", count: config?.notifications ? Object.keys(config.notifications).length : 0 },
    { key: "integrations", label: "Integrations", count: config?.integrations ? Object.keys(config.integrations).length : 0 },
    { key: "compliance", label: "Compliance", count: config?.compliance ? Object.keys(config.compliance).length : 0 },
  ];

  const currentSection = config?.[selectedSection as keyof ComprehensiveConfig] as Record<string, any>;
  const pendingChangesCount = Object.keys(pendingChanges).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Comprehensive Admin Configuration
                <Badge variant="secondary">{config?._metadata?.settingCount || 0}+ Settings</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete manual control over all application settings and configurations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={editMode ? "default" : "outline"}
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {editMode ? "Live Mode" : "Edit Mode"}
              </Button>
              <Button variant="outline" size="sm" onClick={exportConfig}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Switch
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
            />
            <Label>Show Advanced</Label>
          </div>

          {pendingChangesCount > 0 && editMode && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{pendingChangesCount} pending changes</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveAllChanges}>
                    <Save className="h-4 w-4 mr-1" />
                    Save All
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setPendingChanges({})}
                  >
                    Cancel
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery.length > 2 && searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>
              Search Results ({searchResults.count} found)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {searchResults.results.map((result: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{result.section}.{result.key}</div>
                      <div className="text-sm text-muted-foreground">
                        Current value: {JSON.stringify(result.value)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSection(result.section)}
                    >
                      Go to Section
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Main Configuration Interface */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={selectedSection} onValueChange={setSelectedSection}>
            <div className="border-b">
              <TabsList className="h-auto p-1 bg-transparent">
                <ScrollArea className="w-full">
                  <div className="flex">
                    {sections.map((section) => (
                      <TabsTrigger
                        key={section.key}
                        value={section.key}
                        className="flex-shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {section.label}
                        <Badge variant="secondary" className="ml-2">
                          {section.count}
                        </Badge>
                      </TabsTrigger>
                    ))}
                  </div>
                </ScrollArea>
              </TabsList>
            </div>

            {sections.map((section) => (
              <TabsContent key={section.key} value={section.key} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">{section.label} Configuration</h3>
                    <p className="text-sm text-muted-foreground">
                      {section.count} settings in this section
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resetSectionMutation.mutate(section.key)}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset to Defaults
                  </Button>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {currentSection && Object.entries(currentSection).map(([key, value]) => {
                      // Skip advanced settings if not showing advanced
                      if (!showAdvanced && isAdvancedSetting(key)) return null;

                      const isChanged = pendingChanges[`${section.key}.${key}`] !== undefined;

                      return (
                        <div
                          key={key}
                          className={`p-4 border rounded-lg ${isChanged ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : ''}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                              <div className="flex items-center gap-2">
                                <Label className="font-medium">{formatSettingName(key)}</Label>
                                {isChanged && <Badge variant="outline">Changed</Badge>}
                                {isAdvancedSetting(key) && <Badge variant="secondary">Advanced</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {getSettingDescription(key)}
                              </p>
                              <p className="text-xs font-mono text-muted-foreground">
                                {section.key}.{key}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              {renderSettingControl(section.key, key, value)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Configuration Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalSettings}</div>
                <div className="text-sm text-muted-foreground">Total Settings</div>
              </div>
              {Object.entries(stats.sectionBreakdown).map(([section, count]) => (
                <div key={section} className="text-center">
                  <div className="text-2xl font-bold">{count as number}</div>
                  <div className="text-sm text-muted-foreground capitalize">{section}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatSettingName(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isAdvancedSetting(key: string): boolean {
  const advancedKeywords = [
    'timeout', 'threshold', 'pool', 'cipher', 'encryption', 'compression',
    'heartbeat', 'retry', 'validation', 'monitoring', 'profiling'
  ];
  return advancedKeywords.some(keyword => key.includes(keyword));
}

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    maintenance_mode: "Enable to put the system in maintenance mode",
    debug_logging: "Enable detailed debug logging for troubleshooting",
    rate_limiting: "Enable API rate limiting protection",
    auto_trading_enabled: "Allow autonomous trading operations",
    max_position_size: "Maximum allowed position size per trade",
    risk_level: "Overall risk tolerance level for the system",
    two_factor_auth_required: "Require 2FA for all user authentication",
    intelligence_level: "KonsAi processing complexity level",
    dark_mode_enabled: "Enable dark theme by default",
    notification_system_enabled: "Enable system-wide notifications",
  };
  
  return descriptions[key] || "Configuration setting for " + formatSettingName(key).toLowerCase();
}

export default ComprehensiveAdminPanel;