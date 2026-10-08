'use client';
import { Button, Card, Input, Badge } from "@/app/Components/Ui/Components";
import {
  Plus, X, Trash2, Edit2, FileText, FolderOpen, Upload, Eye,
  ChevronDown, ChevronRight, Shield, Lock, Globe, Search, Loader2, FolderPlus
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { apiCall } from "@/app/lib/api";

// ─── Types ───────────────────────────────────────────────────

interface SubCategory { name: string; id: string; }
interface CategoryGroup {
  mainCategory: { name: string; id: string; };
  subCategories: SubCategory[];
}

interface DocRecord {
  _id: { $oid: string } | string;
  documentName: string;
  documentDescription?: string;
  uploadedUrl: string;
  timestamp?: { $date: string } | string;
  isMainCategory: boolean;
  mainCategoryID: string;
  subCategoryID?: string;
  accessLevel: string;
}

interface Role { _id: { $oid: string } | string; roleName: string; }

// ─── Helpers ─────────────────────────────────────────────────

const getId = (item: any): string => item?._id?.$oid || item?._id || item?.id || '';

const accessLevelConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  public:     { label: 'Public',     color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <Globe className="h-3 w-3" /> },
  restricted: { label: 'Restricted', color: 'bg-amber-50 text-amber-700 border-amber-200',     icon: <Shield className="h-3 w-3" /> },
  private:    { label: 'Private',    color: 'bg-red-50 text-red-700 border-red-200',             icon: <Lock className="h-3 w-3" /> },
};

// ═════════════════════════════════════════════════════════════
// COMPONENT
// ═════════════════════════════════════════════════════════════

