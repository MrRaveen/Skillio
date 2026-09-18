'use client';
import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, Building2 } from 'lucide-react';
import { Button, Card } from '@/app/Components/Ui/Components';

const CancelPage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-mesh-color flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-dot-grid pointer-events-none"></div>
            
            <div className="relative z-10 max-w-md mx-auto w-full">
                <Card className="p-8 text-center shadow-2xl border-slate-200/60 backdrop-blur-md bg-white/90">
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="h-20 w-20 bg-amber-100 rounded-full flex items-center justify-center">
                                <XCircle className="h-12 w-12 text-amber-600" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">Payment Cancelled</h2>
                            <p className="mt-2 text-slate-600">
                                Your payment process was cancelled. No charges were made to your account.
                            </p>
                        </div>
                        <div className="pt-6 flex flex-col gap-3">
                            <Button onClick={() => router.push('/CreateAccount/SelectPlan')} className="w-full h-12">
                                Try Again
                            </Button>
                            <Button variant="ghost" onClick={() => router.push('/')} className="w-full text-slate-500">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CancelPage;
