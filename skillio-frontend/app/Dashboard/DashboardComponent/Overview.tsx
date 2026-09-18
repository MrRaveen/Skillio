import { Badge, Button, Card } from "@/app/Components/Ui/Components";
import { ArrowUpRight, Award, BrainCircuit, Plus, TrendingUp, Users, Briefcase, Clock, Info, BookOpen, Bell, Sparkles, Rocket, Zap, Bot } from "lucide-react";
import { useState, useEffect } from "react";
import { apiCall } from "@/app/lib/api";

interface Prediction {
    id: string;
    name: string;
    role: string;
    skillGrowth: number;
    flightRisk: number;
    performance: number;
    nextRoleFit: number;
}
interface PromotionRec {
    id: string;
    name: string;
    currentRole: string;
    recommendedRole: string;
    readiness: number;
    reason: string;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
}
interface Team {
    id: string;
    name: string;
    description: string;
    members: TeamMember[];
}
interface Department {
    id: string;
    name: string;
    teams: Team[];
}

const WelcomeView = ({ name }: { name: string }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-700 p-8 text-white shadow-lg">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Skillio, {name}!</h1>
                    <p className="text-primary-100 text-lg mb-6 leading-relaxed">
                        Your journey to mastering new skills starts here. We've used AI to architect a personalized learning experience just for you.
                    </p>
                </div>

                {/* Abstract shapes for premium feel */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 h-64 w-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 h-64 w-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tips Section */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        Quick Tips for Success
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            {
                                title: "Complete Skill Assessments",
                                desc: "Assessments help our AI understand your baseline and generate more relevant modules.",
                                icon: BrainCircuit,
                                color: "bg-blue-50 text-blue-600 border-blue-100"
                            },
                            {
                                title: "Follow Learning Paths",
                                desc: "Your curriculum is structured into logical modules. Complete them sequentially for best results.",
                                icon: BookOpen,
                                color: "bg-emerald-50 text-emerald-600 border-emerald-100"
                            },
                            {
                                title: "Track Your Skill Score",
                                desc: "Watch your Skill Score grow as you complete modules and pass evaluations.",
                                icon: TrendingUp,
                                color: "bg-amber-50 text-amber-600 border-amber-100"
                            },
                            {
                                title: "Stay Notified",
                                desc: "Check the notification bell for updates on new courses or training plan completions.",
                                icon: Bell,
                                color: "bg-indigo-50 text-indigo-600 border-indigo-100"
                            }
                        ].map((tip, i) => (
                            <Card key={i} className="p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group hover:-translate-y-1">
                                <div className="flex gap-4">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border ${tip.color} transition-transform group-hover:scale-110`}>
                                        <tip.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-primary-600 transition-colors">{tip.title}</h3>
                                        <p className="text-xs text-slate-500 leading-relaxed">{tip.desc}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Getting Started Guide */}
                <Card className="p-8 border-0 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col justify-between relative overflow-hidden group min-h-[500px]">
                    {/* Background decoration */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>

                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <Badge className="bg-primary-50 text-primary-600 border-primary-100 px-3 py-1 text-[10px] uppercase tracking-wider font-black">Pro Tip</Badge>
                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                <Zap className="h-4 w-4" />
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold mb-8 text-slate-900 tracking-tight">How it works?</h3>

                        <div className="relative space-y-10">
                            {/* Vertical Line */}
                            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary-200 via-primary-100 to-transparent"></div>

                            {[
                                { step: "01", title: "Take Assessment", desc: "A few questions to gauge your current knowledge.", icon: BrainCircuit },
                                { step: "02", title: "AI Generation", desc: "Our AI builds a custom curriculum based on your results.", icon: Bot },
                                { step: "03", title: "Learn & Earn", desc: "Engage with content and earn certifications.", icon: Award }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 relative z-10 group/item">
                                    <div className="h-8 w-8 rounded-full bg-white border-2 border-primary-500 flex items-center justify-center shrink-0 shadow-sm group-hover/item:scale-110 transition-transform">
                                        <span className="text-[10px] font-black text-primary-600">{item.step}</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base text-slate-900 mb-1 group-hover/item:text-primary-600 transition-colors">{item.title}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default function Overview() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        activeLearners: 0,
        skillsMapped: 0,
        avgSkillScore: 7.8,
        trainingROI: 245
    });

    const [userName, setUserName] = useState('');

    //------------------------Dummy data for AI parts (since AI routes aren't connected yet)------------------------
    const initialPredictions: Prediction[] = [
        { id: 'm-1', name: 'Alice Johnson', role: 'Lead Engineer', skillGrowth: 85, flightRisk: 12, performance: 94, nextRoleFit: 92 },
        { id: 'm-2', name: 'Bob Smith', role: 'Senior Developer', skillGrowth: 62, flightRisk: 45, performance: 88, nextRoleFit: 78 },
        { id: 'm-3', name: 'Charlie Brown', role: 'DevOps Engineer', skillGrowth: 45, flightRisk: 65, performance: 76, nextRoleFit: 40 },
        { id: 'm-4', name: 'Sarah Davis', role: 'VP of Product', skillGrowth: 90, flightRisk: 5, performance: 98, nextRoleFit: 95 },
    ];
    const initialPromotionRecs: PromotionRec[] = [
        { id: 'm-2', name: 'Bob Smith', currentRole: 'Senior Developer', recommendedRole: 'Tech Lead', readiness: 88, reason: 'High technical velocity & consistency' },
        { id: 'm-6', name: 'Jenny Lee', currentRole: 'Product Designer', recommendedRole: 'Senior Product Designer', readiness: 92, reason: 'Led redesign project successfully' },
    ];

    const [userType, setUserType] = useState<'company' | 'employee' | null>(null);

    useEffect(() => {
        const type = localStorage.getItem('userType') as 'company' | 'employee' || 'company';
        setUserType(type);

        if (type === 'employee') {
            setUserName(localStorage.getItem('employeeName') || 'Learner');
        }

        const fetchStats = async () => {
            try {
                // Only fetch organization stats if company admin
                if (localStorage.getItem('userType') !== 'employee') {
                    const [empRes, skillRes] = await Promise.all([
                        apiCall('/employee-manage', { method: 'GET' }),
                        apiCall('/skill-manage', { method: 'GET' })
                    ]);

                    let empCount = 0;
                    let skillCount = 0;

                    if (empRes.ok) {
                        const data = await empRes.json();
                        if (data.status === 'success' && data.data) {
                            empCount = data.data.length;
                        }
                    }

                    if (skillRes.ok) {
                        const data = await skillRes.json();
                        if (data.status === 'success' && data.data) {
                            skillCount = data.data.length;
                        }
                    }

                    setStats(prev => ({
                        ...prev,
                        activeLearners: empCount,
                        skillsMapped: skillCount
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch overview stats', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;
    }

    const companyStats = [
        { label: 'Active Learners', value: stats.activeLearners.toString(), change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Skills Mapped', value: stats.skillsMapped.toString(), change: '+5%', icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { label: 'Avg. Skill Score', value: stats.avgSkillScore.toString(), change: '+0.4', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { label: 'Training ROI', value: `${stats.trainingROI}%`, change: '+24%', icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];

    const employeeStats = [
        { label: 'Completed Courses', value: '4', change: '+1', icon: Award, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'My Skill Score', value: '8.2', change: '+0.5', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { label: 'Certifications', value: '2', change: 'New', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { label: 'Next Milestone', value: '15d', change: 'Upcoming', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];

    const currentStats = userType === 'employee' ? employeeStats : companyStats;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header for Desktop */}
            <div className="hidden md:flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-slate-900">{userType === 'employee' ? 'Dashboard' : 'Overview'}</h1>
            </div>

            {userType === 'employee' ? (
                <WelcomeView name={userName} />
            ) : (
                <>
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {currentStats.map((stat, i) => (
                            <Card key={i} className={`p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both border-0 shadow-sm ring-1 ring-slate-200`} style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="flex items-center justify-between">
                                    <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.change}</span>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* AI Predictions & Promotions Tables (Only for Company Admin) */}
                    <div className="grid grid-cols-1 gap-6">
                        {/* Predictions Table */}
                        <Card className="p-0 overflow-hidden fill-mode-both shadow-sm border-0 ring-1 ring-slate-200">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <BrainCircuit className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">AI Performance Predictions</h3>
                                        <p className="text-xs text-slate-500">Forecasted metrics based on activity</p>
                                    </div>
                                </div>
                                <Badge variant="neutral">Live Updates</Badge>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Employee</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Skill Growth</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Flight Risk</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Performance</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {initialPredictions.map((pred) => (
                                            <tr key={pred.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900 text-sm">{pred.name}</div>
                                                    <div className="text-xs text-slate-500">{pred.role}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pred.skillGrowth}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-emerald-600">+{pred.skillGrowth}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block ${pred.flightRisk > 50 ? 'bg-red-50 text-red-600' :
                                                        pred.flightRisk > 20 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                                                        }`}>
                                                        {pred.flightRisk}% Risk
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-slate-700">{pred.performance}%</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button size="sm" variant="ghost">
                                                        View Info
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Promotion Recommendations Table */}
                        <Card className="p-0 overflow-hidden fill-mode-both shadow-sm border-0 ring-1 ring-slate-200">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <Award className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Promotion Recommendations</h3>
                                        <p className="text-xs text-slate-500">Candidates ready for next role</p>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Employee</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Recommendation</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Readiness</th>
                                            <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {initialPromotionRecs.map((promo) => (
                                            <tr key={promo.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                                                            {promo.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900 text-sm">{promo.name}</div>
                                                            <div className="text-xs text-slate-500">{promo.currentRole}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-primary-700">{promo.recommendedRole}</div>
                                                    <div className="text-xs text-slate-500 line-clamp-1" title={promo.reason}>{promo.reason}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <div key={star} className={`h-1.5 w-1.5 rounded-full mx-0.5 ${star <= (promo.readiness / 20) ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                                            ))}
                                                        </div>
                                                        <span className="text-xs font-bold ml-2 text-slate-700">{promo.readiness}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button size="sm" variant="outline" className="text-xs h-7">
                                                        View Info
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}