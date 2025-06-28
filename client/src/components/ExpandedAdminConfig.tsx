import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Search, 
  Save, 
  RefreshCw, 
  Download, 
  Upload, 
  Database,
  Server,
  Shield,
  Brain,
  TrendingUp,
  Wifi,
  Users,
  Globe,
  Blocks,
  BarChart3
} from 'lucide-react';

interface ExpandedConfig {
  system: Record<string, any>;
  analytics: Record<string, any>;
  infrastructure: Record<string, any>;
  advanced_security: Record<string, any>;
  ai_advanced: Record<string, any>;
  trading_advanced: Record<string, any>;
  database_advanced: Record<string, any>;
  api_management: Record<string, any>;
  user_experience: Record<string, any>;
  content_management: Record<string, any>;
  blockchain: Record<string, any>;
}

interface ConfigStats {
  totalSettings: number;
  sections: number;
  enabledSettings: number;
  sectionBreakdown: Array<{ section: string; count: number }>;
}

export function ExpandedAdminConfig() {
  const [selectedSection, setSelectedSection] = useState('system');
  const [searchQuery, setSearchQuery] = useState('');
  const [localConfig, setLocalConfig] = useState<ExpandedConfig | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch expanded configuration
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['/api/admin/expanded-config'],
    refetchInterval: 10000,
  });

  // Fetch configuration statistics
  const { data: stats } = useQuery<ConfigStats>({
    queryKey: ['/api/admin/expanded-config/stats'],
    refetchInterval: 15000,
  });

  // Fetch search results
  const { data: searchResults } = useQuery({
    queryKey: ['/api/admin/expanded-config/search', searchQuery],
    enabled: searchQuery.length >= 2,
  });

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ section, key, value }: { section: string; key: string; value: any }) => {
      return apiRequest('PUT', `/api/admin/expanded-config/${section}/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/expanded-config'] });
      toast({ title: "Setting updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update setting", variant: "destructive" });
    },
  });

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async ({ section, updates }: { section: string; updates: any }) => {
      return apiRequest('PUT', `/api/admin/expanded-config/${section}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/expanded-config'] });
      toast({ title: "Section updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update section", variant: "destructive" });
    },
  });

  // Reset section mutation
  const resetSectionMutation = useMutation({
    mutationFn: async (section: string) => {
      return apiRequest('POST', `/api/admin/expanded-config/${section}/reset`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/expanded-config'] });
      toast({ title: "Section reset to defaults" });
    },
    onError: () => {
      toast({ title: "Failed to reset section", variant: "destructive" });
    },
  });

  // Export configuration
  const exportConfig = async () => {
    try {
      const response = await fetch('/api/admin/expanded-config/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'waides-ki-expanded-config.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Configuration exported successfully" });
    } catch (error) {
      toast({ title: "Failed to export configuration", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const handleSettingChange = (section: string, key: string, value: any) => {
    if (localConfig) {
      setLocalConfig({
        ...localConfig,
        [section]: {
          ...localConfig[section],
          [key]: value
        }
      });
    }
    updateSettingMutation.mutate({ section, key, value });
  };

  const renderSettingControl = (section: string, key: string, value: any, type?: string) => {
    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={value}
            onCheckedChange={(checked) => handleSettingChange(section, key, checked)}
          />
          <Label className="text-sm font-medium">{value ? 'Enabled' : 'Disabled'}</Label>
        </div>
      );
    }

    if (typeof value === 'number') {
      if (key.includes('percentage') || key.includes('rate') || key.includes('threshold')) {
        return (
          <div className="space-y-2">
            <Slider
              value={[value]}
              onValueChange={([newValue]) => handleSettingChange(section, key, newValue)}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="text-sm text-gray-500">{value}%</div>
          </div>
        );
      }
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => handleSettingChange(section, key, parseInt(e.target.value) || 0)}
          className="w-full"
        />
      );
    }

    if (Array.isArray(value)) {
      return (
        <Input
          value={value.join(', ')}
          onChange={(e) => handleSettingChange(section, key, e.target.value.split(', ').filter(Boolean))}
          placeholder="Comma-separated values"
          className="w-full"
        />
      );
    }

    if (typeof value === 'string') {
      // Handle select options for common string types
      if (key.includes('level') || key.includes('mode') || key.includes('strategy')) {
        const options = getSelectOptions(key);
        if (options.length > 0) {
          return (
            <Select value={value} onValueChange={(newValue) => handleSettingChange(section, key, newValue)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
      }
      return (
        <Input
          value={value}
          onChange={(e) => handleSettingChange(section, key, e.target.value)}
          className="w-full"
        />
      );
    }

    return (
      <Input
        value={String(value)}
        onChange={(e) => handleSettingChange(section, key, e.target.value)}
        className="w-full"
      />
    );
  };

  const getSelectOptions = (key: string): string[] => {
    const optionMap: Record<string, string[]> = {
      log_level: ['debug', 'info', 'warn', 'error'],
      cache_strategy: ['LRU', 'LFU', 'FIFO', 'TTL'],
      ssl_version: ['TLSv1.2', 'TLSv1.3'],
      neural_network_architecture: ['transformer', 'cnn', 'rnn', 'lstm', 'gru'],
      consensus_mechanism: ['proof_of_work', 'proof_of_stake', 'delegated_proof_of_stake'],
      database_type: ['postgresql', 'mysql', 'mongodb', 'redis'],
      cloud_provider: ['aws', 'gcp', 'azure', 'digitalocean'],
    };
    
    for (const [pattern, options] of Object.entries(optionMap)) {
      if (key.includes(pattern)) {
        return options;
      }
    }
    return [];
  };

  const getSectionIcon = (section: string) => {
    const iconMap: Record<string, any> = {
      system: Server,
      analytics: BarChart3,
      infrastructure: Database,
      advanced_security: Shield,
      ai_advanced: Brain,
      trading_advanced: TrendingUp,
      database_advanced: Database,
      api_management: Wifi,
      user_experience: Users,
      content_management: Globe,
      blockchain: Blocks,
    };
    const Icon = iconMap[section] || Settings;
    return <Icon className="h-4 w-4" />;
  };

  const formatSectionName = (section: string): string => {
    return section
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (configLoading || !localConfig) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const sections = Object.keys(localConfig);
  const currentSectionData = localConfig[selectedSection] || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expanded Admin Configuration</h1>
          <p className="text-gray-600">Manual control over 1000+ application settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportConfig}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/expanded-config'] })}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalSettings}</div>
              <div className="text-sm text-gray-600">Total Settings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.sections}</div>
              <div className="text-sm text-gray-600">Configuration Sections</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.enabledSettings}</div>
              <div className="text-sm text-gray-600">Enabled Settings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {Math.round((stats.enabledSettings / stats.totalSettings) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Configuration Density</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchResults && searchQuery.length >= 2 && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">
                Found {searchResults.count} results
              </div>
              <ScrollArea className="h-32">
                {searchResults.results?.map((result: any, index: number) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => setSelectedSection(result.section)}
                  >
                    <div className="font-medium">{result.path}</div>
                    <div className="text-sm text-gray-600">{String(result.value)}</div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Selector */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuration Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section}>
                    <Button
                      variant={selectedSection === section ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedSection(section)}
                    >
                      {getSectionIcon(section)}
                      <span className="ml-2">{formatSectionName(section)}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {Object.keys(localConfig[section] || {}).length}
                      </Badge>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Settings Panel */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  {getSectionIcon(selectedSection)}
                  <span className="ml-2">{formatSectionName(selectedSection)}</span>
                </CardTitle>
                <CardDescription>
                  {Object.keys(currentSectionData).length} settings in this section
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSectionMutation.mutate({ section: selectedSection, updates: currentSectionData })}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Section
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resetSectionMutation.mutate(selectedSection)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-6">
                {Object.entries(currentSectionData).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {typeof value}
                      </Badge>
                    </div>
                    {renderSettingControl(selectedSection, key, value)}
                    <Separator className="my-4" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Section Breakdown */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Section Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.sectionBreakdown.map((item) => (
                <div
                  key={item.section}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedSection(item.section)}
                >
                  <div className="flex items-center space-x-2">
                    {getSectionIcon(item.section)}
                    <span className="text-sm font-medium">
                      {formatSectionName(item.section)}
                    </span>
                  </div>
                  <div className="text-lg font-bold mt-1">{item.count}</div>
                  <div className="text-xs text-gray-600">settings</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}