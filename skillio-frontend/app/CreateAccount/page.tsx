'use client';
import React, { useState } from 'react';
import { Mail, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button, Input, Card } from '../Components/Ui/Components';
import { useRouter } from "next/navigation";
import { apiCall, devStatus } from '../lib/api';

const EmailVerificationStep = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'verifying' | 'verified'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (devStatus === 'ui-only') {
      console.log("[UI-ONLY] Mocking send code to", email);
      setStatus('sent');
      return;
    }
    setStatus('sending');
    setError(null);
    try {
      const res = await apiCall(`/get-verification-code/${email}`, { method: 'GET' });
      if (res.ok) {
        setStatus('sent');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to send verification code');
        setStatus('idle');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setStatus('idle');
    }
  };

  const handleVerifyCode = async () => {
    if (devStatus === 'ui-only') {
      console.log("[UI-ONLY] Mocking verify code", code);
      setStatus('verified');
      const savedData = localStorage.getItem('onboarding_data');
      const data = savedData ? JSON.parse(savedData) : {};
      data.ownerEmail = email;
      data.companyEmail = email;
      localStorage.setItem('onboarding_data', JSON.stringify(data));
      setTimeout(() => router.push('/CreateAccount/CreateAccCompanyInfo'), 1000);
      return;
    }
    setStatus('verifying');
    setError(null);
    try {
      const res = await apiCall(`/verify-user/${email}/${code}`, { method: 'POST' });
      if (res.ok) {
        setStatus('verified');
        // Save email to onboarding data
        const savedData = localStorage.getItem('onboarding_data');
        const data = savedData ? JSON.parse(savedData) : {};
        data.ownerEmail = email;
        data.companyEmail = email; // Default
        localStorage.setItem('onboarding_data', JSON.stringify(data));

        setTimeout(() => {
          router.push('/CreateAccount/CreateAccCompanyInfo');
        }, 1000);
      } else {
        const data = await res.json();
        setError(data.message || 'Verification failed');
        setStatus('sent');
      }
    } catch (err) {
      setError('An error occurred during verification.');
      setStatus('sent');
    }
  };

  return (
    <div className="min-h-screen bg-mesh-color flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid pointer-events-none"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>

      <div className="relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl shadow-primary-500/30">
              <ShieldCheck className="h-7 w-7" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Let's verify your email
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Step 1 of 5
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="px-4 py-8 sm:px-10 shadow-xl border-slate-200/60 backdrop-blur-sm bg-white/80 ring-1 ring-slate-200/50">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                  {error}
                </div>
              )}

              {status === 'idle' || status === 'sending' ? (
                <>
                  <Input
                    label="Work Email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    onClick={handleSendCode}
                    className="w-full"
                    disabled={!email || status === 'sending'}
                  >
                    {status === 'sending' ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send Verification Code'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm text-slate-600">Code sent to <strong>{email}</strong></p>
                    <button onClick={() => setStatus('idle')} className="text-xs text-primary-600 hover:underline">Change email</button>
                  </div>
                  <Input
                    label="Verification Code"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <Button
                    onClick={handleVerifyCode}
                    className="w-full"
                    disabled={!code || status === 'verifying' || status === 'verified'}
                  >
                    {status === 'verifying' ? <Loader2 className="animate-spin h-5 w-5" /> :
                      status === 'verified' ? 'Verified!' : 'Verify Code'}
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationStep;



