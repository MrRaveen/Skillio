import { Card, Button, Badge } from "@/app/Components/Ui/Components";
import { useState, useEffect } from "react";
import { apiCall } from "@/app/lib/api";

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
}

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

interface Module {
  moduleTitle: string;
  moduleDescription: string;
  articles: Article[];
  slides: Slide[];
}

interface InitialQuestionEvaluation {
  initialQuestionMarks: number;
  initialQuestionMarksPercent: number;
  totalQuestions: number;
  correctedCount: number;
}

interface TrainingContent {
  title?: string;
  overview?: string;
  initialQuestions: Question[];
  modules: Module[];
  initialQuestionEvaluation?: InitialQuestionEvaluation;
}

interface TrainingRecord {
  id: string;
  trainingStatus: string;
  content: TrainingContent | null;
}

// --- Main Component ---
export default function LearningPathTab() {
  const [trainings, setTrainings] = useState<TrainingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lifted state: Modal is now managed at the root level
  const [activeModule, setActiveModule] = useState<Module | null>(null);

  const fetchTrainings = async () => {
    setIsLoading(true);
    try {
      const res = await apiCall('/employee-learning-path');
      const result = await res.json();
      if (result.status === 'success') {
        setTrainings(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch trainings", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading training paths...</div>;
  }

  if (trainings.length === 0) {
    return <div className="p-8 text-center text-slate-500">No learning paths available.</div>;
  }

  return (
    <div className="space-y-6 p-6 animate-in fade-in relative">
      <h1 className="text-2xl font-bold text-slate-900">Learning Paths</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-0">
        {trainings.map((training) => (
          <Card key={training.id} className="p-6 h-full flex flex-col">
            {(!training.content?.title || !training.content?.overview) ? (
              <AssessmentView
                trainingID={training.id}
                questions={training.content?.initialQuestions || []}
                onSuccess={fetchTrainings}
              />
            ) : (
              <CourseView
                content={training.content}
                status={training.trainingStatus}
                onOpenModule={(module) => setActiveModule(module)}
              />
            )}
          </Card>
        ))}
      </div>

      {/* Root-level Modal prevents z-index/stacking context issues */}
      {activeModule && (
        <ModuleViewer module={activeModule} onClose={() => setActiveModule(null)} />
      )}
    </div>
  );
}

// --- Subcomponents ---

function CourseView({ content, status, onOpenModule }: { content: TrainingContent; status: string; onOpenModule: (m: Module) => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{content.title}</h2>
          <p className="text-sm text-slate-600 mt-2 line-clamp-2">{content.overview}</p>
        </div>
        <Badge variant="neutral" className="uppercase ml-4 shrink-0">{status}</Badge>
      </div>

      {content.initialQuestionEvaluation && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-2">Initial Assessment Results</h3>
          <div className="flex gap-4 text-sm">
            <div className="bg-white px-3 py-2 rounded shadow-sm border border-slate-100">
              <span className="text-slate-500 mr-2">Score:</span>
              <span className="font-bold text-slate-900">{content.initialQuestionEvaluation.initialQuestionMarksPercent}%</span>
            </div>
            <div className="bg-white px-3 py-2 rounded shadow-sm border border-slate-100">
              <span className="text-slate-500 mr-2">Correct:</span>
              <span className="font-bold text-slate-900">{content.initialQuestionEvaluation.correctedCount} / {content.initialQuestionEvaluation.totalQuestions}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-md font-bold text-slate-800">Modules ({content.modules?.length || 0})</h3>
        <div className="space-y-3">
          {content.modules?.map((module, idx) => (
            <div
              key={idx}
              onClick={() => onOpenModule(module)}
              className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm text-slate-800 group-hover:text-primary-700">{idx + 1}. {module.moduleTitle}</h4>
                <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">View Content</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{module.moduleDescription}</p>
            </div>
          ))}
          {(!content.modules || content.modules.length === 0) && (
            <p className="text-sm text-slate-500 text-center p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              Modules are currently being generated by AI...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ModuleViewer({ module, onClose }: { module: Module; onClose: () => void }) {
  const [viewMode, setViewMode] = useState<'article' | 'slides'>('article');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl bg-white relative">

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50 shrink-0 gap-4">
          <div>
            <Badge variant="primary" className="mb-2">Module Details</Badge>
            <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{module.moduleTitle}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggles */}
            <div className="flex bg-slate-200 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('article')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'article' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Articles
              </button>
              <button
                onClick={() => setViewMode('slides')}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewMode === 'slides' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Presentations
              </button>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-500 hover:text-slate-800">
              Close
            </Button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {viewMode === 'article' ? (
            <div className="animate-in fade-in duration-300">
              <p className="text-sm text-slate-600 mb-8 leading-relaxed border-l-4 border-primary-200 pl-4">
                {module.moduleDescription}
              </p>

              <div className="space-y-8">
                {module.articles && module.articles.length > 0 ? (
                  module.articles.map((art, aIdx) => (
                    <div key={aIdx} className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary-500 rounded-full inline-block"></span>
                        {art.articleTitle}
                      </h3>
                      <div className="space-y-3">
                        {art.paragraphs?.map((p, pIdx) => (
                          <p key={pIdx} className="text-sm text-slate-700 leading-relaxed">
                            {p.paragraph}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">No articles are currently available for this module.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col animate-in fade-in duration-300">
              {/* Presentation Iframe */}
              <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-200">
                {module.slides && module.slides.length > 0 && module.slides[0]?.slideLink ? (
                  <iframe
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(module.slides[0].slideLink)}`}
                    className="w-full h-full border-0"
                    title="Presentation"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                    <p className="text-lg font-bold text-slate-300">Presentation Missing</p>
                    <p className="text-slate-500 text-center max-w-xs mt-2">The slide deck for this module is not available.</p>
                  </div>
                )}
              </div>

              {/* Audio Controls */}
              {module.slides && module.slides.length > 0 && module.slides[0]?.voiceCovers && module.slides[0].voiceCovers.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Narrated Audio Slides</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {module.slides[0].voiceCovers.map((vc, vIdx) => (
                      <button
                        key={vIdx}
                        onClick={() => {
                          if (vc.voiceFileLink) {
                            const audio = new Audio(vc.voiceFileLink);
                            audio.play().catch(err => console.error('Failed to play audio:', err));
                          }
                        }}
                        className="p-3 rounded-lg border border-slate-200 hover:border-primary-500 hover:bg-primary-50 transition-all text-left group bg-white shadow-sm"
                      >
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Slide {vc.slideNumber}</div>
                        <div className="text-sm font-bold text-slate-700 mt-1 flex items-center justify-between group-hover:text-primary-700">
                          Play Audio
                          <span className="text-primary-500">▶</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function AssessmentView({ trainingID, questions, onSuccess }: { trainingID: string; questions: Question[]; onSuccess: () => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <Badge variant="warning" className="mb-2 bg-amber-500 text-white border-0">Assessment Required</Badge>
        <h2 className="text-xl font-bold text-slate-900">Initial Skill Assessment</h2>
        <p className="text-sm text-slate-600 mt-1">Answer these questions to generate your personalized course curriculum.</p>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2">
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
            <p className="font-semibold text-sm text-slate-800 mb-3">{qIdx + 1}. {q.questions}</p>
            <div className="space-y-2">
              {q.answerChoices.map((choice, cIdx) => (
                <label key={cIdx} className={`flex items-start gap-3 p-3 rounded border transition-colors cursor-pointer ${answers[qIdx] === cIdx ? 'bg-white border-primary-500 ring-1 ring-primary-500 shadow-sm' : 'bg-white border-slate-200 hover:border-primary-200'}`}>
                  <input
                    type="radio"
                    name={`question-${qIdx}`}
                    checked={answers[qIdx] === cIdx}
                    onChange={() => handleSelect(qIdx, cIdx)}
                    className="mt-0.5 h-4 w-4 text-primary-600"
                  />
                  <span className="text-sm text-slate-700 leading-snug">{choice}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <Button
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white"
        >
          {isSubmitting ? 'Architecting Course...' : 'Submit Assessment'}
        </Button>
      </div>
    </div>
  );
}