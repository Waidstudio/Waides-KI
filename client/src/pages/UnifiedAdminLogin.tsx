import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Settings, 
  TrendingUp, 
  Headphones, 
  Eye,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AdminLevel {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  permissions: string[];
  dashboardRoute: string;
}

const getAdminIcon = (iconName: string) => {
  const icons = {
    Settings,
    TrendingUp,
    Headphones,
    Eye
  };
  return icons[iconName as keyof typeof icons] || Shield;
};

const getColorClasses = (color: string) => {
  const colorMap = {
    purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    gray: 'bg-gray-500/20 border-gray-500/30 text-gray-400'
  };
  return colorMap[color as keyof typeof colorMap] || 'bg-blue-500/20 border-blue-500/30 text-blue-400';
};

function UnifiedAdminLogin() {
  const [, setLocation] = useLocation();
  const [adminLevels, setAdminLevels] = useState<AdminLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(true);

  useEffect(() => {
    // Fetch available admin levels
    const fetchAdminLevels = async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/levels');
        const data = await response.json();
        setAdminLevels(data.levels || []);
      } catch (error) {
        console.error('Failed to fetch admin levels:', error);
      }
    };

    fetchAdminLevels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLevel) {
      setError('Please select an admin level');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiRequest('POST', '/api/admin/login', {
        email: formData.email,
        password: formData.password,
        level: selectedLevel
      });

      const result = await response.json();
      
      if (result.success) {
        // Store admin session
        localStorage.setItem('adminToken', result.token);
        localStorage.setItem('adminLevel', result.admin.level);
        localStorage.setItem('adminUser', JSON.stringify(result.admin));
        
        // Redirect to appropriate dashboard
        setLocation(result.admin.dashboardRoute);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const selectedLevelData = adminLevels.find(level => level.id === selectedLevel);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="h-10 w-10 text-blue-500" />
            <h1 className="text-4xl font-bold text-slate-100">Waides KI Admin Portal</h1>
          </div>
          <p className="text-slate-400 text-lg">Unified Administrative Access System</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Level Selection */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                Select Admin Level
              </CardTitle>
              <CardDescription className="text-slate-400">
                Choose your administrative access level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {adminLevels.map((level) => {
                const IconComponent = getAdminIcon(level.icon);
                const isSelected = selectedLevel === level.id;
                
                return (
                  <div
                    key={level.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                    }`}
                    onClick={() => setSelectedLevel(level.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getColorClasses(level.color)}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-slate-100 font-medium">{level.name}</h3>
                          <p className="text-slate-400 text-sm">{level.description}</p>
                        </div>
                      </div>
                      {isSelected && <ChevronRight className="w-5 h-5 text-blue-500" />}
                    </div>
                    
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <p className="text-xs text-slate-500 mb-2">Permissions:</p>
                        <div className="flex flex-wrap gap-1">
                          {level.permissions.slice(0, 3).map((permission) => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                          {level.permissions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{level.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Login Form */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" />
                Admin Credentials
              </CardTitle>
              <CardDescription className="text-slate-400">
                {selectedLevelData 
                  ? `Login as ${selectedLevelData.name}` 
                  : 'Select an admin level first'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedLevel ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">Please select an admin level to continue</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Demo Credentials Info */}
                  {showCredentials && (
                    <div className="bg-blue-950/50 border border-blue-800/30 rounded-lg p-4 mb-6">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="text-blue-400 font-medium mb-2">Demo Credentials:</p>
                          <div className="space-y-1 text-slate-300">
                            <p>System: system@waideski.com / SystemAdmin123!</p>
                            <p>Trading: trading@waideski.com / TradingAdmin123!</p>
                            <p>Support: support@waideski.com / SupportAdmin123!</p>
                            <p>Viewer: viewer@waideski.com / ViewerAdmin123!</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCredentials(false)}
                            className="mt-2 text-blue-400 hover:text-blue-300"
                          >
                            Hide Credentials
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selected Level Display */}
                  {selectedLevelData && (
                    <div className={`p-3 rounded-lg border ${getColorClasses(selectedLevelData.color)}`}>
                      <div className="flex items-center space-x-2">
                        {React.createElement(getAdminIcon(selectedLevelData.icon), { className: "w-4 h-4" })}
                        <span className="font-medium">{selectedLevelData.name}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                      placeholder="Enter admin email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                      placeholder="Enter admin password"
                      required
                    />
                  </div>

                  {error && (
                    <Alert className="bg-red-950/50 border-red-800/30">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-400">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting || !selectedLevel}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? 'Authenticating...' : `Login as ${selectedLevelData?.name || 'Admin'}`}
                  </Button>

                  <div className="text-center pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-sm">
                      Need user access?{' '}
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => setLocation('/login')}
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                      >
                        User Login
                      </Button>
                    </p>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
}

export default UnifiedAdminLogin;