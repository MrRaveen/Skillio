'use client';
import { useState, useEffect } from 'react';
import { Badge, Card } from '@/app/Components/Ui/Components';
import { apiCall } from '@/app/lib/api';
import {
  Award,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Mail,
  TrendingUp,
  TrendingDown,
  XCircle,
  AlertTriangle,
  BarChart2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// --- Types ---
interface InitialQuestionEval {
  isInitialQuestionPerformed: boolean;
  initialQuestionMarks: number;
  initialQuestionMarksPercent: number;
  totalQuestions: number;
  correctedCount: number;
}

interface ModuleEvaluations {
  passedStatus: boolean;
  passLimit: number;
  obtainedMarks: number;
  totalCorrectedCount: number;
  obtainedMarksPrecent: number;
  totalQuestions: number;
}

interface ModuleStat {
  moduleName: string;
  moduleEvaluations: ModuleEvaluations | null;
}

interface TotalEvaluation {
  passModuleLimitCount: number;
  actualPassedModuleCount: number;
  totalMarks: number;
  totalMrksPercent: number;
}

interface TrainingStat {
  trainingID: string;
  trainingPassStatus: boolean;
  trainingStatus: string;
  initialQuestionEval: InitialQuestionEval | null;
  modules: ModuleStat[];
  totalEvaluation: TotalEvaluation | null;
}

interface EmployeeTrainingStat {
  employeeID: string;
  email: string;
  employeeName: string;
  allTrainingsCount: number;
  passedCount: number;
  pendingCount: number;
  failedCount: number;
  allTrainings: TrainingStat[];
  regression?: number;
}

// --- Helpers ---
function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === 'finished') return <Badge variant="neutral" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-black uppercase tracking-wider">Finished</Badge>;
  if (s === 'failed') return <Badge variant="neutral" className="bg-red-50 text-red-700 border-red-100 text-[10px] font-black uppercase tracking-wider">Failed</Badge>;
  return <Badge variant="neutral" className="bg-amber-50 text-amber-700 border-amber-100 text-[10px] font-black uppercase tracking-wider">In Progress</Badge>;
}

