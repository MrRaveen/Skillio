import { Badge, Button, Card, Input } from "@/app/Components/Ui/Components";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { useState } from "react";
interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
  accessLevel: 'Admin' | 'Manager' | 'Viewer';
  status: 'Active' | 'Inactive';
}

export default function ManagerTab(){
    //-----------------dummy data--------------
    const initialManagers: Manager[] = [
  { id: 'mgr-1', name: 'Sarah Davis', email: 'sarah.davis@acme.com', role: 'VP of Product', accessLevel: 'Admin', status: 'Active' },
  { id: 'mgr-2', name: 'David Wilson', email: 'david.wilson@acme.com', role: 'Engineering Lead', accessLevel: 'Manager', status: 'Active' },
  { id: 'mgr-3', name: 'Emily Chen', email: 'emily.chen@acme.com', role: 'HR Director', accessLevel: 'Admin', status: 'Active' },
  ];

    const [managerSearch, setManagerSearch] = useState('');
    const [managerForm, setManagerForm] = useState({
          name: '',
          email: '',
          role: '',
          accessLevel: 'Manager' as 'Admin' | 'Manager' | 'Viewer'
      });
    const [editingManagerId, setEditingManagerId] = useState<string | null>(null);
    const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
    const [managers, setManagers] = useState<Manager[]>(initialManagers);


    const filteredManagers = managers.filter(m => 
    m.name.toLowerCase().includes(managerSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(managerSearch.toLowerCase()) ||
    m.role.toLowerCase().includes(managerSearch.toLowerCase())
    );
    const handleOpenAddManager = () => {
      setManagerForm({ name: '', email: '', role: '', accessLevel: 'Manager' });
      setEditingManagerId(null);
      setIsManagerModalOpen(true);
    };
    const handleOpenEditManager = (mgr: Manager) => {
      setManagerForm({ name: mgr.name, email: mgr.email, role: mgr.role, accessLevel: mgr.accessLevel });
      setEditingManagerId(mgr.id);
      setIsManagerModalOpen(true);
  };
    const handleDeleteManager = (id: string) => {
      if(confirm('Are you sure you want to remove this manager?')) {
          setManagers(prev => prev.filter(m => m.id !== id));
      }
    };
    const handleSaveManager = () => {
      if (!managerForm.name || !managerForm.email || !managerForm.role) return;

      if (editingManagerId) {
          setManagers(prev => prev.map(m => m.id === editingManagerId ? { ...m, ...managerForm } : m));
      } else {
          const newManager: Manager = {
              id: `mgr-${Date.now()}`,
              ...managerForm,
              status: 'Active'
          };
          setManagers([...managers, newManager]);
      }
      setIsManagerModalOpen(false);
  };
    return(
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Managers</h1>
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Search managers..." 
                        className="w-full sm:w-64"
                        value={managerSearch}
                        onChange={(e) => setManagerSearch(e.target.value)}
                    />
                    <Button onClick={handleOpenAddManager}>
                        <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                </div>
            </div>

            <Card className="overflow-hidden border-0 ring-1 ring-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Access Level</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredManagers.map((mgr) => (
                                <tr key={mgr.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
                                                {mgr.name.substring(0,2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{mgr.name}</div>
                                                <div className="text-xs text-slate-500">{mgr.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{mgr.role}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            mgr.accessLevel === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                                            mgr.accessLevel === 'Manager' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                                        }`}>
                                            {mgr.accessLevel}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={mgr.status === 'Active' ? 'success' : 'neutral'}>{mgr.status}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenEditManager(mgr)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteManager(mgr.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            {/* 7. Manager Modal */}
      {isManagerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <Card className="w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h2 className="text-lg font-bold text-slate-900">{editingManagerId ? 'Edit Manager' : 'Add New Manager'}</h2>
                      <button onClick={() => setIsManagerModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <Input label="Full Name" value={managerForm.name} onChange={e => setManagerForm({...managerForm, name: e.target.value})} />
                      <Input label="Email Address" type="email" value={managerForm.email} onChange={e => setManagerForm({...managerForm, email: e.target.value})} />
                      <Input label="Job Title" value={managerForm.role} onChange={e => setManagerForm({...managerForm, role: e.target.value})} />
                      
                      <div className="space-y-1.5">
                          <label className="text-sm font-medium text-slate-700">Access Level</label>
                          <div className="grid grid-cols-3 gap-2">
                              {['Admin', 'Manager', 'Viewer'].map((level) => (
                                  <div 
                                      key={level}
                                      onClick={() => setManagerForm({...managerForm, accessLevel: level as any})}
                                      className={`text-center py-2 text-sm rounded-lg border cursor-pointer transition-colors ${
                                          managerForm.accessLevel === level 
                                          ? 'bg-primary-50 border-primary-500 text-primary-700 font-medium' 
                                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                      }`}
                                  >
                                      {level}
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setIsManagerModalOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveManager}>Save Manager</Button>
                  </div>
              </Card>
          </div>
      )}
        </div>
    );
}