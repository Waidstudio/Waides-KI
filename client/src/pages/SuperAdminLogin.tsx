import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Lock, 
  AlertTriangle,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

function SuperAdminLogin() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmationCode: '',
  });
  const [step, setStep] = useState<'credentials' | 'verification'>('credentials');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiRequest('POST', '/api/admin/super/verify', {
        email: formData.email,
        password: formData.password,
      });

      const result = await response.json();
      
      if (result.success) {
        setStep('verification');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await apiRequest('POST', '/api/admin/super/login', {
        email: formData.email,
        password: formData.password,
        confirmationCode: formData.confirmationCode,
      });

      const result = await response.json();
      
      if (result.success) {
        // Store super admin session
        localStorage.setItem('superAdminToken', result.token);
        localStorage.setItem('superAdminUser', JSON.stringify(result.admin));
        
        // Redirect to super admin dashboard
        setLocation('/super-admin-dashboard');
      } else {
        setError(result.message || 'Verification failed');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-red-500/20 rounded-full">
              <Crown className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-red-400">Super Admin Portal</h1>
          <p className="text-slate-400">Ultimate System Control Access</p>
        </div>

        {/* Security Warning */}
        <Card className="bg-gradient-to-r from-red-950/50 to-orange-950/50 border-red-800/30">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-red-400 font-medium mb-1">High Security Zone</p>
                <p className="text-slate-300 text-xs">
                  This portal provides complete system control. All actions are logged and monitored.
                  Unauthorized access attempts will be reported.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-slate-100 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-400" />
              {step === 'credentials' ? 'Super Admin Login' : 'Security Verification'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {step === 'credentials' 
                ? 'Enter your super administrator credentials'
                : 'Complete two-factor authentication'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'credentials' ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Demo Credentials */}
                <div className="bg-red-950/30 border border-red-800/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-red-400 font-medium mb-2">Demo Super Admin:</p>
                      <div className="space-y-1 text-slate-300 font-mono text-xs">
                        <p>Email: superadmin@waideski.com</p>
                        <p>Password: SuperAdmin123!@#</p>
                        <p className="text-yellow-400 mt-2">⚠️ Change these in production</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">Super Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    placeholder="Enter super admin email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">Master Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    placeholder="Enter master password"
                    required
                  />
                </div>

                {error && (
                  <Alert className="bg-red-950/50 border-red-800/30">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {isSubmitting ? 'Verifying...' : 'Proceed to Verification'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div className="bg-green-950/30 border border-green-800/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-green-400 font-medium mb-1">Credentials Verified</p>
                      <p className="text-slate-300 text-xs">
                        For demo purposes, use confirmation code: <span className="font-mono">SUPER2024</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmationCode" className="text-slate-300">
                    Two-Factor Authentication Code
                  </Label>
                  <Input
                    id="confirmationCode"
                    type="text"
                    value={formData.confirmationCode}
                    onChange={(e) => handleInputChange('confirmationCode', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-slate-100 text-center font-mono text-lg"
                    placeholder="Enter 6-digit code"
                    maxLength={10}
                    required
                  />
                </div>

                {error && (
                  <Alert className="bg-red-950/50 border-red-800/30">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isSubmitting ? 'Authenticating...' : 'Access Super Admin'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('credentials')}
                    className="w-full border-slate-600 text-slate-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Credentials
                  </Button>
                </div>
              </form>
            )}

            <div className="text-center pt-6 border-t border-slate-700 mt-6">
              <p className="text-slate-400 text-sm">
                Need regular admin access?{' '}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setLocation('/admin-login')}
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                >
                  Admin Portal
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SuperAdminLogin;