// --- Mini Bar Chart for initial question eval ---
function InitialEvalChart({ eval: ev }: { eval: InitialQuestionEval }) {
  const data = [
    { name: 'Correct', value: ev.correctedCount, fill: '#10b981' },
    { name: 'Wrong', value: ev.totalQuestions - ev.correctedCount, fill: '#ef4444' },
  ];
  return (
    <div className="mt-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Initial Evaluation Results</p>
        <p className="text-xl font-black text-primary-600">{ev.initialQuestionMarksPercent}%</p>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden shadow-inner">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-primary-500 to-emerald-400 transition-all duration-700 shadow-sm"
          style={{ width: `${ev.initialQuestionMarksPercent}%` }}
        />
      </div>
      <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={data} barSize={48} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 800 }} axisLine={false} tickLine={false} dy={10} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, fontWeight: 700, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              cursor={{ fill: 'rgba(99,102,241,0.05)' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Module progress mini bars ---
function ModuleProgressList({ modules }: { modules: ModuleStat[] }) {
  if (!modules || modules.length === 0) return null;
  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Module Results</p>
      <div className="space-y-4">
        {modules.map((mod, idx) => {
          const pct = mod.moduleEvaluations?.obtainedMarksPrecent ?? null;
          const passed = mod.moduleEvaluations?.passedStatus;
          return (
            <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate mb-2">{mod.moduleName}</p>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 shadow-sm ${passed ? 'bg-emerald-500' : pct !== null && pct > 0 ? 'bg-amber-500' : 'bg-slate-300'}`}
                    style={{ width: pct !== null ? `${pct}%` : '0%' }}
                  />
                </div>
              </div>
              <div className="shrink-0 text-right flex items-center gap-2">
                {pct !== null ? (
                  <span className={`text-sm font-black ${passed ? 'text-emerald-600' : 'text-slate-600'}`}>{pct}%</span>
                ) : (
                  <span className="text-xs text-slate-400 font-bold">—</span>
                )}
                {passed !== undefined && pct !== null && (
                  passed
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    : <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Single Training Card ---
function TrainingCard({ training, idx }: { training: TrainingStat; idx: number }) {
  const [expanded, setExpanded] = useState(false);
  const notPerformed = !training.initialQuestionEval?.isInitialQuestionPerformed;

  return (
    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md ${training.trainingPassStatus ? 'bg-emerald-500' : training.trainingStatus.toLowerCase() === 'finished' ? 'bg-red-500' : 'bg-amber-500'}`}>
            {idx + 1}
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-slate-900 mb-1">Training #{idx + 1}</p>
            <StatusBadge status={training.trainingStatus} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {training.totalEvaluation && (
            <span className="text-lg font-black text-primary-600 hidden sm:block bg-primary-50 px-3 py-1 rounded-lg">{training.totalEvaluation.totalMrksPercent}%</span>
          )}
          {expanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-6 border-t border-slate-100 mt-0 pt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50/30">
          {/* Initial Question Eval */}
          <div>
            {notPerformed ? (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-xs font-bold text-amber-700">Employee has not completed the initial evaluation round.</p>
              </div>
            ) : training.initialQuestionEval ? (
              <InitialEvalChart eval={training.initialQuestionEval} />
            ) : null}
          </div>

          {/* Modules */}
          {training.modules.length > 0 && <ModuleProgressList modules={training.modules} />}

          {/* Total Eval */}
          {training.totalEvaluation && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200">
              {[
                { label: 'Pass Limit', value: training.totalEvaluation.passModuleLimitCount },
                { label: 'Passed Modules', value: training.totalEvaluation.actualPassedModuleCount },
                { label: 'Total Marks', value: training.totalEvaluation.totalMarks },
                { label: 'Score %', value: `${training.totalEvaluation.totalMrksPercent}%` },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center hover:border-primary-200 hover:shadow-md transition-all">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Employee Card ---
function EmployeeProgressCard({ emp }: { emp: EmployeeTrainingStat }) {
  const [expanded, setExpanded] = useState(false);
  const hasAnyNotPerformed = emp.allTrainings.some(t => !t.initialQuestionEval?.isInitialQuestionPerformed);

  const handleEmailClick = () => {
    const subject = encodeURIComponent('Action Required: Complete Your Initial Training Evaluation');
    const body = encodeURIComponent(
      `Hi ${emp.employeeName},\n\nThis is a reminder that you have not yet completed the initial evaluation round for your assigned training on Skillio.\n\nPlease log in and complete it at your earliest convenience.\n\nBest regards,\nThe Training Team`
    );
    window.open(`mailto:${emp.email}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <Card className="rounded-2xl border border-slate-100 shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
      {/* Card Header */}
      <div
        className="flex items-start sm:items-center justify-between gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-base font-black shadow-md shadow-primary-100 shrink-0">
            {emp.employeeName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">{emp.employeeName}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{emp.email}</p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs font-black text-slate-600">{emp.allTrainingsCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-black text-emerald-600">{emp.passedCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-black text-amber-600">{emp.pendingCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs font-black text-red-600">{emp.failedCount}</span>
          </div>
          {emp.regression !== undefined && (
            <div 
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
                emp.regression >= 0 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                  : 'bg-red-50 border-red-100 text-red-700'
              }`}
              title={emp.regression >= 0 ? 'Performance Gain' : 'Performance Loss'}
            >
              {emp.regression >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span className="text-[10px] font-black uppercase tracking-wider">
                {emp.regression >= 0 ? '+' : '-'}{Math.abs(emp.regression).toFixed(2)}
              </span>
            </div>
          )}
          {hasAnyNotPerformed && (
            <button
              onClick={e => { e.stopPropagation(); handleEmailClick(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-amber-100 transition-colors"
            >
              <Mail className="h-3 w-3" /> Notify
            </button>
          )}
          <div className="ml-1">
            {expanded ? <ChevronUp className="h-5 w-5 text-slate-300" /> : <ChevronDown className="h-5 w-5 text-slate-300" />}
          </div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Passed', value: emp.passedCount, total: emp.allTrainingsCount, color: 'bg-emerald-400' },
            { label: 'Pending', value: emp.pendingCount, total: emp.allTrainingsCount, color: 'bg-amber-400' },
            { label: 'Failed', value: emp.failedCount, total: emp.allTrainingsCount, color: 'bg-red-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-50 rounded-xl border border-slate-100 p-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-slate-800 mt-0.5">{stat.value}</p>
              <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
                <div
                  className={`h-1 rounded-full transition-all duration-700 ${stat.color}`}
                  style={{ width: stat.total > 0 ? `${Math.round((stat.value / stat.total) * 100)}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded trainings */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Training Records</p>
          </div>
          {emp.allTrainings.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium py-4 text-center">No trainings assigned yet.</p>
          ) : (
            emp.allTrainings.map((t, idx) => <TrainingCard key={t.trainingID} training={t} idx={idx} />)
          )}
        </div>
      )}
    </Card>
  );
}

// --- Main Component ---
export default function ProgressTab() {
  const [data, setData] = useState<EmployeeTrainingStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiCall('/get-all-training-per-employee');
        const result = await res.json();
        if (result.status === 'success') {
          setData(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch employee progress data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = data.filter(emp =>
    emp.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-slate-400">
        <BarChart2 className="h-10 w-10 animate-pulse mb-4 text-primary-300" />
        <p className="font-bold text-sm">Loading employee progress data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Employee Progress</h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Track training performance and evaluation results across your team.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm w-full sm:w-64">
            <BrainCircuit className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 w-full font-medium"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Employees', value: data.length, icon: Award, color: 'text-primary-600 bg-primary-50' },
            { label: 'Total Passed', value: data.reduce((s, e) => s + e.passedCount, 0), icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'In Progress', value: data.reduce((s, e) => s + e.pendingCount, 0), icon: Clock, color: 'text-amber-600 bg-amber-50' },
            { label: 'Failed', value: data.reduce((s, e) => s + e.failedCount, 0), icon: XCircle, color: 'text-red-600 bg-red-50' },
          ].map((stat, i) => (
            <Card key={i} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Employee List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
          <BrainCircuit className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-slate-400 font-bold">No employees found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(emp => (
            <EmployeeProgressCard key={emp.employeeID} emp={emp} />
          ))}
        </div>
      )}
    </div>
  );
}
