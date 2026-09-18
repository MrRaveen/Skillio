import { Card, Button, Badge } from "@/app/Components/Ui/Components";
import { useState, useEffect, useRef } from "react";
import mermaid from "mermaid";
import { createPortal } from "react-dom";
import { apiCall } from "@/app/lib/api";
import {
  BookOpen,
  CheckCircle2,
  PlayCircle,
  FileText,
  Info,
  GraduationCap,
  ChevronRight,
  Clock,
  Award,
  Sparkles,
  ChevronLeft,
  Volume2,
  BrainCircuit,
  Layout,
  Eye,
  X,
  Loader2,
  AlertCircle,
  Download,
  Maximize2
} from "lucide-react";

// --- Interfaces ---
interface Question {
  questions: string;
  answerChoices: string[];
  correctAnswer: number;
  userProvidedAnswer?: number;
  correctnessStatus?: boolean;
}

interface Paragraph {
  paragraph: string;
  has_diagram?: boolean;
  mermaidCode?: string;
}


// --- Diagram Lightbox (full-screen enlarge overlay) ---
const DiagramLightbox = ({ chart, onClose }: { chart: string; onClose: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default' });
    if (ref.current && chart) {
      mermaid.render(`mermaid-lb-${Math.random().toString(36).substr(2, 9)}`, chart)
        .then(({ svg }) => { if (ref.current) ref.current.innerHTML = svg; })
        .catch(err => console.error('Mermaid lightbox error:', err));
    }
  }, [chart]);
  // close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdrop}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 m-8 max-w-5xl w-full max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div ref={ref} className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto" />
      </div>
    </div>,
    document.body
  );
};

