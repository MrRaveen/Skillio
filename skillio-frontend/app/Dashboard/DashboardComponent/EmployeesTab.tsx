import { Button, Card, Input } from "@/app/Components/Ui/Components";
import { Edit2, Search, Trash2, UserPlus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { apiCall } from "@/app/lib/api";

// Matches allEmployeeRes from backend
interface Employee {
  employeeID?: string;
  employeeName?: string;
  employeeRoleID?: string;
  roleName?: string;
  deptName?: string;
  allEmployeeRoleSkills?: string[];
  employeeDepartmentID?: string;
  teamID?: string;
  email?: string;
  contactnumber?: string;
  address?: string;
  profileImageUrl?: string;
}

interface Department {
  _id?: { $oid: string };
  id?: string;
  deptName: string;
}

interface Team {
  _id?: { $oid: string };
  id?: string;
  teamName: string;
  departmentID: string;
}

interface Role {
  _id?: { $oid: string };
  id?: string;
  roleName: string;
}

const getId = (item: any): string => item._id?.$oid || item.id || '';

// Blank form state - matches createEmployeeReq / updateEmployeeByIDReq
const blankForm = {
  employeeName: '',
  email: '',
  password: '',
  employeeRoleID: '',
  employeeDepartmentID: '',
  teamID: '',
  contactnumber: '',
  address: '',
  profileImageUrl: '',
  autoGeneratePassStatus: true,
};

export default function EmployeesTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isEditingEmp, setIsEditingEmp] = useState(false);
  const [currentEmpId, setCurrentEmpId] = useState<string | null>(null);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields - exactly matching createEmployeeReq / updateEmployeeByIDReq
  const [form, setForm] = useState(blankForm);

  const setField = (field: keyof typeof blankForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [empRes, deptRes, teamRes, roleRes] = await Promise.all([
        apiCall('/employee-manage', { method: 'GET' }),
        apiCall('/department-manage', { method: 'GET' }),
        apiCall('/team-manage', { method: 'GET' }),
        apiCall('/role-manage', { method: 'GET' }),
      ]);
      if (empRes.ok) { const d = await empRes.json(); if (d.data) setEmployees(d.data); }
      if (deptRes.ok) { const d = await deptRes.json(); if (d.data) setDepartments(d.data); }
      if (teamRes.ok) { const d = await teamRes.json(); if (d.data) setTeams(d.data); }
      if (roleRes.ok) { const d = await roleRes.json(); if (d.data) setRoles(d.data); }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredEmployees = employees.filter(emp =>
    (emp.employeeName?.toLowerCase().includes(employeeSearch.toLowerCase())) ||
    (emp.roleName?.toLowerCase().includes(employeeSearch.toLowerCase())) ||
    (emp.deptName?.toLowerCase().includes(employeeSearch.toLowerCase())) ||
    (emp.email?.toLowerCase().includes(employeeSearch.toLowerCase())) ||
    (emp.contactnumber?.toLowerCase().includes(employeeSearch.toLowerCase()))
  );

  const handleOpenAddEmp = () => {
    setIsEditingEmp(false);
    setCurrentEmpId(null);
    setForm(blankForm);
    setIsEmpModalOpen(true);
  };

  const handleOpenEditEmp = (emp: Employee) => {
    setIsEditingEmp(true);
    setCurrentEmpId(emp.employeeID ?? null);
    setForm({
      employeeName: emp.employeeName ?? '',
      email: emp.email ?? '',
      password: '', // Don't show existing password
      employeeRoleID: emp.employeeRoleID ?? '',
      employeeDepartmentID: emp.employeeDepartmentID ?? '',
      teamID: emp.teamID ?? '',
      contactnumber: emp.contactnumber ?? '',
      address: emp.address ?? '',
      profileImageUrl: emp.profileImageUrl ?? '',
    });
    setIsEmpModalOpen(true);
  };

  const handleSaveEmployee = async () => {
    if (!form.employeeName || !form.email || (!isEditingEmp && !form.autoGeneratePassStatus && !form.password)) {
      alert('Missing required fields. Please ensure name, email, and password (if not auto-generated) are provided.');
      return;
    }

    // Build payload strictly matching the API schema
    const payload: Record<string, any> = {
      employeeName: form.employeeName,
      email: form.email,
    };
    if (form.password) payload.password = form.password;
    if (form.employeeRoleID) payload.employeeRoleID = form.employeeRoleID;
    if (form.employeeDepartmentID) payload.employeeDepartmentID = form.employeeDepartmentID;
    if (form.teamID) payload.teamID = form.teamID;
    if (form.contactnumber) payload.contactnumber = form.contactnumber;
    if (form.address) payload.address = form.address;
    if (form.profileImageUrl) payload.profileImageUrl = form.profileImageUrl;
    payload.autoGeneratePassStatus = form.autoGeneratePassStatus;

    setIsSaving(true);
    console.log('Saving employee payload:', payload);
    try {
      let res: Response;
      if (isEditingEmp && currentEmpId) {
        // PUT /employee-manage/<employeeID>
        res = await apiCall(`/employee-manage/${currentEmpId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        // POST /employee-manage
        res = await apiCall('/employee-manage', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        await fetchData();
        setIsEmpModalOpen(false);
      } else {
        const err = await res.json();
        let errMsg = err.message || 'Failed to save employee';
        if (err.errors && Array.isArray(err.errors)) {
          const detailedErrors = err.errors.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join('\n');
          errMsg += `\n\nDetails:\n${detailedErrors}`;
        }
        alert(errMsg);
      }
    } catch (error) {
      console.error('Error saving employee', error);
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      const res = await apiCall(`/employee-manage/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmployees(prev => prev.filter(e => e.employeeID !== id));
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to delete');
      }
    } catch (err) {
      console.error('Failed to delete employee', err);
    }
  };

  // Filter teams based on selected department
  const filteredTeams = teams.filter(t => t.departmentID === form.employeeDepartmentID);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search employees..."
              className="pl-10 w-full sm:w-64"
              value={employeeSearch}
              onChange={e => setEmployeeSearch(e.target.value)}
            />
          </div>
          <Button onClick={handleOpenAddEmp}>
            <UserPlus className="h-4 w-4 mr-2" /> Add Employee
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-0 ring-1 ring-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Department</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp, index) => (
                  <tr key={emp.employeeID || `emp-${index}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                          {emp.employeeName ? emp.employeeName.substring(0, 2).toUpperCase() : '?'}
                        </div>
                        <span className="font-medium text-slate-900">{emp.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.contactnumber || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.roleName || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{emp.deptName || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditEmp(emp)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.employeeID!)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Employee Modal (Add / Edit) */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-900">
                {isEditingEmp ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button onClick={() => setIsEmpModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body - scrollable */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">

              {/* Required fields */}
              <Input
                label="Full Name *"
                placeholder="e.g. John Doe"
                value={form.employeeName}
                onChange={setField('employeeName')}
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="e.g. john@company.com"
                value={form.email}
                onChange={setField('email')}
              />
              <Input
                label={isEditingEmp ? "New Password (leave blank to keep current)" : "Password *"}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={setField('password')}
                disabled={form.autoGeneratePassStatus}
              />

              {!isEditingEmp && (
                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="autoGenPass"
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    checked={form.autoGeneratePassStatus}
                    onChange={(e) => setForm(prev => ({ ...prev, autoGeneratePassStatus: e.target.checked }))}
                  />
                  <label htmlFor="autoGenPass" className="text-sm font-medium text-slate-700 cursor-pointer">
                    Auto-generate secure password
                  </label>
                </div>
              )}

              {/* Role dropdown */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Role</label>
                <select
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  value={form.employeeRoleID}
                  onChange={setField('employeeRoleID')}
                >
                  <option value="">Select Role...</option>
                  {roles.map(r => (
                    <option key={getId(r)} value={getId(r)}>{r.roleName}</option>
                  ))}
                </select>
              </div>

              {/* Department dropdown */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Department</label>
                <select
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  value={form.employeeDepartmentID}
                  onChange={e => setForm(prev => ({ ...prev, employeeDepartmentID: e.target.value, teamID: '' }))}
                >
                  <option value="">Select Department...</option>
                  {departments.map(d => (
                    <option key={getId(d)} value={getId(d)}>{d.deptName}</option>
                  ))}
                </select>
              </div>

              {/* Team dropdown - filtered by selected department */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Team</label>
                <select
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-50 disabled:text-slate-400"
                  value={form.teamID}
                  onChange={setField('teamID')}
                  disabled={!form.employeeDepartmentID}
                >
                  <option value="">{form.employeeDepartmentID ? 'Select Team...' : 'Select a department first'}</option>
                  {filteredTeams.map(t => (
                    <option key={getId(t)} value={getId(t)}>{t.teamName}</option>
                  ))}
                </select>
              </div>

              {/* Optional fields */}
              <Input
                label="Contact Number"
                placeholder="e.g. +94 77 123 4567"
                value={form.contactnumber}
                onChange={setField('contactnumber')}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Address</label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 min-h-[72px] resize-none"
                  placeholder="e.g. 123 Main St, Colombo"
                  value={form.address}
                  onChange={setField('address')}
                />
              </div>
              <Input
                label="Profile Image URL"
                placeholder="https://..."
                value={form.profileImageUrl}
                onChange={setField('profileImageUrl')}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
              <Button variant="ghost" onClick={() => setIsEmpModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveEmployee} disabled={isSaving || !form.employeeName || !form.email}>
                {isSaving ? 'Saving...' : isEditingEmp ? 'Save Changes' : 'Add Employee'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}