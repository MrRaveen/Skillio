import { Badge, Button, Card, Input } from "@/app/Components/Ui/Components";
import { Bot, Search, X } from "lucide-react";
import { useState, useEffect } from "react";
import { apiCall } from "@/app/lib/api";

interface Employee {
  employeeID: string;
  employeeName: string;
  employeeRoleID: string;
  roleName: string;
  deptName: string;
  allEmployeeRoleSkills: string[];
  employeeDepartmentID: string;
  teamID: string;
  email: string;
  contactnumber: string;
  address: string;
  profileImageUrl: string;
}

interface TrainerTabProps {
    setIsGlobalLoading?: (loading: boolean) => void;
}

export default function TrainerTab({ setIsGlobalLoading }: TrainerTabProps) {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTraining, setIsTraining] = useState(false);
    const [trainerSearch, setTrainerSearch] = useState('');
    const [selectedTrainee, setSelectedTrainee] = useState<Employee | null>(null);
    const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
    const [practiceMidTestsCount, setPracticeMidTestsCount] = useState<number>(1);
    const [questionCountForSet, setQuestionCountForSet] = useState<number>(5);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await apiCall('/employee-manage');
                const result = await res.json();
                if (result.status === 'success') {
                    setEmployees(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch employees", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleTrain = async () => {
        if (!selectedTrainee) return;
        setIsTraining(true);
        if (setIsGlobalLoading) setIsGlobalLoading(true);
        try {
            const res = await apiCall('/start-training', {
                method: 'POST',
                body: JSON.stringify({
                    target_skills: selectedTrainee.allEmployeeRoleSkills,
                    role: selectedTrainee.roleName,
                    employeeID: selectedTrainee.employeeID,
                    practiceMidTestsCount: practiceMidTestsCount,
                    questionCountForSet: questionCountForSet
                })
            });
            const result = await res.json();
            if (result.status === 'success') {
                setIsTrainerModalOpen(false);
                setIsTraining(false);
            } else {
                alert(`Error: ${result.message}`);
                setIsTraining(false);
            }
        } catch (error) {
            console.error("Training request failed", error);
            setIsTraining(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.employeeName.toLowerCase().includes(trainerSearch.toLowerCase()) ||
        emp.roleName.toLowerCase().includes(trainerSearch.toLowerCase()) ||
        emp.deptName.toLowerCase().includes(trainerSearch.toLowerCase())
    );

    const handleOpenTrainer = (employee: Employee) => {
        setSelectedTrainee(employee);
        setIsTrainerModalOpen(true);
    };

    return(
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h1 className="text-2xl font-bold text-slate-900">AI Trainer</h1>
                  <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Search employees to train..." 
                        className="pl-10 w-full sm:w-64"
                        value={trainerSearch}
                        onChange={(e) => setTrainerSearch(e.target.value)}
                      />
                  </div>
                </div>

                <Card className="overflow-hidden border-0 ring-1 ring-slate-200 shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50/50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Employee</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Role</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Department</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredEmployees.map((emp, index) => (
                            <tr key={emp.employeeID || `emp-${index}`} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                    {emp.employeeName.substring(0,2).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-slate-900">{emp.employeeName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">{emp.roleName}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{emp.deptName}</td>
                              <td className="px-6 py-4 text-right">
                                <Button size="sm" onClick={() => handleOpenTrainer(emp)}>
                                  <Bot className="h-4 w-4 mr-2" /> Select
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {isLoading && (
                      <div className="p-8 text-center text-slate-500">Loading employees...</div>
                    )}
                    {!isLoading && filteredEmployees.length === 0 && (
                      <div className="p-8 text-center text-slate-500">No employees found.</div>
                    )}
                  </div>
                  {/**
                   * training popup
                   */}
                {isTrainerModalOpen && selectedTrainee && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900">AI Skill Trainer</h2>
                        <button onClick={() => setIsTrainerModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                            {selectedTrainee.employeeName.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                            <h3 className="font-bold text-slate-900">{selectedTrainee.employeeName}</h3>
                            <p className="text-sm text-slate-500">{selectedTrainee.roleName}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-700 mb-3">Identified Skills</h4>
                            <div className="flex flex-wrap gap-2">
                            {selectedTrainee.allEmployeeRoleSkills.map((s, index) => (
                                <Badge key={`${s}-${index}`} variant="neutral">{s}</Badge>
                            ))}
                            {selectedTrainee.allEmployeeRoleSkills.length === 0 && (
                                <span className="text-sm text-slate-400 italic">No skills defined for this role</span>
                            )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="text-sm font-bold text-slate-700 mb-2 block">
                                Practice Mid Tests Count
                            </label>
                            <Input 
                                type="number" 
                                min={1} 
                                value={practiceMidTestsCount} 
                                onChange={(e) => setPracticeMidTestsCount(parseInt(e.target.value) || 1)}
                                className="w-full"
                            />
                        </div>

                        <div className="mt-4">
                            <label className="text-sm font-bold text-slate-700 mb-2 block">
                                Questions per Set
                            </label>
                            <Input 
                                type="number" 
                                min={1} 
                                value={questionCountForSet} 
                                onChange={(e) => setQuestionCountForSet(parseInt(e.target.value) || 1)}
                                className="w-full"
                            />
                        </div>

                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsTrainerModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleTrain} disabled={isTraining}>
                            {isTraining ? 'Generating Plan...' : 'Start Training Session'}
                        </Button>
                        </div>
                    </Card>
                    </div>
                )}
                </Card>
              </div>
    );
}