// --- Enhanced Mermaid Diagram with Download + Enlarge ---
const MermaidDiagram = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [enlarged, setEnlarged] = useState(false);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: 'default' });
    if (ref.current && chart) {
      mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart)
        .then(({ svg }) => { if (ref.current) ref.current.innerHTML = svg; })
        .catch(err => console.error('Mermaid render error:', err));
    }
  }, [chart]);

  const handleDownload = () => {
    const svgEl = ref.current?.querySelector('svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      canvas.width = img.width || 1200;
      canvas.height = img.height || 800;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = 'diagram.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  };

  return (
    <>
      {enlarged && <DiagramLightbox chart={chart} onClose={() => setEnlarged(false)} />}
      <div className="relative my-6 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden group">
        {/* Action buttons — visible on hover */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={() => setEnlarged(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
            title="Enlarge diagram"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Enlarge
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
            title="Download as PNG"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        </div>
        <div ref={ref} className="flex justify-center overflow-x-auto p-6 [&_svg]:max-w-full [&_svg]:h-auto" />
      </div>
    </>
  );
};

interface Article {
  articleTitle: string;
  paragraphs: Paragraph[];
}

interface VoiceCover {
  slideNumber: string;
  voiceFileLink: string;
}

interface Slide {
  slideName: string;
  slideLink: string;
  totSlideCount: number;
  voiceCovers: VoiceCover[];
}

interface EvaluationStatus {
  passedStatus: boolean;
  passLimit: number;
  obtainedMarks: number;
  totalCorrectedCount: number;
  obtainedMarksPrecent: number;
  totalQuestions: number;
}

interface Module {
  moduleTitle: string;
  moduleDescription: string;
  articles: Article[];
  slides: Slide[];
  evaluationQuestions: Question[];
  evaluationStatus?: EvaluationStatus;
}

interface InitialQuestionEvaluation {
  initialQuestionMarks: number;
  initialQuestionMarksPercent: number;
  totalQuestions: number;
  correctedCount: number;
}

interface TotalEvaluation {
  passModuleLimitCount: number;
  actualPassedModuleCount: number;
  totalMarks: number;
  totalMrksPercent: number;
}

interface TrainingContent {
  title?: string;
  overview?: string;
  initialQuestions: Question[];
  modules: Module[];
  initialQuestionEvaluation?: InitialQuestionEvaluation;
  totalEvaluation?: TotalEvaluation;
}

interface PracticeQuestionPair {
  question: string;
  answer: string;
}

interface TrainingPracticeQuestionSets {
  allQuestions: PracticeQuestionPair[][];
}

// Context for opening a module (includes what training it belongs to)
interface ActiveModuleContext {
  module: Module;
  trainingContentID: string;
  moduleArrIndex: number;
  isEmployee: boolean;
}

interface TrainingRecord {
  id: string;
  trainingContentID?: string;
  trainingStatus: string;
  content: TrainingContent | null;
  employeeID?: string;
  employeeName?: string;
  employeeRoleName?: string;
  employeeDepartmentName?: string;
  employeeSkills?: string[];
  employeeTeamName?: string;
  trainingPracticeQuestionSets?: TrainingPracticeQuestionSets;
}

// --- Main Component ---
export default function LearningPathTab() {
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<string>('company');

  // Lifted state: Modals are managed at the root level
  const [activeModuleCtx, setActiveModuleCtx] = useState<ActiveModuleContext | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<Question[] | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<{ trainingID: string; questions: Question[] } | null>(null);

  const fetchTrainings = async () => {
    const isInitial = trainings.length === 0;
    if (isInitial) {
      setIsLoading(true);
    }
    try {
      // Use the correct endpoint based on user type
      const storedType = typeof window !== 'undefined' ? localStorage.getItem('userType') : 'company';
      const resolvedType = storedType || 'company';
      setUserType(resolvedType);
      const endpoint = resolvedType === 'employee' ? '/employee-learning-path' : '/get-all-training';

      const res = await apiCall(endpoint);
      const result = await res.json();
      if (result.status === 'success') {
        setTrainings(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch trainings", error);
    } finally {
      if (isInitial) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        <p className="text-slate-500 font-medium animate-pulse">Curating your learning experience...</p>
      </div>
    );
  }

  if (trainings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
        <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No learning paths available</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-xs">Check back later or contact your supervisor to assign a new training path.</p>
      </div>
    );
  }

  const isAdmin = userType !== 'employee';

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary-600" />
            Learning Paths
          </h1>
          <p className="text-slate-500 mt-1">Master new skills with AI-driven personalized curriculum.</p>
        </div>
        <Badge className="bg-primary-50 text-primary-700 border-primary-100 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
          {trainings.length} Path{trainings.length > 1 ? 's' : ''} Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-8 relative z-0">
        {trainings.map((training, i) => (
          <div key={training.id} className="animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: `${i * 150}ms` }}>
            <Card className={`overflow-hidden flex flex-col border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group rounded-2xl ${
              (!training.content?.title || !training.content?.overview) ? 'h-auto' : 'h-full min-h-[500px]'
            }`}>
              {(!training.content?.title || !training.content?.overview) ? (
                <div className="p-8 h-full flex flex-col overflow-hidden">
                  {isAdmin ? (
                    // Admin: read-only preview card — no submit
                    <AdminAssessmentPreview
                      employeeName={(training as any).employeeName}
                      questions={training.content?.initialQuestions || []}
                      onViewQuestions={() => setPreviewQuestions(training.content?.initialQuestions || [])}
                    />
                  ) : (
                    // Employee: interactive assessment with submit
                    <EmployeeAssessmentPreview
                      questionsCount={training.content?.initialQuestions?.length || 0}
                      onStart={() => setActiveAssessment({
                        trainingID: training.id,
                        questions: training.content?.initialQuestions || [],
                      })}
                    />
                  )}
                </div>
              ) : (
                <CourseView
                  content={training.content}
                  status={training.trainingStatus}
                  trainingContentID={(training as any).trainingContentID || ''}
                  trainingID={training.id}
                  isEmployee={!isAdmin}
                  trainingPracticeQuestionSets={training.trainingPracticeQuestionSets}
                  onSuccess={fetchTrainings}
                  onOpenModule={(module, idx) => setActiveModuleCtx({
                    module,
                    trainingContentID: (training as any).trainingContentID || '',
                    moduleArrIndex: idx,
                    isEmployee: !isAdmin,
                  })}
                  employeeName={training.employeeName}
                  employeeRoleName={training.employeeRoleName}
                  employeeDepartmentName={training.employeeDepartmentName}
                  employeeSkills={training.employeeSkills}
                  employeeTeamName={training.employeeTeamName}
                />
              )}
            </Card>
          </div>
        ))}
      </div>

      {/* Module Viewer Modal */}
      {activeModuleCtx && (
        <ModuleViewer
          module={activeModuleCtx.module}
          trainingContentID={activeModuleCtx.trainingContentID}
          moduleArrIndex={activeModuleCtx.moduleArrIndex}
          isEmployee={activeModuleCtx.isEmployee}
          onClose={() => setActiveModuleCtx(null)}
          onSuccess={fetchTrainings}
        />
      )}

      {/* Admin read-only questions popup */}
      {previewQuestions && (
        <AdminQuestionsViewer
          questions={previewQuestions}
          onClose={() => setPreviewQuestions(null)}
        />
      )}

      {/* Employee interactive assessment popup */}
      {activeAssessment && (
        <AssessmentView
          trainingID={activeAssessment.trainingID}
          questions={activeAssessment.questions}
          onSuccess={fetchTrainings}
          onClose={() => setActiveAssessment(null)}
        />
      )}
    </div>
  );
}

// --- Subcomponents ---

/**
 * Employee-only: clean summary card shown when an assessment is required.
 * Offers a prominent button to launch the assessment popup.
 */
function EmployeeAssessmentPreview({
  questionsCount,
  onStart,
}: {
  questionsCount: number;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col h-full justify-between p-2">
      <div>
        <Badge variant="warning" className="mb-4 bg-amber-100 text-amber-800 border-amber-200 px-3 py-1 text-[10px] uppercase font-black tracking-[0.2em] rounded-full">
          Assessment Required
        </Badge>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Initial Skill Assessment</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Welcome to Skillio! To curate your personalized learning path and generate custom modules, our AI needs to assess your current baseline skills first.
        </p>
      </div>

      <div className="my-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
            <BrainCircuit className="h-6 w-6 text-primary-500 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800">{questionsCount} Questions</p>
            <p className="text-xs text-slate-400 mt-0.5">Est. time: {Math.round(questionsCount * 1.5)} minutes</p>
          </div>
        </div>
      </div>

      <Button
        onClick={onStart}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-primary-200 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <PlayCircle className="h-5 w-5" />
        Start Skill Assessment
      </Button>
    </div>
  );
}

/**
 * Admin-only: read-only card shown when a training is in "pending assessment" state.
 * Shows a preview and a button to open the questions popup.
 */
function AdminAssessmentPreview({
  employeeName,
  questions,
  onViewQuestions,
}: {
  employeeName?: string;
  questions: Question[];
  onViewQuestions: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <Badge variant="warning" className="mb-4 bg-amber-100 text-amber-700 border-amber-200 px-3 py-1 text-[10px] uppercase font-black tracking-[0.2em]">
          Awaiting Employee Assessment
        </Badge>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Initial Skill Assessment</h2>
        {employeeName && (
          <p className="text-sm text-slate-500 mt-1">
            Assigned to <span className="font-semibold text-slate-700">{employeeName}</span>
          </p>
        )}
        <p className="text-sm text-slate-400 mt-2">
          This employee hasn&apos;t completed their baseline assessment yet.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-8 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
        <div className="h-16 w-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
          <FileText className="h-8 w-8 text-primary-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700">{questions.length} question{questions.length !== 1 ? 's' : ''} pending</p>
          <p className="text-xs text-slate-400 mt-1">Employee must complete these to unlock their AI course</p>
        </div>
        <Button
          onClick={onViewQuestions}
          variant="outline"
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold border-primary-200 text-primary-700 hover:bg-primary-50 rounded-xl"
        >
          <Eye className="h-4 w-4" />
          Preview Questions
        </Button>
      </div>
    </div>
  );
}

/**
 * Admin-only: read-only popup showing all assessment questions with correct answers highlighted.
 * No radio buttons, no submit.
 */
function AdminQuestionsViewer({ questions, onClose }: { questions: Question[]; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.25)] bg-white relative rounded-[2rem] overflow-hidden border-0">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <Badge variant="neutral" className="bg-primary-50 text-primary-700 border-0 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 mb-0.5">Read-only Preview</Badge>
              <h2 className="text-base font-black text-slate-900 leading-tight">Initial Skill Assessment</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Questions list */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-slate-50/30">
          {questions.length === 0 ? (
            <p className="text-center text-slate-400 py-12">No questions available.</p>
          ) : (
            questions.map((q, qIdx) => (
              <div key={qIdx} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex gap-4 mb-5">
                  <span className="h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                    {qIdx + 1}
                  </span>
                  <p className="font-bold text-slate-800 leading-snug">{q.questions}</p>
                </div>
                <div className="grid gap-2 ml-11">
                  {q.answerChoices.map((choice, cIdx) => (
                    <div
                      key={cIdx}
                      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${cIdx === q.correctAnswer
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}
                    >
                      <span>{choice}</span>
                      {cIdx === q.correctAnswer && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-100 bg-white shrink-0 flex items-center justify-between">
          <p className="text-xs text-slate-400 font-medium">
            {questions.length} question{questions.length !== 1 ? 's' : ''} · Admin view only
          </p>
          <Button onClick={onClose} className="px-6 py-2 text-sm font-bold">
            Close
          </Button>
        </div>
      </Card>
    </div>,
    document.body
  );
}


function CourseView({
  content,
  status,
  onOpenModule,
  trainingContentID,
  trainingID,
  isEmployee,
  trainingPracticeQuestionSets,
  onSuccess,
  employeeName,
  employeeRoleName,
  employeeDepartmentName,
  employeeSkills,
  employeeTeamName
}: {
  content: TrainingContent;
  status: string;
  onOpenModule: (m: Module, idx: number) => void;
  trainingContentID?: string;
  trainingID?: string;
  isEmployee?: boolean;
  trainingPracticeQuestionSets?: TrainingPracticeQuestionSets;
  onSuccess?: () => void;
  employeeName?: string;
  employeeRoleName?: string;
  employeeDepartmentName?: string;
  employeeSkills?: string[];
  employeeTeamName?: string;
}) {
  const [isFinalEvalLoading, setIsFinalEvalLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<{ status: 'success' | 'failed', message?: string, data?: any } | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [mounted, setMounted] = useState(false);
  const allFlashcards = trainingPracticeQuestionSets?.allQuestions?.flat() || [];
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFinalEval = async () => {
    if (!trainingContentID || !trainingID) return;
    setIsFinalEvalLoading(true);
    try {
      const res = await apiCall(`/final-path-eval/${trainingContentID}/${trainingID}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.status === 'success') {
        setEvalResult({ status: 'success', data: data.data });
        if (onSuccess) onSuccess();
      } else {
        setEvalResult({ status: 'failed', message: data.message });
      }
    } catch (err) {
      setEvalResult({ status: 'failed', message: 'An error occurred while evaluating the path.' });
    } finally {
      setIsFinalEvalLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Course Header */}
      <div className="px-8 pt-8 pb-6 border-b border-slate-100">
        
        {/* Employee Info Section */}
        {!isEmployee && employeeName && (
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
              {employeeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-slate-900">{employeeName}</h4>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide mt-0.5">
                {employeeRoleName || 'Employee'} • {employeeDepartmentName || 'Department'}
              </p>
            </div>
            {employeeTeamName && (
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                  Team: {employeeTeamName}
                </span>
                {employeeSkills && employeeSkills.length > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-primary-700 px-2.5 py-1 rounded-md">
                    {employeeSkills.length} Focus Skills
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
              status.toLowerCase() === 'finished' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}>
              <div className={`h-1.5 w-1.5 rounded-full ${status.toLowerCase() === 'finished' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
              {status}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">{content.title}</h2>
          <p className="text-sm text-slate-600 leading-relaxed mt-2">{content.overview}</p>
        </div>
      </div>

      {/* Modules List */}
      <div className="flex-1 px-8 py-6 flex flex-col overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
          <BookOpen className="h-4 w-4 text-slate-400" />
          Modules ({content.modules?.length || 0})
        </h3>

        <div className="space-y-3">
          {content.modules?.map((module, idx) => (
            <div
              key={idx}
              onClick={() => onOpenModule(module, idx)}
              className="p-4 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-sm font-semibold text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-800 group-hover:text-primary-700 transition-colors">{module.moduleTitle}</h4>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mt-1">{module.articles?.length || 0} Articles • {module.slides?.length || 0} Presentations</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
            </div>
          ))}
          {(!content.modules || content.modules.length === 0) && (
            <div className="py-12 flex flex-col items-center text-center">
              <BrainCircuit className="h-8 w-8 text-slate-300 animate-pulse mb-3" />
              <p className="text-sm text-slate-500">Modules are being architected by AI...</p>
            </div>
          )}
        </div>

        {content.modules && content.modules.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4 items-center">
            {status.toLowerCase() === 'finished' && content.totalEvaluation ? (
              <button
                onClick={() => setEvalResult({ status: 'success', data: content.totalEvaluation })}
                className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Award className="h-4 w-4" />
                View Results
              </button>
            ) : (
              isEmployee && (
                <button
                  onClick={handleFinalEval}
                  disabled={isFinalEvalLoading}
                  className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isFinalEvalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
                  {isFinalEvalLoading ? 'Processing...' : 'Complete Path Evaluation'}
                </button>
              )
            )}
            {isEmployee && allFlashcards.length > 0 && (
              <button
                onClick={() => setShowFlashcards(true)}
                className="w-full sm:w-auto bg-white border border-primary-200 text-primary-700 hover:bg-primary-50 font-semibold py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <BrainCircuit className="h-4 w-4" />
                Practice Flashcards ({allFlashcards.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Final Evaluation Result Modal */}
      {evalResult && mounted && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-md p-8 bg-white rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setEvalResult(null)}
              className="absolute top-4 right-4 h-8 w-8 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {evalResult.status === 'success' ? (
              <>
                <div className="h-20 w-20 rounded-full flex items-center justify-center shadow-lg bg-emerald-50 border-4 border-emerald-400 mb-6">
                  <Award className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Path Completed!</h3>
                <p className="text-slate-500 font-medium mb-8">You have successfully mastered this learning path.</p>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
                    <p className="text-2xl font-black text-emerald-600">{Math.round(evalResult.data.totalMrksPercent)}%</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Modules</p>
                    <p className="text-2xl font-black text-primary-600">{evalResult.data.actualPassedModuleCount}/{evalResult.data.passModuleLimitCount}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="h-20 w-20 rounded-full flex items-center justify-center shadow-lg bg-red-50 border-4 border-red-300 mb-6">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Not Eligible Yet</h3>
                <p className="text-slate-500 font-medium">{evalResult.message}</p>
                <Button
                  onClick={() => setEvalResult(null)}
                  className="w-full mt-8 bg-slate-600 hover:bg-slate-700 text-slate-700 font-black py-3 rounded-xl transition-colors"
                >
                  Close
                </Button>
              </>
            )}
          </Card>
        </div>,
        document.body
      )}

      {showFlashcards && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl bg-transparent flex flex-col h-[90vh] sm:h-auto sm:min-h-[600px]">
            <button
              onClick={() => setShowFlashcards(false)}
              className="absolute top-0 right-0 sm:-top-4 sm:-right-4 h-10 w-10 bg-white hover:bg-slate-100 text-slate-500 rounded-full flex items-center justify-center transition-colors z-10 shadow-md"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex-1 overflow-y-auto">
              <FlashcardViewer questions={allFlashcards} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function ModuleViewer({
  module,
  trainingContentID,
  moduleArrIndex,
  isEmployee,
  onClose,
  onSuccess,
}: {
  module: Module;
  trainingContentID: string;
  moduleArrIndex: number;
  isEmployee: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [viewMode, setViewMode] = useState<'article' | 'slides' | 'evaluation'>('article');
  const hasEvalQuestions = module.evaluationQuestions && module.evaluationQuestions.length > 0;
  const evalAlreadyDone = module.evaluationStatus && module.evaluationStatus.obtainedMarks !== undefined && module.evaluationStatus.obtainedMarks !== null;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full h-screen flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.3)] bg-white relative rounded-none overflow-hidden border-0">

        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white shrink-0 gap-6">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="neutral" className="bg-primary-50 text-primary-700 border-0 text-[10px] uppercase font-black tracking-widest px-2 py-0.5">Module Content</Badge>
              </div>
              <h2 className="text-xl font-black text-slate-900 line-clamp-1 tracking-tight">{module.moduleTitle}</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggles */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button
                onClick={() => setViewMode('article')}
                className={`flex items-center gap-2 px-5 py-2 text-xs font-black rounded-xl transition-all ${viewMode === 'article' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FileText className="h-4 w-4" />
                Articles
              </button>
              <button
                onClick={() => setViewMode('slides')}
                className={`flex items-center gap-2 px-5 py-2 text-xs font-black rounded-xl transition-all ${viewMode === 'slides' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <PlayCircle className="h-4 w-4" />
                Presentations
              </button>
              {isEmployee && hasEvalQuestions && (
                <button
                  onClick={() => setViewMode('evaluation')}
                  className={`flex items-center gap-2 px-5 py-2 text-xs font-black rounded-xl transition-all ${viewMode === 'evaluation' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Award className="h-4 w-4" />
                  Evaluation
                  {!evalAlreadyDone && <span className="h-2 w-2 rounded-full bg-amber-500 ml-1"></span>}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30 scrollbar-hide">
          {viewMode === 'article' && (
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm mb-8">
                <h3 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-4">Executive Summary</h3>
                <p className="text-base text-slate-700 leading-relaxed font-medium">
                  {module.moduleDescription}
                </p>
              </div>

              <div className="space-y-12 pb-12">
                {module.articles && module.articles.length > 0 ? (
                  module.articles.map((art, aIdx) => (
                    <div key={aIdx} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-200">
                          <FileText className="h-5 w-5" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                          {art.articleTitle}
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {art.paragraphs?.map((p, pIdx) => (
                          <div key={pIdx}>
                            <p className="text-base text-slate-600 leading-relaxed">
                              {p.paragraph}
                            </p>
                            {p.has_diagram && p.mermaidCode && (
                              <MermaidDiagram chart={p.mermaidCode} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No articles are currently available.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'slides' && (
            <div className="h-full flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
              {/* Presentation Iframe (Left) */}
              <div className="flex-[2] bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 relative group/frame h-full min-h-[400px]">
                {module.slides && module.slides.length > 0 && module.slides[0]?.slideLink ? (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(module.slides[0].slideLink)}`}
                    className="w-full h-full border-0"
                    title="Presentation"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                    <div className="h-16 w-16 bg-slate-800 rounded-3xl flex items-center justify-center mb-4">
                      <PlayCircle className="h-8 w-8 text-slate-600" />
                    </div>
                    <p className="text-lg font-black text-slate-300 tracking-tight">Presentation Missing</p>
                    <p className="text-slate-500 text-sm mt-1">The slide deck is currently unavailable.</p>
                  </div>
                )}
              </div>

              {/* Audio Controls (Right) */}
              {module.slides && module.slides.length > 0 && module.slides[0]?.voiceCovers && module.slides[0].voiceCovers.length > 0 && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-primary-500" />
                      Narration
                    </h3>
                  </div>
                  <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide pb-4">
                    {module.slides[0].voiceCovers.map((vc, vIdx) => (
                      <button
                        key={vIdx}
                        onClick={() => {
                          if (vc.voiceFileLink) {
                            const audio = new Audio(vc.voiceFileLink);
                            audio.play().catch(err => console.error('Failed to play audio:', err));
                          }
                        }}
                        className="w-full p-4 rounded-2xl border border-slate-100 hover:border-primary-500 hover:bg-primary-50 transition-all text-left group bg-white shadow-sm flex items-center gap-4"
                      >
                        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors shrink-0">
                          <PlayCircle className="h-5 w-5 text-slate-400 group-hover:text-primary-600" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Slide {vc.slideNumber}</div>
                          <div className="text-sm font-bold text-slate-800 mt-0.5 truncate">Play Audio</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {viewMode === 'evaluation' && (
            <ModuleEvaluationQuiz
              key={moduleArrIndex}
              trainingContentID={trainingContentID}
              moduleArrIndex={moduleArrIndex}
              questions={module.evaluationQuestions}
              existingStatus={module.evaluationStatus}
              onSuccess={onSuccess}
            />
          )}
        </div>
      </Card>
    </div>,
    document.body
  );
}

// --- Module Evaluation Quiz (employee only) ---
function ModuleEvaluationQuiz({
  trainingContentID,
  moduleArrIndex,
  questions,
  existingStatus,
  onSuccess,
}: {
  trainingContentID: string;
  moduleArrIndex: number;
  questions: Question[];
  existingStatus?: EvaluationStatus;
  onSuccess?: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasValidStatus = existingStatus && existingStatus.obtainedMarks !== undefined && existingStatus.obtainedMarks !== null;
  const [result, setResult] = useState<EvaluationStatus | null>(hasValidStatus ? existingStatus : null);

  const handleSelect = (qIdx: number, cIdx: number) => {
    if (result) return; // locked once submitted
    setAnswers(prev => ({ ...prev, [qIdx]: cIdx }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        trainingContentID,
        moduleArrIndex,
        answers: Object.entries(answers).map(([idx, ans]) => ({
          questionStr: questions[parseInt(idx)].questions,
          qAnsNum: ans,
        })),
      };
      const res = await apiCall('/submit-evaluation-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setResult(data.data);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert(`Submission failed: ${data.message}`);
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = questions.length > 0 && Object.keys(answers).length === questions.length;

  // --- Result screen ---
  if (result) {
    const passed = result.passedStatus;
    return (
      <div className="max-w-xl mx-auto py-12 flex flex-col items-center text-center gap-8 animate-in fade-in duration-500">
        <div className={`h-24 w-24 rounded-full flex items-center justify-center shadow-lg ${passed ? 'bg-emerald-50 border-4 border-emerald-400' : 'bg-red-50 border-4 border-red-300'
          }`}>
          {passed
            ? <Award className="h-12 w-12 text-emerald-500" />
            : <BrainCircuit className="h-12 w-12 text-red-400" />}
        </div>
        <div>
          <h3 className={`text-3xl font-black tracking-tight ${passed ? 'text-emerald-600' : 'text-red-500'
            }`}>
            {passed ? 'Module Passed!' : 'Keep Studying'}
          </h3>
          <p className="text-slate-500 mt-2 font-medium">
            {passed
              ? 'Great job! You cleared the module evaluation.'
              : `You needed 60% to pass. Review the material and try again.`}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
            <p className="text-2xl font-black text-slate-900">{Math.round(result.obtainedMarksPrecent)}%</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Correct</p>
            <p className="text-2xl font-black text-slate-900">{result.totalCorrectedCount}/{result.totalQuestions}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass Mark</p>
            <p className="text-2xl font-black text-slate-900">{result.passLimit}%</p>
          </div>
        </div>
        <Button
          onClick={() => {
            setResult(null);
            setAnswers({});
          }}
          className="mt-6 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-sm"
        >
          Retake Quiz
        </Button>
      </div>
    );
  }

  // --- Quiz screen ---
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-1">Module Evaluation</h3>
          <p className="text-lg font-black text-slate-900">Answer all {questions.length} questions to complete this module.</p>
        </div>
        <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-black uppercase tracking-wider px-3 py-1">
          {Object.keys(answers).length}/{questions.length} Answered
        </Badge>
      </div>

      {questions.map((q, qIdx) => (
        <div key={qIdx} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex gap-4 mb-5">
            <span className="h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              {qIdx + 1}
            </span>
            <p className="font-bold text-slate-800 leading-snug">{q.questions}</p>
          </div>
          <div className="grid gap-2 ml-11">
            {q.answerChoices.map((choice, cIdx) => (
              <label
                key={cIdx}
                onClick={() => handleSelect(qIdx, cIdx)}
                className={`flex items-center justify-between gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all group ${answers[qIdx] === cIdx
                  ? 'bg-white border-primary-500 ring-2 ring-primary-500/20 shadow-md'
                  : 'bg-slate-50 border-slate-100 hover:border-primary-200'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${answers[qIdx] === cIdx ? 'border-primary-500 bg-primary-500' : 'border-slate-300 group-hover:border-primary-300'
                    }`}>
                    {answers[qIdx] === cIdx && <div className="h-2 w-2 rounded-full bg-white"></div>}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{choice}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-8 rounded-[1.5rem] shadow-xl shadow-primary-200 transition-all hover:translate-y-[-2px] active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Submitting...
            </div>
          ) : 'Submit Evaluation'}
        </Button>
      </div>
    </div>
  );
}

function AssessmentView({
  trainingID,
  questions,
  onSuccess,
  onClose,
}: {
  trainingID: string;
  questions: Question[];
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelect = (qIndex: number, choiceIndex: number) => {
    setAnswers(prev => ({ ...prev, [qIndex]: choiceIndex }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        trainingID: trainingID,
        initialQuestions: Object.entries(answers).map(([idx, ans]) => ({
          questionIndex: parseInt(idx),
          correctAnswer: ans
        }))
      };

      const res = await apiCall('/learning-path-answer-initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        console.error("Submission failed");
      }
    } catch (error) {
      console.error("Error submitting assessment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isComplete = questions.length > 0 && Object.keys(answers).length === questions.length;

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <Card className="w-full max-w-3xl h-[85vh] flex flex-col shadow-[0_20px_70px_rgba(0,0,0,0.3)] bg-white relative rounded-[2rem] overflow-hidden border-0">
        
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <BrainCircuit className="h-5 w-5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <Badge variant="warning" className="bg-amber-100 text-amber-800 border-0 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 mb-1">
                Required Assessment
              </Badge>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Initial Skill Assessment</h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50/30 scrollbar-hide">
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-sm text-slate-500 font-medium">Please answer all {questions.length} questions to curate your personalized curriculum.</p>
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="p-6 border border-slate-100 rounded-3xl bg-white shadow-sm hover:border-primary-100 transition-all">
                <div className="flex gap-4 mb-5">
                  <span className="h-7 w-7 rounded-full bg-primary-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-md shadow-primary-200">
                    {qIdx + 1}
                  </span>
                  <p className="font-bold text-base text-slate-800 leading-snug">{q.questions}</p>
                </div>
                <div className="grid grid-cols-1 gap-2.5 ml-11">
                  {q.answerChoices.map((choice, cIdx) => (
                    <label key={cIdx} className={`flex items-center justify-between gap-4 p-3.5 rounded-xl border transition-all cursor-pointer group ${answers[qIdx] === cIdx ? 'bg-white border-primary-500 ring-2 ring-primary-500/20 shadow-sm' : 'bg-white border-slate-100 hover:border-primary-200 shadow-sm'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${answers[qIdx] === cIdx ? 'border-primary-500 bg-primary-500' : 'border-slate-200 group-hover:border-primary-300'}`}>
                          {answers[qIdx] === cIdx && <div className="h-2 w-2 rounded-full bg-white"></div>}
                        </div>
                        <span className="text-sm font-bold text-slate-700 leading-tight">{choice}</span>
                      </div>
                      <input
                        type="radio"
                        name={`question-${qIdx}`}
                        checked={answers[qIdx] === cIdx}
                        onChange={() => handleSelect(qIdx, cIdx)}
                        className="hidden"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className="w-full max-w-[200px] bg-primary-600 hover:bg-primary-700 text-white font-black py-3.5 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Architecting Course...
              </div>
            ) : 'Complete Assessment'}
          </Button>
        </div>

      </Card>
    </div>,
    document.body
  );
}

function FlashcardViewer({ questions }: { questions: PracticeQuestionPair[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  };
  
  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
        <p className="text-slate-400 font-bold">No flashcards available for this module.</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500 py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-primary-500" />
          Practice Flashcards
        </h3>
        <Badge variant="neutral" className="bg-primary-50 text-primary-700 text-xs font-bold uppercase tracking-wider px-3 py-1">
          {currentIndex + 1} of {questions.length}
        </Badge>
      </div>

      <div className="relative perspective-1000 w-full mb-8" style={{ minHeight: '350px' }}>
        <div 
          className={`w-full h-full absolute inset-0 cursor-pointer transition-all duration-300 transform-style-3d ${isFlipped ? 'bg-primary-600 text-white border-primary-600' : 'bg-white border-slate-200 hover:border-primary-300'} border-2 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {!isFlipped ? (
             <div className="flex flex-col items-center justify-center h-full w-full animate-in fade-in zoom-in-95 duration-300">
               <h3 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight mb-8">{currentQ.question}</h3>
               <div className="mt-auto flex items-center gap-2 text-sm text-slate-400 font-bold bg-slate-50 px-4 py-2 rounded-full">
                 <Eye className="h-4 w-4" /> Click to reveal answer
               </div>
             </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full w-full animate-in fade-in zoom-in-95 duration-300">
               <p className="text-xl md:text-2xl font-medium text-white leading-relaxed">{currentQ.answer}</p>
             </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Button 
          onClick={handlePrev} 
          disabled={currentIndex === 0} 
          variant="outline" 
          className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-6 py-6 h-auto rounded-xl"
        >
           <ChevronLeft className="h-5 w-5 mr-1" /> Previous
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={currentIndex === questions.length - 1} 
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-6 h-auto rounded-xl shadow-md shadow-primary-200"
        >
           Next <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}