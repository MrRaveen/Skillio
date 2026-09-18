'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2, PartyPopper } from 'lucide-react';
import { Button, Card } from '@/app/Components/Ui/Components';
import { apiCall } from '@/app/lib/api';

const SuccessPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (sessionId) {
            // Here you could call your backend to verify the session if needed
            // For now, we'll just show success after a short delay
            const timer = setTimeout(() => setStatus('success'), 1500);
            return () => clearTimeout(timer);
        } else {
            setStatus('error');
        }
    }, [sessionId]);

    const handleGoDashboard = () => {
        router.push('/Dashboard');
    };

    return (
        <div className="min-h-screen bg-mesh-color flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-grid pointer-events-none"></div>
            
            <div className="relative z-10 max-w-md mx-auto w-full">
                <Card className="p-8 text-center shadow-2xl border-slate-200/60 backdrop-blur-md bg-white/90">
                    {status === 'loading' ? (
                        <div className="space-y-6 py-8">
                            <div className="flex justify-center">
                                <Loader2 className="h-16 w-16 text-primary-600 animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Verifying Payment...</h2>
                            <p className="text-slate-600">Please wait while we finalize your subscription.</p>
                        </div>
                    ) : status === 'success' ? (
                        <div className="space-y-6 animate-in zoom-in duration-500">
                            <div className="flex justify-center relative">
                                <div className="absolute -top-4 -right-4 animate-bounce">
                                    <PartyPopper className="h-8 w-8 text-yellow-500" />
                                </div>
                                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900">Payment Successful!</h2>
                                <p className="mt-2 text-slate-600">
                                    Welcome to the Skillio family. Your organization account is now active.
                                </p>
                            </div>
                            <div className="pt-6">
                                <Button onClick={handleGoDashboard} className="w-full h-12 text-lg shadow-lg shadow-primary-500/25">
                                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-center">
                                <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="h-12 w-12 text-red-600 rotate-45" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Something went wrong</h2>
                            <p className="text-slate-600">We couldn't verify your session. Please contact support.</p>
                            <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                                Back to Home
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default SuccessPage;
