'use client';
import { Button, Card } from "@/app/Components/Ui/Components";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiCall } from "@/app/lib/api";

interface Plan {
    _id: { $oid: string };
    stripePriceID: string;
    name: string;
    description: string;
    priceMonth: number;
    priceYear: number;
    features: string[];
    isPopular: boolean;
}

const SelectPlan = () => {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await apiCall("/plans", { method: "GET" });
                if (res.ok) {
                    const responseData = await res.json();
                    setPlans(responseData.data);
                }
            } catch (error) {
                console.error("Failed to fetch plans:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handlePaymentGateway = async (planID: string, priceId: string) => {
        // Skip Stripe for free plans (priceMonth is 0 or priceId is 'free')
        if (priceId === 'free' || priceId === '' || !priceId) {
            console.log("Free plan selected, skipping Stripe.");
            router.push('/Dashboard');
            return;
        }

        try {
            const orgID = localStorage.getItem('orgID');
            const res = await apiCall("/create-checkout-session", {
                method: "POST",
                body: JSON.stringify({ planID, priceId, orgID }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    router.push('/Dashboard');
                }
            } else {
                const errorData = await res.json();
                console.error("Stripe session failed:", errorData.error);
                alert(`Failed to initiate checkout: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Payment initiation failed:", error);
            router.push('/Dashboard');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 mt-10">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Simple, transparent pricing</h2>
                <p className="mt-4 text-lg text-slate-600">Choose the plan that best fits your team's needs.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto items-stretch">
                {plans.map((plan) => {
                    const isPopular = plan.isPopular;
                    return (
                        <Card 
                            key={plan._id.$oid} 
                            className={`p-8 flex flex-col transition-all hover:shadow-xl hover:-translate-y-2 duration-300 ${
                                isPopular 
                                ? 'border-primary-500 ring-2 ring-primary-500 relative shadow-2xl scale-105 z-20 bg-white' 
                                : 'hover:border-primary-300 bg-white/80 backdrop-blur-sm z-10'
                            }`}
                        >
                            {isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-bold text-white shadow-lg uppercase tracking-wide">
                                    Most Popular
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-extrabold text-slate-900">
                                    {plan.priceMonth === 0 ? '$0' : `$${plan.priceMonth}`}
                                </span>
                                <span className="ml-2 text-slate-500">/mo</span>
                            </div>
                            <p className="mt-4 text-sm text-slate-600 min-h-[40px]">
                                {plan.description}
                            </p>
                            <ul className="mt-8 space-y-4 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center text-sm text-slate-600">
                                        <div className={`mr-3 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            isPopular ? 'bg-primary-100' : 'bg-slate-100'
                                        }`}>
                                            <Check className={`h-3 w-3 ${isPopular ? 'text-primary-600' : 'text-slate-600'}`} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button 
                                onClick={() => handlePaymentGateway(plan._id.$oid, plan.stripePriceID)} 
                                variant={isPopular ? 'default' : 'outline'}
                                className={`mt-8 w-full font-semibold ${isPopular ? 'shadow-lg shadow-primary-500/25 h-12' : 'border-slate-300'}`}
                            >
                                {plan.priceMonth === 0 ? 'Get Started' : 'Start Subscription'}
                            </Button>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
export default SelectPlan;
