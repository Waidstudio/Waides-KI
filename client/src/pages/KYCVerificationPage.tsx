import React from 'react';
import KYCVerification from '@/components/KYCVerification';

const KYCVerificationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              KYC Verification Center
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Secure your account with our advanced KYC verification system. 
              Complete your identity verification to unlock full platform access and enhanced security features.
            </p>
          </div>

          {/* KYC Component */}
          <KYCVerification />
        </div>
      </div>
    </div>
  );
};

export default KYCVerificationPage;