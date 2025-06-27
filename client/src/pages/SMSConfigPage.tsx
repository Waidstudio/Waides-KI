import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { MessageSquare, Phone, TestTube, Send, Shield, CheckCircle, XCircle, Settings } from 'lucide-react';

interface SMSStatus {
  configured: boolean;
  phoneNumber?: string;
  enabled: boolean;
}

interface SMSResponse {
  success: boolean;
  message: string;
  details?: any;
}

export default function SMSConfigPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SMS status
  const { data: smsStatus, isLoading: statusLoading } = useQuery<{ success: boolean; sms: SMSStatus }>({
    queryKey: ['/api/sms/status'],
    refetchInterval: 5000
  });

  // Fetch Smart Notify configuration
  const { data: notifyConfig } = useQuery<{ success: boolean; config: any }>({
    queryKey: ['/api/smart-notify/config']
  });

  // Configure SMS mutation
  const configureSMS = useMutation({
    mutationFn: async (phoneNumber: string) => {
      return apiRequest('/api/sms/configure', {
        method: 'POST',
        body: { phoneNumber }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "SMS Configured",
        description: data.message || "SMS notifications have been configured successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sms/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/smart-notify/config'] });
    },
    onError: (error: any) => {
      toast({
        title: "Configuration Failed",
        description: error.message || "Failed to configure SMS notifications",
        variant: "destructive",
      });
    }
  });

  // Test SMS mutation
  const testSMS = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/sms/test', { method: 'POST' });
    },
    onSuccess: (data: SMSResponse) => {
      toast({
        title: data.success ? "Test SMS Sent" : "Test Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test SMS",
        variant: "destructive",
      });
    }
  });

  // Send custom SMS mutation
  const sendCustomSMS = useMutation({
    mutationFn: async ({ message, title }: { message: string; title?: string }) => {
      return apiRequest('/api/sms/send', {
        method: 'POST',
        body: { message, title }
      });
    },
    onSuccess: (data: SMSResponse) => {
      toast({
        title: data.success ? "SMS Sent" : "Send Failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });
      if (data.success) {
        setCustomMessage('');
        setCustomTitle('');
      }
    },
    onError: (error: any) => {
      toast({
        title: "Send Failed",
        description: error.message || "Failed to send SMS",
        variant: "destructive",
      });
    }
  });

  // Disable SMS mutation
  const disableSMS = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/sms/disable', { method: 'POST' });
    },
    onSuccess: (data) => {
      toast({
        title: "SMS Disabled",
        description: data.message || "SMS notifications have been disabled",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sms/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/smart-notify/config'] });
    },
    onError: (error: any) => {
      toast({
        title: "Disable Failed",
        description: error.message || "Failed to disable SMS notifications",
        variant: "destructive",
      });
    }
  });

  // Initialize phone number from status
  useEffect(() => {
    if (smsStatus?.sms?.phoneNumber && !phoneNumber) {
      setPhoneNumber(smsStatus.sms.phoneNumber);
    }
  }, [smsStatus, phoneNumber]);

  const handleConfigure = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    configureSMS.mutate(phoneNumber);
  };

  const handleTest = () => {
    testSMS.mutate();
  };

  const handleSendCustom = () => {
    if (!customMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send",
        variant: "destructive",
      });
      return;
    }
    sendCustomSMS.mutate({
      message: customMessage,
      title: customTitle || undefined
    });
  };

  const handleDisable = () => {
    disableSMS.mutate();
  };

  if (statusLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const sms = smsStatus?.sms;
  const isConfigured = sms?.configured || false;
  const isEnabled = sms?.enabled || false;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          SMS Notifications
        </h1>
        <p className="text-muted-foreground">
          Configure SMS alerts for critical trading notifications and market updates
        </p>
      </div>

      {/* Status Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            SMS Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={isConfigured ? "default" : "secondary"}>
                {isConfigured ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {isConfigured ? "Configured" : "Not Configured"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isEnabled ? "default" : "secondary"}>
                {isEnabled ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {sms?.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono">{sms.phoneNumber}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Configuration
            </CardTitle>
            <CardDescription>
              Set up your phone number to receive SMS notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use E.164 format (e.g., +1234567890)
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleConfigure}
                disabled={configureSMS.isPending || !phoneNumber.trim()}
                className="w-full"
              >
                {configureSMS.isPending ? "Configuring..." : "Configure SMS"}
              </Button>

              {isConfigured && (
                <Button 
                  variant="outline"
                  onClick={handleDisable}
                  disabled={disableSMS.isPending}
                  className="w-full"
                >
                  {disableSMS.isPending ? "Disabling..." : "Disable SMS"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test SMS
            </CardTitle>
            <CardDescription>
              Send a test message to verify SMS configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleTest}
              disabled={testSMS.isPending || !isConfigured}
              className="w-full"
              variant="outline"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {testSMS.isPending ? "Sending Test..." : "Send Test SMS"}
            </Button>
            
            {!isConfigured && (
              <p className="text-xs text-muted-foreground mt-2">
                Configure SMS first to enable testing
              </p>
            )}
          </CardContent>
        </Card>

        {/* Custom Message */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Custom Message
            </CardTitle>
            <CardDescription>
              Send a custom SMS message to your configured number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customTitle">Title (Optional)</Label>
              <Input
                id="customTitle"
                placeholder="Message title..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="customMessage">Message</Label>
              <textarea
                id="customMessage"
                placeholder="Enter your message here..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full mt-1 p-3 border rounded-md min-h-[100px] resize-y"
                maxLength={1600}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customMessage.length}/1600 characters
              </p>
            </div>

            <Button 
              onClick={handleSendCustom}
              disabled={sendCustomSMS.isPending || !isConfigured || !customMessage.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {sendCustomSMS.isPending ? "Sending..." : "Send Message"}
            </Button>
            
            {!isConfigured && (
              <p className="text-xs text-muted-foreground">
                Configure SMS first to enable custom messages
              </p>
            )}
          </CardContent>
        </Card>

        {/* Alert Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              SMS Alert Configuration
            </CardTitle>
            <CardDescription>
              SMS notifications are automatically sent for high and critical trading alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">When SMS Alerts Are Sent:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• High severity trading alerts</li>
                  <li>• Critical market warnings</li>
                  <li>• Risk management notifications</li>
                  <li>• Significant wallet warnings</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">SMS Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Secure Twilio integration</li>
                  <li>• Message truncation (1600 chars)</li>
                  <li>• Cooldown periods prevent spam</li>
                  <li>• Action indicators included</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}