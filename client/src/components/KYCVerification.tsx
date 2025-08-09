import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  MapPin,
  Calendar,
  Camera,
  CreditCard,
  AlertTriangle,
  Zap,
  Eye,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

interface KYCDocument {
  id: string;
  type: 'government_id' | 'passport' | 'drivers_license' | 'proof_of_address' | 'utility_bill';
  status: 'pending' | 'uploaded' | 'reviewing' | 'verified' | 'rejected';
  fileName?: string;
  uploadDate?: string;
  verificationDate?: string;
  aiVerificationScore?: number;
  konsaiValidation?: boolean;
}

interface KYCStatus {
  overall: 'not_started' | 'in_progress' | 'under_review' | 'verified' | 'rejected';
  completionPercentage: number;
  documents: KYCDocument[];
  personalInfo: {
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    nationality?: string;
    phoneNumber?: string;
  };
  riskScore: number;
  kycLevel: 'basic' | 'intermediate' | 'advanced';
  lastUpdated: string;
}

export const KYCVerification: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch KYC status
  const { data: kycStatus, isLoading } = useQuery<KYCStatus>({
    queryKey: ['/api/kyc/status'],
    refetchInterval: 5000 // Real-time updates
  });

  // Personal information form state
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    dateOfBirth: '',
    address: '',
    nationality: '',
    phoneNumber: ''
  });

  // Document upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/kyc/upload-document', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Document upload failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Document Uploaded Successfully",
        description: "Your document is being processed by our AI verification system",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/kyc/status'] });
      setUploading(false);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive"
      });
      setUploading(false);
    }
  });

  // Personal info submission mutation
  const submitPersonalInfoMutation = useMutation({
    mutationFn: async (info: any) => {
      return apiRequest('/api/kyc/personal-info', {
        method: 'POST',
        body: JSON.stringify(info)
      });
    },
    onSuccess: () => {
      toast({
        title: "Personal Information Saved",
        description: "Your information has been securely stored and is being verified",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/kyc/status'] });
      setActiveStep(2);
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to save personal information",
        variant: "destructive"
      });
    }
  });

  // KYC verification trigger mutation
  const triggerVerificationMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/kyc/trigger-verification', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Verification Initiated",
        description: "KonsAI is now processing your documents for verification",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/kyc/status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to initiate verification",
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, or PDF file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    uploadDocumentMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400 border-green-400';
      case 'rejected': return 'text-red-400 border-red-400';
      case 'reviewing': case 'under_review': return 'text-yellow-400 border-yellow-400';
      case 'uploaded': case 'in_progress': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'reviewing': case 'under_review': return <Clock className="h-4 w-4" />;
      case 'uploaded': case 'in_progress': return <Upload className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const documentTypes = [
    { type: 'government_id', label: 'Government ID', description: 'National ID Card or State ID' },
    { type: 'passport', label: 'Passport', description: 'International Passport' },
    { type: 'drivers_license', label: 'Driver\'s License', description: 'Valid Driver\'s License' },
    { type: 'proof_of_address', label: 'Proof of Address', description: 'Utility Bill or Bank Statement' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* KYC Status Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-blue-400" />
              <span>KYC Verification Status</span>
            </CardTitle>
            <Badge variant="outline" className={getStatusColor(kycStatus?.overall || 'not_started')}>
              {getStatusIcon(kycStatus?.overall || 'not_started')}
              <span className="ml-1 capitalize">{kycStatus?.overall?.replace('_', ' ') || 'Not Started'}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Completion Progress</span>
            <span className="text-sm font-medium">{kycStatus?.completionPercentage || 0}%</span>
          </div>
          <Progress value={kycStatus?.completionPercentage || 0} className="h-2" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{kycStatus?.riskScore || 0}%</div>
              <div className="text-xs text-slate-400">Risk Score</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-emerald-400 capitalize">{kycStatus?.kycLevel || 'basic'}</div>
              <div className="text-xs text-slate-400">KYC Level</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{kycStatus?.documents?.length || 0}</div>
              <div className="text-xs text-slate-400">Documents</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">
                {kycStatus?.documents?.filter(d => d.status === 'verified').length || 0}
              </div>
              <div className="text-xs text-slate-400">Verified</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center space-x-2 cursor-pointer ${
                  activeStep >= step ? 'text-blue-400' : 'text-slate-500'
                }`}
                onClick={() => setActiveStep(step)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  activeStep >= step ? 'border-blue-400 bg-blue-400/20' : 'border-slate-500'
                }`}>
                  {step}
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {step === 1 ? 'Personal Info' : step === 2 ? 'Documents' : 'Verification'}
                </span>
              </div>
            ))}
          </div>

          {/* Step 1: Personal Information */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-400" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Legal Name</Label>
                  <Input
                    id="fullName"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                    placeholder="Enter your full legal name"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={personalInfo.dateOfBirth}
                    onChange={(e) => setPersonalInfo({...personalInfo, dateOfBirth: e.target.value})}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={personalInfo.phoneNumber}
                    onChange={(e) => setPersonalInfo({...personalInfo, phoneNumber: e.target.value})}
                    placeholder="Enter your phone number"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select onValueChange={(value) => setPersonalInfo({...personalInfo, nationality: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select your nationality" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="ng">Nigeria</SelectItem>
                      <SelectItem value="za">South Africa</SelectItem>
                      <SelectItem value="ke">Kenya</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                  placeholder="Enter your complete address"
                  className="bg-slate-700 border-slate-600"
                  rows={3}
                />
              </div>
              
              <Button
                onClick={() => submitPersonalInfoMutation.mutate(personalInfo)}
                disabled={submitPersonalInfoMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {submitPersonalInfoMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <User className="h-4 w-4 mr-2" />
                )}
                Save Personal Information
              </Button>
            </div>
          )}

          {/* Step 2: Document Upload */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-400" />
                Document Upload
              </h3>
              
              <div className="grid gap-4">
                {documentTypes.map((docType) => {
                  const existingDoc = kycStatus?.documents?.find(d => d.type === docType.type);
                  
                  return (
                    <Card key={docType.type} className="bg-slate-700/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{docType.label}</h4>
                            <p className="text-sm text-slate-400">{docType.description}</p>
                            {existingDoc && (
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline" className={`text-xs ${getStatusColor(existingDoc.status)}`}>
                                  {getStatusIcon(existingDoc.status)}
                                  <span className="ml-1 capitalize">{existingDoc.status}</span>
                                </Badge>
                                {existingDoc.aiVerificationScore && (
                                  <Badge variant="outline" className="text-xs text-purple-400 border-purple-400">
                                    AI Score: {existingDoc.aiVerificationScore}%
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = 'image/*,application/pdf';
                                input.onchange = (e) => handleFileUpload(e as any, docType.type);
                                input.click();
                              }}
                              disabled={uploading}
                              className="border-slate-600 hover:bg-slate-600"
                            >
                              {uploading ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                              <span className="ml-1 hidden sm:inline">
                                {existingDoc ? 'Replace' : 'Upload'}
                              </span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <Button
                onClick={() => setActiveStep(3)}
                disabled={!kycStatus?.documents?.length}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                Proceed to Verification
              </Button>
            </div>
          )}

          {/* Step 3: AI Verification */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-blue-400" />
                KonsAI Verification
              </h3>
              
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Eye className="h-10 w-10 text-white" />
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold">Ready for AI Verification</h4>
                  <p className="text-slate-400 mt-2">
                    Click the button below to start the KonsAI verification process. 
                    Our advanced AI will analyze your documents for authenticity and compliance.
                  </p>
                </div>
                
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <h5 className="font-medium mb-2">Verification Process:</h5>
                  <ul className="text-sm text-slate-400 space-y-1 text-left">
                    <li>• Document authenticity check</li>
                    <li>• Identity verification</li>
                    <li>• Risk assessment</li>
                    <li>• Compliance validation</li>
                    <li>• KonsAI intelligence analysis</li>
                  </ul>
                </div>
                
                <Button
                  onClick={() => triggerVerificationMutation.mutate()}
                  disabled={triggerVerificationMutation.isPending || kycStatus?.overall === 'verified'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {triggerVerificationMutation.isPending ? (
                    <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <Zap className="h-5 w-5 mr-2" />
                  )}
                  {kycStatus?.overall === 'verified' ? 'Already Verified' : 'Start KonsAI Verification'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KonsAI Integration Status */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-purple-400" />
            <span>KonsAI Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300 mb-4">
            KonsAI continuously monitors your verification status and integrates with all financial operations 
            to ensure secure and compliant transactions across the platform.
          </p>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              <Zap className="h-3 w-3 mr-1" />
              Real-time Monitoring
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              <Shield className="h-3 w-3 mr-1" />
              Secure Integration
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCVerification;