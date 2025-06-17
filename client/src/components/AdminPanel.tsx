import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Save, Key, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [apiKeys, setApiKeys] = useState({
    coingecko: '',
    cryptopanic: '',
    tradingview: '',
    twitter: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveApiKeysMutation = useMutation({
    mutationFn: async (keys: Record<string, string>) => {
      const response = await apiRequest('POST', '/api/admin/keys', keys);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `API keys saved successfully. ${data.saved} keys updated.`,
      });
      onClose();
      // Invalidate queries to refresh data with new API keys
      queryClient.invalidateQueries({ queryKey: ['/api/eth'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save API keys",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (service: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [service]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKeysMutation.mutate(apiKeys);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="waides-card rounded-xl p-6 waides-border border max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold waides-text-primary flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Admin Panel
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="waides-text-secondary hover:waides-text-primary"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs waides-text-secondary">
              <strong className="text-yellow-500">Security Notice:</strong> API keys are stored in memory only. 
              They will be lost when the application restarts.
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="coingecko" className="text-sm font-medium waides-text-secondary">
              CoinGecko API Key
            </Label>
            <Input
              id="coingecko"
              type="password"
              value={apiKeys.coingecko}
              onChange={(e) => handleInputChange('coingecko', e.target.value)}
              className="mt-1 waides-bg waides-border waides-text-primary placeholder:waides-text-secondary focus:border-green-500"
              placeholder="Enter API key..."
            />
          </div>
          
          <div>
            <Label htmlFor="cryptopanic" className="text-sm font-medium waides-text-secondary">
              CryptoPanic API Key
            </Label>
            <Input
              id="cryptopanic"
              type="password"
              value={apiKeys.cryptopanic}
              onChange={(e) => handleInputChange('cryptopanic', e.target.value)}
              className="mt-1 waides-bg waides-border waides-text-primary placeholder:waides-text-secondary focus:border-green-500"
              placeholder="Enter API key..."
            />
          </div>
          
          <div>
            <Label htmlFor="tradingview" className="text-sm font-medium waides-text-secondary">
              TradingView API Key
            </Label>
            <Input
              id="tradingview"
              type="password"
              value={apiKeys.tradingview}
              onChange={(e) => handleInputChange('tradingview', e.target.value)}
              className="mt-1 waides-bg waides-border waides-text-primary placeholder:waides-text-secondary focus:border-green-500"
              placeholder="Enter API key..."
            />
          </div>
          
          <div>
            <Label htmlFor="twitter" className="text-sm font-medium waides-text-secondary">
              Twitter API Key
            </Label>
            <Input
              id="twitter"
              type="password"
              value={apiKeys.twitter}
              onChange={(e) => handleInputChange('twitter', e.target.value)}
              className="mt-1 waides-bg waides-border waides-text-primary placeholder:waides-text-secondary focus:border-green-500"
              placeholder="Enter API key..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={saveApiKeysMutation.isPending}
              className="flex-1 bg-green-500 text-black font-medium hover:bg-green-600 transition-colors"
            >
              {saveApiKeysMutation.isPending ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Keys
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 waides-bg waides-text-secondary hover:waides-text-primary waides-border"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
