import { Button, Card, Input } from "@/app/Components/Ui/Components";
import { Calendar, Download, Plus, ChevronRight, X, Trash2, MoreVertical, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { apiCall } from "@/app/lib/api";

interface TeamMember {
  id: string;
  name: string;
  role: string;
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

export default function StructureTab(){
    const [isLoading, setIsLoading] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);

    const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
    const [createTeamDeptId, setCreateTeamDeptId] = useState<string | null>(null);
    const [createTeamName, setCreateTeamName] = useState('');
    const [createTeamDesc, setCreateTeamDesc] = useState('');
    const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
    
    const [selectedTeam, setSelectedTeam] = useState<{ team: Team, deptId: string } | null>(null);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isEditingTeamInfo, setIsEditingTeamInfo] = useState(false);
    
    const [newMemberId, setNewMemberId] = useState('');
    const [newDeptName, setNewDeptName] = useState('');
    const [newDeptDesc, setNewDeptDesc] = useState('');
    
    const [editingDept, setEditingDept] = useState<{ id: string, name: string, description: string } | null>(null);
    const [isEditDeptModalOpen, setIsEditDeptModalOpen] = useState(false);

    const getId = (item: any) => item._id?.$oid || item.id || '';

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [deptRes, teamRes, empRes, roleRes] = await Promise.all([
                apiCall('/department-manage', { method: 'GET' }),
                apiCall('/team-manage', { method: 'GET' }),
                apiCall('/employee-manage', { method: 'GET' }),
                apiCall('/role-manage', { method: 'GET' })
            ]);

            let deptsData = [], teamsData = [], empsData = [], rolesData: any[] = [];
            if (deptRes.ok) deptsData = (await deptRes.json()).data || [];
            if (teamRes.ok) teamsData = (await teamRes.json()).data || [];
            if (empRes.ok) empsData = (await empRes.json()).data || [];
            if (roleRes.ok) rolesData = (await roleRes.json()).data || [];

            setAllEmployees(empsData);

            const getRoleName = (roleId: string) => {
                const r = rolesData.find(x => getId(x) === roleId);
                return r ? r.roleName : 'Unassigned';
            };

            const structured: Department[] = deptsData.map((d: any) => {
                const deptId = getId(d);
                const deptTeams = teamsData.filter((t: any) => t.departmentID === deptId || getId(t) === deptId /* just in case */).map((t: any) => {
                    const teamId = getId(t);
                    const members = empsData.filter((e: any) => e.teamID === teamId).map((e: any) => ({
                        id: getId(e),
                        name: e.employeeName,
                        role: getRoleName(e.employeeRoleID)
                    }));
                    return {
                        id: teamId,
                        name: t.teamName,
                        description: t.teamDes || '',
                        members
                    };
                });
                return {
                    id: deptId,
                    name: d.deptName,
                    teams: deptTeams
                };
            });

            setDepartments(structured);
            
            // Update selected team if open
            if (isTeamModalOpen && selectedTeam) {
                const updatedDept = structured.find(d => d.id === selectedTeam.deptId);
                if (updatedDept) {
                    const updatedTeam = updatedDept.teams.find(t => t.id === selectedTeam.team.id);
                    if (updatedTeam) {
                        setSelectedTeam({ deptId: updatedDept.id, team: updatedTeam });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch structure data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenCreateTeamModal = (deptId: string) => {
      setCreateTeamDeptId(deptId);
      setCreateTeamName('');
      setCreateTeamDesc('');
      setIsCreateTeamModalOpen(true);
    };

    const handleOpenTeam = (team: Team, deptId: string) => {
        setSelectedTeam({ team: { ...team }, deptId });
        setIsTeamModalOpen(true);
        setIsEditingTeamInfo(false);
        setNewMemberId('');
    };

    const handleAddDepartment = async () => {
        if (!newDeptName.trim()) return;
        try {
            const res = await apiCall('/department-manage', {
                method: 'POST',
                body: JSON.stringify({ deptName: newDeptName, deptDescription: newDeptDesc || 'No description' })
            });
            if (res.ok) {
                await fetchData();
                setIsDeptModalOpen(false);
                setNewDeptName('');
                setNewDeptDesc('');
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to create department');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteDepartment = async (deptId: string) => {
        if (!confirm('Are you sure you want to delete this department? All associated teams will need to be reassigned. This cannot be undone.')) return;
        try {
            const res = await apiCall(`/department-manage/${deptId}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to delete department');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateDepartment = async () => {
        if (!editingDept || !editingDept.name.trim()) return;
        try {
            const res = await apiCall(`/department-manage/${editingDept.id}`, {
                method: 'PUT',
                body: JSON.stringify({ deptName: editingDept.name, deptDescription: editingDept.description })
            });
            if (res.ok) {
                await fetchData();
                setIsEditDeptModalOpen(false);
                setEditingDept(null);
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to update department');
            }
        } catch (error) {
            console.error(error);
        }
    };

   const handleCreateTeam = async () => {
        if (!createTeamDeptId || !createTeamName.trim()) return;
        try {
            const res = await apiCall('/team-manage', {
                method: 'POST',
                body: JSON.stringify({ teamName: createTeamName, teamDes: createTeamDesc, departmentID: createTeamDeptId })
            });
            if (res.ok) {
                await fetchData();
                setIsCreateTeamModalOpen(false);
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to create team');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTeam = async () => {
        if (!selectedTeam) return;
        if (confirm('Are you sure you want to delete this team? This cannot be undone.')) {
            try {
                const res = await apiCall(`/team-manage/${selectedTeam.team.id}`, { method: 'DELETE' });
                if (res.ok) {
                    await fetchData();
                    setIsTeamModalOpen(false);
                } else {
                    const err = await res.json();
                    alert(err.message || 'Failed to delete team');
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleSaveTeamInfo = async () => {
        if (!selectedTeam) return;
        try {
            const res = await apiCall(`/team-manage/${selectedTeam.team.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    teamName: selectedTeam.team.name,
                    teamDes: selectedTeam.team.description,
                    departmentID: selectedTeam.deptId
                })
            });
            if (res.ok) {
                await fetchData();
                setIsEditingTeamInfo(false);
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to update team');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddMember = async () => {
        if (!selectedTeam || !newMemberId) return;
        try {
            // Assign team
            const res = await apiCall(`/employee-manage/${newMemberId}/assign-team`, {
                method: 'PUT',
                body: JSON.stringify({ teamID: selectedTeam.team.id })
            });
            if (res.ok) {
                await fetchData();
                setNewMemberId('');
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to assign team');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!selectedTeam) return;
        if (!confirm('Remove this member from the team?')) return;
        try {
            // Unassign by sending empty string (or null if backend prefers)
            const res = await apiCall(`/employee-manage/${memberId}/assign-team`, {
                method: 'PUT',
                body: JSON.stringify({ teamID: '' })
            });
            if (res.ok) {
                await fetchData();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to remove member');
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;
    }

    return(
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Structure</h1>
            <div className="flex gap-2">
                <Button variant="outline"><Calendar className="h-4 w-4 mr-2" /> This Month</Button>
                <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
            </div>
        </div>

        {/* Team Management Section */}
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Departments & Teams</h2>
                <Button size="sm" onClick={() => setIsDeptModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Department</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {departments.map(dept => (
                    <Card key={dept.id} className="p-0 overflow-hidden border-0 ring-1 ring-slate-200">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center group/header">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900">{dept.name}</h3>
                                <div className="flex opacity-0 group-hover/header:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => {
                                        setEditingDept({ id: dept.id, name: dept.name, description: '' });
                                        setIsEditDeptModalOpen(true);
                                      }}
                                      className="p-1 text-slate-400 hover:text-primary-600 rounded"
                                    >
                                        <Edit2 className="h-3 w-3" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteDepartment(dept.id)}
                                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => handleOpenCreateTeamModal(dept.id)}><Plus className="h-3 w-3 mr-1" /> Add Team</Button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {dept.teams.map(team => (
                                <div key={team.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleOpenTeam(team, dept.id)}>
                                    <div>
                                        <div className="font-medium text-slate-900 text-sm">{team.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{team.members.length} members</div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                </div>
                            ))}
                            {dept.teams.length === 0 && (
                                <div className="p-4 text-center text-xs text-slate-400 italic">No teams yet</div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>

        {/* Create Department Modal */}
        {isDeptModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <Card className="w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Create New Department</h2>
                        <div className="space-y-4">
                            <Input label="Department Name" placeholder="e.g. Marketing" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} />
                            <Input label="Description" placeholder="Optional" value={newDeptDesc} onChange={e => setNewDeptDesc(e.target.value)} />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="ghost" onClick={() => setIsDeptModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddDepartment}>Create</Button>
                        </div>
                    </div>
                </Card>
            </div>
        )}

        {/* Edit Department Modal */}
        {isEditDeptModalOpen && editingDept && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <Card className="w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
                    <div className="p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Edit Department</h2>
                        <div className="space-y-4">
                            <Input 
                                label="Department Name" 
                                value={editingDept.name} 
                                onChange={e => setEditingDept({...editingDept, name: e.target.value})} 
                            />
                            <Input 
                                label="Description" 
                                value={editingDept.description} 
                                onChange={e => setEditingDept({...editingDept, description: e.target.value})} 
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button variant="ghost" onClick={() => { setIsEditDeptModalOpen(false); setEditingDept(null); }}>Cancel</Button>
                            <Button onClick={handleUpdateDepartment}>Save Changes</Button>
                        </div>
                    </div>
                </Card>
            </div>
        )}

        {/* Create Team Modal */}
        {isCreateTeamModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                <Card className="w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
                    <div className="p-6 space-y-4">
                        <h2 className="text-lg font-bold text-slate-900">Create New Team</h2>
                        <Input label="Team Name" placeholder="e.g. Growth Marketing" value={createTeamName} onChange={e => setCreateTeamName(e.target.value)} />
                        <Input label="Description" placeholder="Brief description..." value={createTeamDesc} onChange={e => setCreateTeamDesc(e.target.value)} />
                        <div className="flex justify-end gap-2 mt-2">
                            <Button variant="ghost" onClick={() => setIsCreateTeamModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateTeam}>Create Team</Button>
                        </div>
                    </div>
                </Card>
            </div>
        )}

        {/* Team Management Modal (View/Edit Team) */}
        {isTeamModalOpen && selectedTeam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
               <Card className="w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-200">
                 <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <div>
                       <h2 className="text-xl font-bold text-slate-900">{selectedTeam.team.name}</h2>
                       <p className="text-sm text-slate-500">Team Management</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={handleDeleteTeam}>Delete Team</Button>
                      <button onClick={() => setIsTeamModalOpen(false)} className="text-slate-400 hover:text-slate-600 ml-2"><X className="h-5 w-5" /></button>
                    </div>
                 </div>

                 <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                    {/* Info Section */}
                    <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-slate-900">About</h3>
                          {!isEditingTeamInfo ? (
                            <button onClick={() => setIsEditingTeamInfo(true)} className="text-xs text-primary-600 font-medium hover:underline">Edit</button>
                          ) : (
                            <button onClick={handleSaveTeamInfo} className="text-xs text-emerald-600 font-medium hover:underline">Save</button>
                          )}
                       </div>
                       {isEditingTeamInfo ? (
                         <div className="space-y-3">
                            <Input 
                              label="Name" 
                              value={selectedTeam.team.name} 
                              onChange={(e) => setSelectedTeam({...selectedTeam, team: {...selectedTeam.team, name: e.target.value}})} 
                            />
                            <Input 
                              label="Description" 
                              value={selectedTeam.team.description} 
                              onChange={(e) => setSelectedTeam({...selectedTeam, team: {...selectedTeam.team, description: e.target.value}})} 
                            />
                         </div>
                       ) : (
                         <p className="text-sm text-slate-600">{selectedTeam.team.description || 'No description provided.'}</p>
                       )}
                    </div>

                    {/* Members Section */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                       <h3 className="font-bold text-slate-900 mb-4">Members ({selectedTeam.team.members.length})</h3>
                       
                       {/* Add Member Row */}
                       <div className="flex gap-2 mb-4 items-end">
                          <div className="flex-1 space-y-1.5">
                             <label className="text-sm font-medium text-slate-700">Assign Employee</label>
                             <select 
                               className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
                               value={newMemberId}
                               onChange={(e) => setNewMemberId(e.target.value)}
                             >
                               <option value="">Select an employee...</option>
                               {allEmployees.filter(emp => emp.teamID !== selectedTeam.team.id).map(emp => (
                                 <option key={getId(emp)} value={getId(emp)}>
                                   {emp.employeeName} {emp.teamID ? `(Switching from another team)` : `(Unassigned)`}
                                 </option>
                               ))}
                             </select>
                          </div>
                          <Button onClick={handleAddMember} disabled={!newMemberId}>Assign</Button>
                       </div>

                       <div className="space-y-2">
                          {selectedTeam.team.members.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group">
                               <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                    {member.name.substring(0,2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-slate-900">{member.name}</div>
                                    <div className="text-xs text-slate-500">{member.role}</div>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => handleRemoveMember(member.id)}
                                 className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                 title="Unassign member"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                            </div>
                          ))}
                          {selectedTeam.team.members.length === 0 && <p className="text-sm text-slate-400 italic text-center py-2">No members in this team.</p>}
                       </div>
                    </div>
                 </div>
               </Card>
            </div>
        )}
    </div>
    );
}