export default function DocumentsTab() {
  // ── State ──────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [documents, setDocuments] = useState<DocRecord[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccess, setFilterAccess] = useState('all');

  // Category modals
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ catName: '', mainOrSub: 'main' as 'main' | 'sub', mainCatID: '' });
  const [editingCat, setEditingCat] = useState<{ id: string; catName: string; mainOrSub: string; mainCatID: string } | null>(null);

  // Document modals
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    documentName: '', documentDescription: '', uploadedUrl: '',
    mainCategoryID: '', subCategoryID: '', accessLevel: 'public',
    accessEntries: [] as { roleID: string; permission: string }[],
  });
  const [editingDoc, setEditingDoc] = useState<DocRecord | null>(null);

  // Document preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Upload states
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Expanded categories
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  // ── Data Fetching ──────────────────────────────────────────

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [catRes, docRes, roleRes] = await Promise.all([
        apiCall('/get-doc-category-details', { method: 'GET' }),
        apiCall('/document-manage', { method: 'GET' }),
        apiCall('/role-manage', { method: 'GET' }),
      ]);
      if (catRes.ok)  setCategories((await catRes.json()).data || []);
      if (docRes.ok)  setDocuments((await docRes.json()).data || []);
      if (roleRes.ok) setRoles((await roleRes.json()).data || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Category name lookup ───────────────────────────────────

  const catNameMap = new Map<string, string>();
  categories.forEach(g => {
    catNameMap.set(g.mainCategory.id, g.mainCategory.name);
    g.subCategories.forEach(s => catNameMap.set(s.id, s.name));
  });

  const getCatName = (id: string) => catNameMap.get(id) || id;

  // ── Category CRUD ──────────────────────────────────────────

  const handleCreateCategory = async () => {
    try {
      const res = await apiCall('/doc-category-manage', {
        method: 'POST',
        body: JSON.stringify(catForm),
      });
      if (res.ok) { fetchAll(); setIsCatModalOpen(false); resetCatForm(); }
      else { const d = await res.json(); alert(d.message); }
    } catch (e) { console.error(e); }
  };

  const handleUpdateCategory = async () => {
    if (!editingCat) return;
    try {
      const res = await apiCall(`/doc-category-manage/${editingCat.id}`, {
        method: 'PUT',
        body: JSON.stringify({ catName: editingCat.catName, mainOrSub: editingCat.mainOrSub, mainCatID: editingCat.mainCatID }),
      });
      if (res.ok) { fetchAll(); setEditingCat(null); }
      else { const d = await res.json(); alert(d.message); }
    } catch (e) { console.error(e); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Deleting this category will also delete all documents and sub-categories under it. Continue?')) return;
    try {
      const res = await apiCall(`/doc-category-manage/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAll();
      else { const d = await res.json(); alert(d.message); }
    } catch (e) { console.error(e); }
  };

  const resetCatForm = () => setCatForm({ catName: '', mainOrSub: 'main', mainCatID: '' });

  // ── Document CRUD ──────────────────────────────────────────

  const uploadToCloudinary = async (file: File) => {
    const sigRes = await apiCall('/generate-signature', { method: 'GET' });
    if (!sigRes.ok) throw new Error("Failed to generate upload signature");
    const sigData = await sigRes.json();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', sigData.timestamp);
    formData.append('signature', sigData.signature);
    formData.append('api_key', sigData.api_key);
    if (sigData.folder) formData.append('folder', sigData.folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloud_name}/auto/upload`, {
      method: 'POST',
      body: formData
    });

    if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
    const uploadData = await uploadRes.json();
    return uploadData.secure_url;
  };

  const handleCreateDocument = async () => {
    setIsUploading(true);
    try {
      let finalUrl = docForm.uploadedUrl;
      if (uploadFile) {
        finalUrl = await uploadToCloudinary(uploadFile);
      }
      
      if (!finalUrl) {
        alert("Please provide a file or a URL");
        setIsUploading(false);
        return;
      }

      const payload: any = {
        documentName: docForm.documentName,
        documentDescription: docForm.documentDescription,
        uploadedUrl: finalUrl,
        mainCategoryID: docForm.mainCategoryID,
        accessLevel: docForm.accessLevel,
        isMainCategory: !docForm.subCategoryID,
        subCategoryID: docForm.subCategoryID || undefined,
      };
      if (docForm.accessLevel !== 'public' && docForm.accessEntries.length > 0) {
        payload.accessEntries = docForm.accessEntries;
      }
      const res = await apiCall('/document-manage', { method: 'POST', body: JSON.stringify(payload) });
      if (res.ok) { fetchAll(); setIsDocModalOpen(false); resetDocForm(); }
      else { const d = await res.json(); alert(d.message); }
    } catch (e) { 
      console.error(e);
      alert("Error occurred during document creation.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateDocument = async () => {
    if (!editingDoc) return;
    const docId = getId(editingDoc);
    try {
      const res = await apiCall(`/document-manage/${docId}`, {
        method: 'PUT',
        body: JSON.stringify({
          documentName: docForm.documentName,
          documentDescription: docForm.documentDescription,
          mainCategoryID: docForm.mainCategoryID,
          subCategoryID: docForm.subCategoryID || undefined,
          accessLevel: docForm.accessLevel,
          addingRoles: [],
          removingRoles: [],
        }),
      });
      if (res.ok) { fetchAll(); setIsDocModalOpen(false); setEditingDoc(null); resetDocForm(); }
      else { const d = await res.json(); alert(d.message); }
    } catch (e) { console.error(e); }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Delete this document and all its access entries?')) return;
    try {
      const res = await apiCall(`/document-manage/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAll();
      else { const d = await res.json(); alert(d.message); }
    } catch (e) { console.error(e); }
  };

  const resetDocForm = () => {
    setDocForm({
      documentName: '', documentDescription: '', uploadedUrl: '',
      mainCategoryID: '', subCategoryID: '', accessLevel: 'public', accessEntries: [],
    });
    setUploadFile(null);
  };

  const openEditDoc = (doc: DocRecord) => {
    setEditingDoc(doc);
    setDocForm({
      documentName: doc.documentName,
      documentDescription: doc.documentDescription || '',
      uploadedUrl: doc.uploadedUrl,
      mainCategoryID: doc.mainCategoryID,
      subCategoryID: doc.subCategoryID || '',
      accessLevel: doc.accessLevel,
      accessEntries: [],
    });
    setIsDocModalOpen(true);
  };

  // ── Sub-categories for a selected main ─────────────────────

  const getSubsForMain = (mainId: string) => {
    const group = categories.find(g => g.mainCategory.id === mainId);
    return group?.subCategories || [];
  };

  // ── Filtered documents ─────────────────────────────────────

  const filteredDocs = documents.filter(d => {
    const matchesSearch = !search || d.documentName.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === 'all' || d.mainCategoryID === filterCategory || d.subCategoryID === filterCategory;
    const matchesAccess = filterAccess === 'all' || d.accessLevel === filterAccess;
    return matchesSearch && matchesCat && matchesAccess;
  });

  // ── Access entry helpers ───────────────────────────────────

  const addAccessEntry = () => {
    setDocForm(f => ({ ...f, accessEntries: [...f.accessEntries, { roleID: '', permission: 'read' }] }));
  };
  const removeAccessEntry = (idx: number) => {
    setDocForm(f => ({ ...f, accessEntries: f.accessEntries.filter((_, i) => i !== idx) }));
  };
  const updateAccessEntry = (idx: number, key: string, value: string) => {
    setDocForm(f => ({
      ...f,
      accessEntries: f.accessEntries.map((e, i) => i === idx ? { ...e, [key]: value } : e),
    }));
  };

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

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Documents</h2>
          <p className="text-sm text-slate-500 mt-1">Manage document categories and files</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { resetCatForm(); setIsCatModalOpen(true); }}>
            <FolderPlus className="h-4 w-4 mr-1.5" /> Category
          </Button>
          <Button size="sm" onClick={() => { resetDocForm(); setEditingDoc(null); setIsDocModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-1.5" /> Document
          </Button>
        </div>
      </div>

      {/* ── Categories Panel ──────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><FolderOpen className="h-4 w-4 text-primary-500" /> Categories</h3>
        </div>
        <div className="p-4">
          {categories.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No categories yet. Create a main category to get started.</p>
          ) : (
            <div className="space-y-1">
              {categories.map(group => {
                const mainId = group.mainCategory.id;
                const isExpanded = expandedCats.has(mainId);
                return (
                  <div key={mainId}>
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group">
                      <button className="flex items-center gap-2 text-sm font-medium text-slate-800 flex-1 text-left" onClick={() => {
                        setExpandedCats(prev => { const next = new Set(prev); if (next.has(mainId)) next.delete(mainId); else next.add(mainId); return next; });
                      }}>
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                        <FolderOpen className="h-4 w-4 text-primary-500" />
                        {group.mainCategory.name}
                        <span className="text-xs text-slate-400 ml-1">({group.subCategories.length})</span>
                      </button>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-slate-200 rounded" onClick={() => setEditingCat({ id: mainId, catName: group.mainCategory.name, mainOrSub: 'main', mainCatID: '' })}><Edit2 className="h-3.5 w-3.5 text-slate-500" /></button>
                        <button className="p-1 hover:bg-red-100 rounded" onClick={() => handleDeleteCategory(mainId)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                      </div>
                    </div>
                    {isExpanded && group.subCategories.length > 0 && (
                      <div className="ml-8 space-y-0.5 mb-1">
                        {group.subCategories.map(sub => (
                          <div key={sub.id} className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 transition-colors group">
                            <span className="text-sm text-slate-600 flex items-center gap-2">
                              <FileText className="h-3.5 w-3.5 text-slate-400" />
                              {sub.name}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1 hover:bg-slate-200 rounded" onClick={() => setEditingCat({ id: sub.id, catName: sub.name, mainOrSub: 'sub', mainCatID: mainId })}><Edit2 className="h-3.5 w-3.5 text-slate-500" /></button>
                              <button className="p-1 hover:bg-red-100 rounded" onClick={() => handleDeleteCategory(sub.id)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* ── Document List ─────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 shrink-0"><FileText className="h-4 w-4 text-primary-500" /> Documents ({filteredDocs.length})</h3>
          <div className="flex items-center gap-2 flex-1 sm:justify-end">
            <div className="relative flex-1 sm:max-w-[220px]">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white" />
            </div>
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="all">All Categories</option>
              {categories.map(g => (
                <optgroup key={g.mainCategory.id} label={g.mainCategory.name}>
                  <option value={g.mainCategory.id}>{g.mainCategory.name}</option>
                  {g.subCategories.map(s => <option key={s.id} value={s.id}>&nbsp;&nbsp;{s.name}</option>)}
                </optgroup>
              ))}
            </select>
            <select value={filterAccess} onChange={e => setFilterAccess(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="all">All Access</option>
              <option value="public">Public</option>
              <option value="restricted">Restricted</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="py-14 text-center">
            <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No documents found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDocs.map(doc => {
              const docId = getId(doc);
              const acc = accessLevelConfig[doc.accessLevel] || accessLevelConfig.public;
              return (
                <div key={docId} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors group">
                  <div className="h-9 w-9 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.documentName}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {getCatName(doc.mainCategoryID)}{doc.subCategoryID ? ` / ${getCatName(doc.subCategoryID)}` : ''}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${acc.color}`}>{acc.icon}{acc.label}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-primary-50 rounded-lg" title="Preview" onClick={() => setPreviewUrl(doc.uploadedUrl)}><Eye className="h-3.5 w-3.5 text-primary-600" /></button>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg" title="Edit" onClick={() => openEditDoc(doc)}><Edit2 className="h-3.5 w-3.5 text-slate-500" /></button>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete" onClick={() => handleDeleteDocument(docId)}><Trash2 className="h-3.5 w-3.5 text-red-500" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ══════════════════════════════════════════════════════════
          MODALS
         ══════════════════════════════════════════════════════════ */}

      {/* ── Create Category Modal ─────────────────────────────── */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">New Category</h3>
              <button onClick={() => setIsCatModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Category Name" value={catForm.catName} onChange={e => setCatForm(f => ({ ...f, catName: e.target.value }))} placeholder="e.g. HR Policies" />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
                <div className="flex gap-2">
                  {(['main', 'sub'] as const).map(t => (
                    <button key={t} onClick={() => setCatForm(f => ({ ...f, mainOrSub: t, mainCatID: '' }))}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${catForm.mainOrSub === t ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {t === 'main' ? 'Main Category' : 'Sub Category'}
                    </button>
                  ))}
                </div>
              </div>
              {catForm.mainOrSub === 'sub' && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Parent Category</label>
                  <select value={catForm.mainCatID} onChange={e => setCatForm(f => ({ ...f, mainCatID: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                    <option value="">Select parent...</option>
                    {categories.map(g => <option key={g.mainCategory.id} value={g.mainCategory.id}>{g.mainCategory.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <Button variant="outline" size="sm" onClick={() => setIsCatModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreateCategory} disabled={!catForm.catName || (catForm.mainOrSub === 'sub' && !catForm.mainCatID)}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Category Modal ───────────────────────────────── */}
      {editingCat && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Category</h3>
              <button onClick={() => setEditingCat(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Input label="Category Name" value={editingCat.catName} onChange={e => setEditingCat(c => c ? { ...c, catName: e.target.value } : c)} />
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <Button variant="outline" size="sm" onClick={() => setEditingCat(null)}>Cancel</Button>
              <Button size="sm" onClick={handleUpdateCategory} disabled={!editingCat.catName}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create / Edit Document Modal ──────────────────────── */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h3 className="text-base font-bold text-slate-900">{editingDoc ? 'Edit Document' : 'Upload Document'}</h3>
              <button onClick={() => { setIsDocModalOpen(false); setEditingDoc(null); resetDocForm(); }} className="p-1 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1 scrollbar-hide">
              <Input label="Document Name" value={docForm.documentName} onChange={e => setDocForm(f => ({ ...f, documentName: e.target.value }))} placeholder="e.g. Employee Handbook" />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                <textarea value={docForm.documentDescription} onChange={e => setDocForm(f => ({ ...f, documentDescription: e.target.value }))}
                  rows={2} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="Optional description..." />
              </div>

              {!editingDoc && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Document File</label>
                  <input type="file" onChange={e => setUploadFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                  <div className="flex items-center gap-2 my-2">
                    <div className="h-px bg-slate-200 flex-1"></div>
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">OR URL</span>
                    <div className="h-px bg-slate-200 flex-1"></div>
                  </div>
                  <Input value={docForm.uploadedUrl} onChange={e => setDocForm(f => ({ ...f, uploadedUrl: e.target.value }))} placeholder="Paste direct file URL" icon={<Upload className="h-4 w-4 text-slate-400" />} />
                </div>
              )}

              {/* Category Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Main Category</label>
                  <select value={docForm.mainCategoryID} onChange={e => setDocForm(f => ({ ...f, mainCategoryID: e.target.value, subCategoryID: '' }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                    <option value="">Select...</option>
                    {categories.map(g => <option key={g.mainCategory.id} value={g.mainCategory.id}>{g.mainCategory.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Sub Category</label>
                  <select value={docForm.subCategoryID} onChange={e => setDocForm(f => ({ ...f, subCategoryID: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    disabled={!docForm.mainCategoryID || getSubsForMain(docForm.mainCategoryID).length === 0}>
                    <option value="">None (main only)</option>
                    {getSubsForMain(docForm.mainCategoryID).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Access Level */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Access Level</label>
                <div className="flex gap-2">
                  {(['public', 'restricted', 'private'] as const).map(level => {
                    const cfg = accessLevelConfig[level];
                    return (
                      <button key={level} onClick={() => setDocForm(f => ({ ...f, accessLevel: level }))}
                        className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${docForm.accessLevel === level ? cfg.color : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        {cfg.icon}{cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Role-Based Access (for non-public) */}
              {!editingDoc && docForm.accessLevel !== 'public' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">Role Access</label>
                    <button onClick={addAccessEntry} className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"><Plus className="h-3 w-3" /> Add Role</button>
                  </div>
                  {docForm.accessEntries.length === 0 && (
                    <p className="text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg p-3 text-center">No role access entries. Click "Add Role" above.</p>
                  )}
                  <div className="space-y-2">
                    {docForm.accessEntries.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <select value={entry.roleID} onChange={e => updateAccessEntry(idx, 'roleID', e.target.value)}
                          className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                          <option value="">Select role...</option>
                          {roles.map(r => <option key={getId(r)} value={getId(r)}>{r.roleName}</option>)}
                        </select>
                        <select value={entry.permission} onChange={e => updateAccessEntry(idx, 'permission', e.target.value)}
                          className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
                          <option value="read">Read</option>
                          <option value="manage">Manage</option>
                        </select>
                        <button onClick={() => removeAccessEntry(idx)} className="p-1 hover:bg-red-50 rounded"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
              <Button variant="outline" size="sm" onClick={() => { setIsDocModalOpen(false); setEditingDoc(null); resetDocForm(); }}>Cancel</Button>
              <Button size="sm"
                onClick={editingDoc ? handleUpdateDocument : handleCreateDocument}
                disabled={!docForm.documentName || !docForm.mainCategoryID || (!editingDoc && !docForm.uploadedUrl && !uploadFile) || isUploading}>
                {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {editingDoc ? 'Saving...' : 'Uploading...'}</> : (editingDoc ? 'Save' : 'Upload')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Document Preview Modal ────────────────────────────── */}
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
