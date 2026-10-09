'use client';
import { Card } from "@/app/Components/Ui/Components";
import {
  FileText, Search, Loader2, FolderOpen, Eye, X, Globe, Shield, Lock,
  ChevronDown, ChevronRight, BrainCircuit, Send, ChevronUp, AlertCircle
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { apiCall } from "@/app/lib/api";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─── Types ───────────────────────────────────────────────────

interface DocCategory {
  mainCat: { name: string; id: string } | null;
  subCat: { name: string; id: string } | null;
}

interface EmployeeDoc {
  _id: string;
  documentName: string;
  documentDescription?: string;
  uploadedUrl: string;
  timestamp?: string;
  accessLevel: string;
  categories: DocCategory;
}

// ─── Helpers ─────────────────────────────────────────────────

const accessLevelConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  public:     { label: 'Public',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <Globe className="h-3 w-3" /> },
  restricted: { label: 'Restricted', color: 'bg-amber-50 text-amber-700 border-amber-200',     icon: <Shield className="h-3 w-3" /> },
  private:    { label: 'Private',    color: 'bg-red-50 text-red-700 border-red-200',             icon: <Lock className="h-3 w-3" /> },
};

// ═════════════════════════════════════════════════════════════

export default function EmployeeDocumentsTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<EmployeeDoc[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // ── RAG Q&A state ────────────────────────────────────────
  const [qaDoc, setQaDoc] = useState<EmployeeDoc | null>(null);
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaContext, setQaContext] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaError, setQaError] = useState('');
  const [qaShowContext, setQaShowContext] = useState(false);
  const qaInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──────────────────────────────────────────────────

  useEffect(() => {
    const fetchDocs = async () => {
      setIsLoading(true);
      try {
        const res = await apiCall('/documents', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.data || []);
        }
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    fetchDocs();
  }, []);

  // ── RAG Q&A handlers ───────────────────────────────────────

  const openQaModal = (doc: EmployeeDoc) => {
    setQaDoc(doc);
    setQaQuestion('');
    setQaAnswer('');
    setQaContext('');
    setQaError('');
    setQaShowContext(false);
    setTimeout(() => qaInputRef.current?.focus(), 100);
  };

  const handleAskQuestion = async () => {
    if (!qaDoc || !qaQuestion.trim()) return;
    setQaLoading(true);
    setQaAnswer('');
    setQaContext('');
    setQaError('');
    try {
      const dispatchRes = await apiCall('/employee/document-qa', {
        method: 'POST',
        body: JSON.stringify({ documentID: qaDoc._id, question: qaQuestion.trim() }),
      });
      if (!dispatchRes.ok) {
        const d = await dispatchRes.json();
        setQaError(d.message || 'Failed to start task');
        setQaLoading(false);
        return;
      }
      const { taskID } = await dispatchRes.json();

      let attempts = 0;
      const poll = async (): Promise<void> => {
        if (attempts++ > 60) {
          setQaError('Timed out. The model is taking too long to respond.');
          setQaLoading(false);
          return;
        }
        const pollRes = await apiCall(`/employee/document-qa/${taskID}`);
        const data = await pollRes.json();
        if (data.status === 'processing') {
          await new Promise(r => setTimeout(r, 2000));
          return poll();
        }
        if (data.status === 'success') {
          setQaAnswer(data.answer || '');
          setQaContext(data.context || '');
        } else {
          setQaError(data.message || 'An error occurred');
        }
        setQaLoading(false);
      };
      await poll();
    } catch (e) {
      setQaError('Network error. Please try again.');
      setQaLoading(false);
    }
  };

  // ── Build grouped view ─────────────────────────────────────

  const mainCatSet = new Map<string, { name: string; id: string }>();
  documents.forEach(d => {
    const mc = d.categories?.mainCat;
    if (mc && mc.id) mainCatSet.set(mc.id, mc);
  });
  const mainCategories = Array.from(mainCatSet.values());

  // ── Filters ────────────────────────────────────────────────

  const filteredDocs = documents.filter(d => {
    const matchesSearch = !search || d.documentName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === 'all' ||
      d.categories?.mainCat?.id === filterCategory ||
      d.categories?.subCat?.id === filterCategory;
    return matchesSearch && matchesCat;
  });

  // ── Render ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
        <p className="text-sm text-slate-500 mt-1">Access company documents shared with you</p>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="all">All Categories</option>
          {mainCategories.map(mc => <option key={mc.id} value={mc.id}>{mc.name}</option>)}
        </select>
      </div>

      {/* ── Document List ───────────────────────────────────── */}
      {filteredDocs.length === 0 ? (
        <Card className="py-16 text-center">
          <FileText className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No documents available</p>
          <p className="text-xs text-slate-300 mt-1">Documents shared with your role will appear here</p>
        </Card>
      ) : (
        <Card className="overflow-hidden divide-y divide-slate-100">
          {filteredDocs.map(doc => {
            const acc = accessLevelConfig[doc.accessLevel] || accessLevelConfig.public;
            const mainCatName = doc.categories?.mainCat?.name || 'Uncategorized';
            const subCatName = doc.categories?.subCat?.name;
            return (
              <div key={doc._id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors group">
                <div className="h-10 w-10 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{doc.documentName}</p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {mainCatName}{subCatName ? ` / ${subCatName}` : ''}
                  </p>
                  {doc.documentDescription && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{doc.documentDescription}</p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${acc.color}`}>{acc.icon}{acc.label}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-2 hover:bg-violet-50 rounded-lg transition-colors"
                    title="Ask AI"
                    onClick={() => openQaModal(doc)}
                  >
                    <BrainCircuit className="h-4 w-4 text-violet-500" />
                  </button>
                  <button
                    className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                    title="View Document"
                    onClick={() => setPreviewUrl(doc.uploadedUrl)}
                  >
                    <Eye className="h-4 w-4 text-primary-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* ── Document Preview Modal ──────────────────────────── */}
      {previewUrl && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 shrink-0 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700 truncate flex-1 mr-4">Document Preview</h3>
              <button onClick={() => setPreviewUrl(null)} className="p-1.5 hover:bg-slate-200 rounded-lg"><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <div className="flex-1 bg-slate-100">
              {previewUrl.toLowerCase().endsWith('.pdf') || previewUrl.toLowerCase().includes('/pdf') || previewUrl.toLowerCase().includes('pdf') ? (
                <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full border-none" title="Document Preview" />
              ) : previewUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) ? (
                <div className="w-full h-full flex items-center justify-center p-6">
                  <img src={previewUrl} alt="Document preview" className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
                </div>
              ) : (
                <iframe src={previewUrl} className="w-full h-full border-none" title="Document Preview" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── RAG Q&A Modal ─────────────────────────────────────── */}
      {qaDoc && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white shrink-0">
              <div className="h-9 w-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <BrainCircuit className="h-5 w-5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">Ask AI about this document</p>
                <p className="text-xs text-slate-400 truncate">{qaDoc.documentName}</p>
              </div>
              <button onClick={() => setQaDoc(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {!qaAnswer && !qaLoading && !qaError && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-violet-50 flex items-center justify-center mb-4">
                    <BrainCircuit className="h-7 w-7 text-violet-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Ask anything about this document</p>
                  <p className="text-xs text-slate-400 mt-1">The AI will search relevant passages and answer your question</p>
                </div>
              )}

              {qaLoading && (
                <div className="flex items-center gap-3 bg-violet-50 rounded-xl px-5 py-4">
                  <Loader2 className="h-5 w-5 text-violet-500 animate-spin shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-violet-800">Analysing document…</p>
                    <p className="text-xs text-violet-500 mt-0.5">Retrieving context and generating answer</p>
                  </div>
                </div>
              )}

              {qaError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{qaError}</p>
                </div>
              )}

              {qaAnswer && (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
                    <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">AI Answer</p>
                    <div className="text-sm text-slate-800 leading-relaxed overflow-x-auto">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-4 mb-2 text-slate-900" {...props}/>,
                          h2: ({node, ...props}) => <h2 className="text-md font-bold mt-4 mb-2 text-slate-900" {...props}/>,
                          h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-3 mb-2 text-slate-900" {...props}/>,
                          p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props}/>,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props}/>,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props}/>,
                          li: ({node, ...props}) => <li className="pl-1" {...props}/>,
                          strong: ({node, ...props}) => <strong className="font-semibold text-violet-900" {...props}/>,
                          table: ({node, ...props}) => <div className="overflow-x-auto mb-3"><table className="w-full text-left border-collapse" {...props}/></div>,
                          th: ({node, ...props}) => <th className="border-b-2 border-slate-200 py-2 px-3 bg-slate-100 font-semibold" {...props}/>,
                          td: ({node, ...props}) => <td className="border-b border-slate-200 py-2 px-3" {...props}/>,
                          code: ({node, className, children, ...props}) => {
                            const match = /language-(\w+)/.exec(className || '')
                            const isInline = !match && !className;
                            return isInline ? (
                              <code className="bg-slate-200 text-violet-800 px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
                            ) : (
                              <pre className="bg-slate-900 text-slate-50 p-3 rounded-lg overflow-x-auto mb-3 text-xs font-mono">
                                <code className={className} {...props}>{children}</code>
                              </pre>
                            )
                          }
                        }}
                      >
                        {qaAnswer}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {qaContext && (
                    <div>
                      <button
                        onClick={() => setQaShowContext(v => !v)}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {qaShowContext ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {qaShowContext ? 'Hide' : 'Show'} source context
                      </button>
                      {qaShowContext && (
                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
                          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Retrieved context</p>
                          <p className="text-xs text-amber-900 whitespace-pre-wrap leading-relaxed font-mono">{qaContext}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <input
                  ref={qaInputRef}
                  type="text"
                  value={qaQuestion}
                  onChange={e => setQaQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !qaLoading && handleAskQuestion()}
                  placeholder="Type your question and press Enter…"
                  disabled={qaLoading}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50"
                />
                <button
                  onClick={handleAskQuestion}
                  disabled={qaLoading || !qaQuestion.trim()}
                  className="h-10 w-10 rounded-xl bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 disabled:opacity-40 transition-colors shrink-0"
                >
                  {qaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
