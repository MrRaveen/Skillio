'use client';
import { Card } from "@/app/Components/Ui/Components";
import {
  FileText, Search, Loader2, FolderOpen, Eye, X, Globe, Shield, Lock,
  ChevronDown, ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiCall } from "@/app/lib/api";

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
                <button
                  className="p-2 hover:bg-primary-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="View Document"
                  onClick={() => setPreviewUrl(doc.uploadedUrl)}
                >
                  <Eye className="h-4 w-4 text-primary-600" />
                </button>
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

    </div>
  );
}
