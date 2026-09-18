'use client';
import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, TrendingUp, Settings, 
  Bell, Search, LogOut, Plus, MoreHorizontal,
  Award, ArrowUpRight, Menu, X, CreditCard, Layers, Trash2, AlertCircle,
  Briefcase, Edit2, ChevronLeft, Save, Check, UserPlus, UserMinus, Filter, MoreVertical,
  GraduationCap, Clock, PlayCircle, BarChart, Calendar, ChevronRight, Shield, FileText, Eye, Download,
  Building, MapPin, Globe, Mail, Phone, Camera, BrainCircuit, TrendingDown, Lock, Bot,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { Card, Button, Badge, Input } from './Ui/Components';
import { CompanyDetails } from '../types';

interface DashboardProps {
  companyDetails: CompanyDetails;
  onLogout: () => void;
}

// --- Types ---
interface JobRoleSkill {
  skillName: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  importance: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface JobRole {
  id: string;
  name: string;
  description: string;
  skills: JobRoleSkill[];
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
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

interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  category: 'Technical' | 'Soft Skills' | 'Leadership' | 'Product';
  image: string;
  description: string;
  enrolledCount: number;
  modules: number;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  role: string;
  accessLevel: 'Admin' | 'Manager' | 'Viewer';
  status: 'Active' | 'Inactive';
}

interface Report {
  id: string;
  name: string;
  dateCreated: string;
  createdBy: string;
  type: 'Skill Gap' | 'Training ROI' | 'Employee Progress' | 'Department Summary';
  status: 'Ready' | 'Generating' | 'Failed';
  summary: string;
}

interface Prediction {
  id: string;
  name: string;
  role: string;
  skillGrowth: number;
  flightRisk: number;
  performance: number;
  nextRoleFit: number;
}

interface PromotionRec {
  id: string;
  name: string;
  currentRole: string;
  recommendedRole: string;
  readiness: number;
  reason: string;
}

// --- Dummy Data ---
const recommendations = [
  { id: 1, title: 'Advanced React Patterns', type: 'Course', duration: '4h 30m', impact: 'High' },
  { id: 2, title: 'Strategic Leadership 101', type: 'Workshop', duration: '2 days', impact: 'Med' },
  { id: 3, title: 'Figma for Developers', type: 'Course', duration: '6h', impact: 'High' },
];

const employeesList = [
  { name: 'Alex Chen', role: 'Senior Eng', gap: 'Cloud Arch', progress: 80 },
  { name: 'Sarah Jones', role: 'Product Mgr', gap: 'Data Analysis', progress: 45 },
  { name: 'Mike Ross', role: 'Designer', gap: 'Prototyping', progress: 15 },
];

const defaultLibrarySkills = [
  { name: 'Public Speaking', type: 'Soft' },
  { name: 'Negotiation', type: 'Soft' },
  { name: 'Machine Learning', type: 'Hard' },
  { name: 'Kubernetes', type: 'Hard' },
  { name: 'Sales Strategy', type: 'Soft' },
  { name: 'SEO Marketing', type: 'Hard' },
  { name: 'Financial Modeling', type: 'Hard' },
  { name: 'Conflict Resolution', type: 'Soft' },
];

const initialCourses: Course[] = [
  {
    id: 'c-1',
    title: 'Advanced React Patterns & Performance',
    provider: 'Frontend Masters',
    duration: '6h 45m',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
    description: 'Deep dive into composition, rendering patterns, and performance optimization for large scale React applications.',
    enrolledCount: 12,
    modules: 8
  },
  {
    id: 'c-2',
    title: 'Strategic Leadership for Managers',
    provider: 'Harvard Online',
    duration: '4 Weeks',
    category: 'Leadership',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80',
    description: 'Learn to lead with vision, manage team dynamics, and drive organizational change effectively.',
    enrolledCount: 8,
    modules: 12
  },
  {
    id: 'c-3',
    title: 'Data Visualization with D3.js',
    provider: 'Coursera',
    duration: '12h 30m',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    description: 'Master the art of turning complex data sets into interactive and insightful visualizations.',
    enrolledCount: 5,
    modules: 10
  },
  {
    id: 'c-4',
    title: 'Product Psychology Masterclass',
    provider: 'Growth.design',
    duration: '3h 15m',
    category: 'Product',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
    description: 'Understand user behavior triggers and build products that form habits ethically.',
    enrolledCount: 15,
    modules: 6
  },
  {
    id: 'c-5',
    title: 'Enterprise System Design',
    provider: 'Udacity',
    duration: '8 Weeks',
    category: 'Technical',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    description: 'Architect scalable, distributed systems. Covers load balancing, caching, sharding, and microservices.',
    enrolledCount: 24,
    modules: 16
  },
  {
    id: 'c-6',
    title: 'Negotiation & Conflict Resolution',
    provider: 'LinkedIn Learning',
    duration: '2h 50m',
    category: 'Soft Skills',
    image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=600&q=80',
    description: 'Techniques to handle difficult conversations and reach mutually beneficial agreements.',
    enrolledCount: 42,
    modules: 5
  }
];

const initialJobRoles: JobRole[] = [
  {
    id: '1',
    name: 'Senior Frontend Engineer',
    description: 'Responsible for building scalable UI components and architecture.',
    skills: [
      { skillName: 'React', proficiency: 'Expert', importance: 'Critical' },
      { skillName: 'TypeScript', proficiency: 'Advanced', importance: 'High' },
      { skillName: 'UI/UX Design', proficiency: 'Intermediate', importance: 'Medium' }
    ]
  },
  {
    id: '2',
    name: 'Product Manager',
    description: 'Leads product strategy and roadmap execution.',
    skills: [
      { skillName: 'Communication', proficiency: 'Expert', importance: 'Critical' },
      { skillName: 'Data Analysis', proficiency: 'Advanced', importance: 'High' },
      { skillName: 'Leadership', proficiency: 'Advanced', importance: 'High' }
    ]
  }
];

const initialDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Engineering',
    teams: [
      {
        id: 't-1',
        name: 'Frontend Core',
        description: 'Maintains the core React design system and client-side architecture.',
        members: [
          { id: 'm-1', name: 'Alice Johnson', role: 'Lead Engineer' },
          { id: 'm-2', name: 'Bob Smith', role: 'Senior Developer' }
        ]
      },
      {
        id: 't-2',
        name: 'Platform Infrastructure',
        description: 'Handles cloud services, CI/CD, and backend scaling.',
        members: [
          { id: 'm-3', name: 'Charlie Brown', role: 'DevOps Engineer' }
        ]
      }
    ]
  },
  {
    id: 'dept-2',
    name: 'Product & Design',
    teams: [
      {
        id: 't-3',
        name: 'Product Management',
        description: 'Defines roadmap and strategy.',
        members: [
          { id: 'm-4', name: 'Sarah Davis', role: 'VP of Product' }
        ]
      },
      {
        id: 't-4',
        name: 'UX Research',
        description: 'User testing and prototyping.',
        members: [
          { id: 'm-5', name: 'Mike Wilson', role: 'UX Researcher' },
          { id: 'm-6', name: 'Jenny Lee', role: 'Product Designer' }
        ]
      }
    ]
  }
];

const initialManagers: Manager[] = [
  { id: 'mgr-1', name: 'Sarah Davis', email: 'sarah.davis@acme.com', role: 'VP of Product', accessLevel: 'Admin', status: 'Active' },
  { id: 'mgr-2', name: 'David Wilson', email: 'david.wilson@acme.com', role: 'Engineering Lead', accessLevel: 'Manager', status: 'Active' },
  { id: 'mgr-3', name: 'Emily Chen', email: 'emily.chen@acme.com', role: 'HR Director', accessLevel: 'Admin', status: 'Active' },
];

const initialReports: Report[] = [
  { id: 'r-1', name: 'Q3 Skill Gap Analysis', dateCreated: '2023-10-15', createdBy: 'Sarah Davis', type: 'Skill Gap', status: 'Ready', summary: 'Analysis of engineering department skill gaps shows a 15% deficiency in Cloud Architecture skills compared to the quarterly roadmap requirements.' },
  { id: 'r-2', name: 'October Training ROI', dateCreated: '2023-11-01', createdBy: 'Emily Chen', type: 'Training ROI', status: 'Ready', summary: 'Training programs for the sales team resulted in a 12% increase in deal closure rates for the month of October.' },
  { id: 'r-3', name: 'Engineering Onboarding Status', dateCreated: '2023-11-10', createdBy: 'David Wilson', type: 'Employee Progress', status: 'Ready', summary: 'All 5 new hires in Engineering have completed 80% of their mandatory onboarding modules. Time to productivity has decreased by 3 days.' },
];

const initialPredictions: Prediction[] = [
  { id: 'm-1', name: 'Alice Johnson', role: 'Lead Engineer', skillGrowth: 85, flightRisk: 12, performance: 94, nextRoleFit: 92 },
  { id: 'm-2', name: 'Bob Smith', role: 'Senior Developer', skillGrowth: 62, flightRisk: 45, performance: 88, nextRoleFit: 78 },
  { id: 'm-3', name: 'Charlie Brown', role: 'DevOps Engineer', skillGrowth: 45, flightRisk: 65, performance: 76, nextRoleFit: 40 },
  { id: 'm-4', name: 'Sarah Davis', role: 'VP of Product', skillGrowth: 90, flightRisk: 5, performance: 98, nextRoleFit: 95 },
  { id: 'm-5', name: 'Mike Wilson', role: 'UX Researcher', skillGrowth: 75, flightRisk: 25, performance: 82, nextRoleFit: 80 },
  { id: 'm-6', name: 'Jenny Lee', role: 'Product Designer', skillGrowth: 88, flightRisk: 15, performance: 90, nextRoleFit: 85 },
];

const initialPromotionRecs: PromotionRec[] = [
  { id: 'm-2', name: 'Bob Smith', currentRole: 'Senior Developer', recommendedRole: 'Tech Lead', readiness: 88, reason: 'High technical velocity & consistency' },
  { id: 'm-6', name: 'Jenny Lee', currentRole: 'Product Designer', recommendedRole: 'Senior Product Designer', readiness: 92, reason: 'Led redesign project successfully' },
  { id: 'm-1', name: 'Alice Johnson', currentRole: 'Lead Engineer', recommendedRole: 'Engineering Manager', readiness: 85, reason: 'Strong mentorship capabilities' },
];

export const Dashboard: React.FC<DashboardProps> = ({ companyDetails, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Settings State - Skills
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [selectedLibrarySkill, setSelectedLibrarySkill] = useState('');
  const [mySkills, setMySkills] = useState([
    { name: 'React', type: 'Hard' },
    { name: 'TypeScript', type: 'Hard' },
    { name: 'Leadership', type: 'Soft' },
    { name: 'Project Management', type: 'Soft' },
    { name: 'Communication', type: 'Soft' },
    { name: 'UI/UX Design', type: 'Hard' },
    { name: 'Python', type: 'Hard' },
    { name: 'Data Analysis', type: 'Hard' }
  ]);

  // Settings State - Job Roles
  const [isJobRolesModalOpen, setIsJobRolesModalOpen] = useState(false);
  const [jobRoles, setJobRoles] = useState<JobRole[]>(initialJobRoles);
  const [jobRoleMode, setJobRoleMode] = useState<'list' | 'edit' | 'create'>('list');
  const [editingRole, setEditingRole] = useState<JobRole | null>(null);
  
  const [newRoleSkill, setNewRoleSkill] = useState<JobRoleSkill>({
    skillName: '',
    proficiency: 'Intermediate',
    importance: 'Medium'
  });

  // Analytics State - Departments & Teams
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  
  // Edit Team Modal
  const [selectedTeam, setSelectedTeam] = useState<{ team: Team, deptId: string } | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isEditingTeamInfo, setIsEditingTeamInfo] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  // Create Department Modal
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');

  // Create Team Modal
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [createTeamDeptId, setCreateTeamDeptId] = useState<string | null>(null);
  const [createTeamName, setCreateTeamName] = useState('');
  const [createTeamDesc, setCreateTeamDesc] = useState('');

  // --- Employee Management State ---
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isEditingEmp, setIsEditingEmp] = useState(false);
  const [currentEmpId, setCurrentEmpId] = useState<string | null>(null);
  
  // Employee Form State
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empDeptId, setEmpDeptId] = useState('');
  const [empTeamId, setEmpTeamId] = useState('');

  // --- Trainer State ---
  const [trainerSearch, setTrainerSearch] = useState('');
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<any>(null);
  const [trainingPrompt, setTrainingPrompt] = useState('');
  const [isTraining, setIsTraining] = useState(false);

  // --- Managers State ---
  const [managers, setManagers] = useState<Manager[]>(initialManagers);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [managerSearch, setManagerSearch] = useState('');
  const [managerForm, setManagerForm] = useState({
      name: '',
      email: '',
      role: '',
      accessLevel: 'Manager' as 'Admin' | 'Manager' | 'Viewer'
  });
  const [editingManagerId, setEditingManagerId] = useState<string | null>(null);

  // --- Learning Path State ---
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null); // For drill down

  // --- Reports State ---
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [reportSearch, setReportSearch] = useState('');
  const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false);
  const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
  const [selectedReportForView, setSelectedReportForView] = useState<Report | null>(null);
  const [newReportForm, setNewReportForm] = useState({
    name: '',
    date: '',
    type: 'Skill Gap'
  });

  // --- Company Profile State ---
  const [profileData, setProfileData] = useState<CompanyDetails>(companyDetails);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState<CompanyDetails>(companyDetails);

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, id: 'overview' },
    { name: 'Employees', icon: Users, id: 'employees' },
    { name: 'AI Trainer', icon: Bot, id: 'trainer' },
    { name: 'Company', icon: Building, id: 'company' },
    { name: 'Managers', icon: Shield, id: 'managers' },
    { name: 'Learning Paths', icon: BookOpen, id: 'learning' },
    { name: 'Structure', icon: TrendingUp, id: 'analytics' },
    { name: 'Settings', icon: Settings, id: 'settings' },
  ];

  // --- Derived State for Employees Tab ---
  const allEmployees = departments.flatMap(dept =>
    dept.teams.flatMap(team =>
      team.members.map(member => ({
        ...member,
        deptName: dept.name,
        deptId: dept.id,
        teamName: team.name,
        teamId: team.id
      }))
    )
  ).filter(emp =>
    emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.role.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.deptName.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  // --- Derived State for Managers Tab ---
  const filteredManagers = managers.filter(m => 
    m.name.toLowerCase().includes(managerSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(managerSearch.toLowerCase()) ||
    m.role.toLowerCase().includes(managerSearch.toLowerCase())
  );

  // --- Derived State for Reports Tab ---
  const filteredReports = reports.filter(r => 
    r.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
    r.createdBy.toLowerCase().includes(reportSearch.toLowerCase())
  );

  // --- Handlers for Skills ---
  const handleAddCustomSkill = () => {
    if (customSkill.trim()) {
      setMySkills([...mySkills, { name: customSkill, type: 'Custom' }]);
      setCustomSkill('');
    }
  };

  const handleAddLibrarySkill = () => {
    if (selectedLibrarySkill) {
      const skillToAdd = defaultLibrarySkills.find(s => s.name === selectedLibrarySkill);
      if (skillToAdd && !mySkills.some(s => s.name === skillToAdd.name)) {
        setMySkills([...mySkills, skillToAdd]);
      }
      setSelectedLibrarySkill('');
    }
  };

  // --- Handlers for Job Roles ---
  const openJobRoleModal = () => {
    setIsJobRolesModalOpen(true);
    setJobRoleMode('list');
  };

  const handleCreateRole = () => {
    setEditingRole({
      id: Date.now().toString(),
      name: '',
      description: '',
      skills: []
    });
    setJobRoleMode('create');
    setNewRoleSkill({ skillName: '', proficiency: 'Intermediate', importance: 'Medium' });
  };

  const handleEditRole = (role: JobRole) => {
    setEditingRole({ ...role });
    setJobRoleMode('edit');
    setNewRoleSkill({ skillName: '', proficiency: 'Intermediate', importance: 'Medium' });
  };

  const handleDeleteRole = (id: string) => {
    setJobRoles(prev => prev.filter(r => r.id !== id));
  };

  const handleSaveRole = () => {
    if (!editingRole || !editingRole.name.trim()) return;

    if (jobRoleMode === 'create') {
      setJobRoles(prev => [...prev, editingRole]);
    } else {
      setJobRoles(prev => prev.map(r => r.id === editingRole.id ? editingRole : r));
    }
    setJobRoleMode('list');
    setEditingRole(null);
  };

  const addSkillToEditingRole = () => {
    if (!editingRole || !newRoleSkill.skillName) return;
    if (editingRole.skills.some(s => s.skillName === newRoleSkill.skillName)) return;

    setEditingRole({
      ...editingRole,
      skills: [...editingRole.skills, { ...newRoleSkill }]
    });
    setNewRoleSkill(prev => ({ ...prev, skillName: '' }));
  };

  const removeSkillFromEditingRole = (skillName: string) => {
    if (!editingRole) return;
    setEditingRole({
      ...editingRole,
      skills: editingRole.skills.filter(s => s.skillName !== skillName)
    });
  };

  // --- Handlers for Analytics/Teams ---
  const handleOpenTeam = (team: Team, deptId: string) => {
    setSelectedTeam({ team: { ...team }, deptId }); // deepish copy of team
    setIsTeamModalOpen(true);
    setIsEditingTeamInfo(false);
    setNewMemberName('');
    setNewMemberRole('');
  };

  const handleSaveTeamInfo = () => {
    if (!selectedTeam) return;
    // Update the team in the departments state
    setDepartments(prev => prev.map(dept => {
      if (dept.id === selectedTeam.deptId) {
        return {
          ...dept,
          teams: dept.teams.map(t => t.id === selectedTeam.team.id ? selectedTeam.team : t)
        };
      }
      return dept;
    }));
    setIsEditingTeamInfo(false);
  };

  const handleDeleteTeam = () => {
    if (!selectedTeam) return;
    if (confirm('Are you sure you want to delete this team? This cannot be undone.')) {
      setDepartments(prev => prev.map(dept => {
        if (dept.id === selectedTeam.deptId) {
          return {
            ...dept,
            teams: dept.teams.filter(t => t.id !== selectedTeam.team.id)
          };
        }
        return dept;
      }));
      setIsTeamModalOpen(false);
    }
  };

  const handleAddMember = () => {
    if (!selectedTeam || !newMemberName.trim() || !newMemberRole.trim()) return;
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: newMemberName,
      role: newMemberRole
    };

    const updatedTeam = {
      ...selectedTeam.team,
      members: [...selectedTeam.team.members, newMember]
    };

    setSelectedTeam({ ...selectedTeam, team: updatedTeam });
    
    // Also update global state immediately
    setDepartments(prev => prev.map(dept => {
      if (dept.id === selectedTeam.deptId) {
        return {
          ...dept,
          teams: dept.teams.map(t => t.id === selectedTeam.team.id ? updatedTeam : t)
        };
      }
      return dept;
    }));

    setNewMemberName('');
    setNewMemberRole('');
  };

  const handleRemoveMember = (memberId: string) => {
    if (!selectedTeam) return;
    const updatedTeam = {
      ...selectedTeam.team,
      members: selectedTeam.team.members.filter(m => m.id !== memberId)
    };
    setSelectedTeam({ ...selectedTeam, team: updatedTeam });

    setDepartments(prev => prev.map(dept => {
      if (dept.id === selectedTeam.deptId) {
        return {
          ...dept,
          teams: dept.teams.map(t => t.id === selectedTeam.team.id ? updatedTeam : t)
        };
      }
      return dept;
    }));
  };

  // --- New Handlers for Creating Dept/Teams ---
  const handleAddDepartment = () => {
    if (!newDeptName.trim()) return;
    const newDept: Department = {
        id: `dept-${Date.now()}`,
        name: newDeptName,
        teams: []
    };
    setDepartments([...departments, newDept]);
    setNewDeptName('');
    setIsDeptModalOpen(false);
  };

  const handleOpenCreateTeamModal = (deptId: string) => {
      setCreateTeamDeptId(deptId);
      setCreateTeamName('');
      setCreateTeamDesc('');
      setIsCreateTeamModalOpen(true);
  };

  const handleCreateTeam = () => {
      if (!createTeamDeptId || !createTeamName.trim()) return;
      
      const newTeam: Team = {
          id: `team-${Date.now()}`,
          name: createTeamName,
          description: createTeamDesc,
          members: []
      };

      setDepartments(prev => prev.map(dept => {
          if (dept.id === createTeamDeptId) {
              return {
                  ...dept,
                  teams: [...dept.teams, newTeam]
              };
          }
          return dept;
      }));
      
      setIsCreateTeamModalOpen(false);
  };

  // --- Employee Management Handlers ---
  const handleOpenAddEmp = () => {
    setIsEditingEmp(false);
    setEmpName('');
    setEmpRole('');
    setEmpDeptId('');
    setEmpTeamId('');
    setCurrentEmpId(null);
    setIsEmpModalOpen(true);
  };

  const handleOpenEditEmp = (emp: any) => {
    setIsEditingEmp(true);
    setEmpName(emp.name);
    setEmpRole(emp.role);
    setEmpDeptId(emp.deptId);
    setEmpTeamId(emp.teamId);
    setCurrentEmpId(emp.id);
    setIsEmpModalOpen(true);
  };

  // Helper to open employee details from prediction/promo tables
  const handleViewEmployeeDetail = (empId: string) => {
    const foundEmp = allEmployees.find(e => e.id === empId);
    if (foundEmp) {
      handleOpenEditEmp(foundEmp);
    } else {
      // Fallback for demo data that might not be in allEmployees list (e.g. from initialDepartments)
      // Since initialPredictions align with initialDepartments IDs, it should mostly work.
      const mockEmp = initialPredictions.find(p => p.id === empId);
      if(mockEmp) {
          alert(`Employee details for ${mockEmp.name} (ID: ${empId}) would open here.`);
      }
    }
  };

  const handleSaveEmployee = () => {
    if (!empName || !empRole || !empDeptId || !empTeamId) return;

    setDepartments(prev => {
      // Deep clone for safe mutation
      const next = JSON.parse(JSON.stringify(prev)) as Department[];

      // If editing, first remove the employee from their old location
      if (isEditingEmp && currentEmpId) {
        next.forEach(d => {
          d.teams.forEach(t => {
            t.members = t.members.filter(m => m.id !== currentEmpId);
          });
        });
      }

      // Add to the new target team
      const targetDept = next.find(d => d.id === empDeptId);
      if (targetDept) {
        const targetTeam = targetDept.teams.find(t => t.id === empTeamId);
        if (targetTeam) {
          targetTeam.members.push({
            id: (isEditingEmp && currentEmpId) ? currentEmpId : `m-${Date.now()}`,
            name: empName,
            role: empRole
          });
        }
      }

      return next;
    });

    setIsEmpModalOpen(false);
  };

  const handleDeleteEmployeeGlobal = (id: string) => {
    if (!confirm("Are you sure you want to delete this employee? This will remove them from their team.")) return;
    setDepartments(prev => prev.map(d => ({
      ...d,
      teams: d.teams.map(t => ({
        ...t,
        members: t.members.filter(m => m.id !== id)
      }))
    })));
  };

  // --- Trainer Handlers ---
  const handleOpenTrainer = (employee: any) => {
    setSelectedTrainee(employee);
    setTrainingPrompt(`Focus on improving ${employee.role} related skills...`);
    setIsTrainerModalOpen(true);
  };

  const handleTrain = () => {
    setIsTraining(true);
    setTimeout(() => {
      setIsTraining(false);
      setIsTrainerModalOpen(false);
      alert(`Training module generated for ${selectedTrainee.name}!`);
    }, 2000);
  };

  // --- Manager Management Handlers ---
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

  const handleDeleteManager = (id: string) => {
      if(confirm('Are you sure you want to remove this manager?')) {
          setManagers(prev => prev.filter(m => m.id !== id));
      }
  };

  // --- Learning Path Handlers ---
  const handleOpenCourse = (course: Course) => {
    setSelectedCourse(course);
    setSelectedStudent(null); // Reset nested view
    setIsCourseModalOpen(true);
  };

  const handleSelectStudentForCourse = (student: any) => {
    // Simulate fetching specific student progress for this course
    setSelectedStudent({
       ...student,
       progress: Math.floor(Math.random() * 100),
       lastActive: '2 days ago',
       quizScore: Math.floor(Math.random() * 20) + 80 // Random 80-100
    });
  };

  // --- Reports Handlers ---
  const handleOpenCreateReport = () => {
    setNewReportForm({ name: '', date: '', type: 'Skill Gap' });
    setIsCreateReportModalOpen(true);
  };

  const handleCreateReport = () => {
    if (!newReportForm.name || !newReportForm.date) return;
    
    const newReport: Report = {
      id: `r-${Date.now()}`,
      name: newReportForm.name,
      dateCreated: newReportForm.date,
      createdBy: companyDetails.name, // Using company/admin name mock
      type: newReportForm.type as any,
      status: 'Ready',
      summary: 'This is a newly generated report based on the most recent data available in the system. It contains detailed analytics regarding the selected parameters.'
    };

    setReports([newReport, ...reports]);
    setIsCreateReportModalOpen(false);
  };

  const handleViewReport = (report: Report) => {
    setSelectedReportForView(report);
    setIsViewReportModalOpen(true);
  };

  const handleDeleteReport = (id: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      setReports(reports.filter(r => r.id !== id));
    }
  };

  // --- Company Profile Handlers ---
  const handleOpenEditProfile = () => {
    setEditProfileForm({...profileData});
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = () => {
    setProfileData(editProfileForm);
    setIsEditProfileOpen(false);
  };

  const getTabTitle = () => {
    const item = navItems.find(i => i.id === activeTab);
    return item ? item.name : 'Dashboard';
  }
  // Notifications State and the interface
  interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'alert' | 'info' | 'success';
  read: boolean;
}
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Skill Gap Detected', message: 'Engineering team is missing critical React skills.', time: '2 hrs ago', type: 'alert', read: false },
    { id: '2', title: 'Training Completed', message: 'Alice Johnson completed "Advanced React Patterns".', time: '5 hrs ago', type: 'success', read: false },
    { id: '3', title: 'System Update', message: 'Skillio platform will undergo maintenance at midnight.', time: '1 day ago', type: 'info', read: true },
    { id: '4', title: 'New Course Available', message: 'Check out the new "AI for Managers" course.', time: '2 days ago', type: 'info', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar (Desktop & Mobile) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-slate-200 transition-transform duration-300 ease-out md:static md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 bg-white/50">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-600 text-white">
               <span className="text-xs font-bold">S</span>
            </div>
            Skillio
          </div>
          <button className="md:hidden text-slate-500 hover:text-slate-800" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-primary-600' : 'text-slate-400'}`} />
              {item.name}
            </button>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-9 w-9 rounded-full bg-white border border-slate-200 text-primary-600 flex items-center justify-center text-sm font-bold shadow-sm">
               {profileData.name.substring(0,2).toUpperCase()}
             </div>
             <div className="overflow-hidden">
               <p className="truncate text-sm font-medium text-slate-900">{profileData.name}</p>
               <p className="truncate text-xs text-slate-500">Admin Workspace</p>
             </div>
          </div>
          <button onClick={onLogout} className="flex w-full items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-1">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full relative">
        {/* Top Navigation */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
             <button 
               className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
               onClick={() => setIsSidebarOpen(true)}
             >
               <Menu className="h-6 w-6" />
             </button>
             {/* Mobile Title */}
             <span className="md:hidden font-bold text-slate-900 text-lg">{getTabTitle()}</span>
          </div>
          
          <div className="flex items-center justify-end gap-4 w-full">
             <div className="hidden md:block relative w-full max-w-sm ml-auto mr-4">
               <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search..." 
                 className="w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
               />
             </div>
             {/* Notifications Section */}
             <div className="relative">
               <button 
                 className={`relative p-2 rounded-full transition-colors ${isNotificationsOpen ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-100'}`}
                 onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
               >
                 <Bell className="h-5 w-5" />
                 {unreadCount > 0 && (
                   <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                 )}
               </button>

               {isNotificationsOpen && (
                 <>
                   <div className="fixed inset-0 z-30" onClick={() => setIsNotificationsOpen(false)}></div>
                   <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 border border-slate-100 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                     <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                       <h3 className="font-semibold text-slate-900">Notifications</h3>
                       {unreadCount > 0 && (
                         <button onClick={handleMarkAllRead} className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline">
                           Mark all read
                         </button>
                       )}
                     </div>
                     <div className="max-h-[400px] overflow-y-auto">
                       {notifications.length > 0 ? (
                         <div className="divide-y divide-slate-100">
                           {notifications.map((notification) => (
                             <div key={notification.id} className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors ${!notification.read ? 'bg-slate-50/60' : ''}`}>
                               <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                 notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                                 notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                 'bg-blue-100 text-blue-600'
                               }`}>
                                 {notification.type === 'alert' && <AlertCircle className="h-4 w-4" />}
                                 {notification.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                                 {notification.type === 'info' && <Info className="h-4 w-4" />}
                               </div>
                               <div className="flex-1 min-w-0">
                                 <p className={`text-sm font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                   {notification.title}
                                 </p>
                                 <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.message}</p>
                                 <p className="text-[10px] text-slate-400 mt-1.5">{notification.time}</p>
                               </div>
                               {!notification.read && (
                                 <div className="h-2 w-2 rounded-full bg-primary-500 mt-2"></div>
                               )}
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="p-8 text-center">
                           <div className="mx-auto h-12 w-12 text-slate-300 flex items-center justify-center rounded-full bg-slate-50 mb-3">
                             <Bell className="h-6 w-6" />
                           </div>
                           <p className="text-sm text-slate-500">No notifications yet</p>
                         </div>
                       )}
                     </div>
                     {notifications.length > 0 && (
                       <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-center">
                         <button onClick={handleClearNotifications} className="text-xs text-slate-500 hover:text-slate-800 font-medium py-1">
                           Clear all
                         </button>
                       </div>
                     )}
                   </div>
                 </>
               )}
             </div>
             <div className="h-8 w-8 rounded-full bg-slate-200 md:hidden flex items-center justify-center text-xs font-bold text-slate-600">
               {profileData.name.substring(0,2).toUpperCase()}
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 scrollbar-hide">
          <div className="mx-auto max-w-7xl space-y-6">
            
            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header for Desktop */}
                <div className="hidden md:flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="bg-white">Export Report</Button>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Assessment</Button>
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: 'Active Learners', value: '124', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Skills Mapped', value: '843', change: '+5%', icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-100' },
                    { label: 'Avg. Skill Score', value: '7.8', change: '+0.4', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                    { label: 'Training ROI', value: '245%', change: '+24%', icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-100' },
                  ].map((stat, i) => (
                    <Card key={i} className={`p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both border-0 shadow-sm ring-1 ring-slate-200`} style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex items-center justify-between">
                        <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                          <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.change}</span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* AI Predictions & Promotions Tables (Replaced Graphs) */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Predictions Table */}
                  <Card className="p-0 overflow-hidden fill-mode-both shadow-sm border-0 ring-1 ring-slate-200">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                              <BrainCircuit className="h-5 w-5" />
                           </div>
                           <div>
                              <h3 className="text-lg font-bold text-slate-900">AI Performance Predictions</h3>
                              <p className="text-xs text-slate-500">Forecasted metrics based on activity</p>
                           </div>
                        </div>
                        <Badge variant="neutral">Live Updates</Badge>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Employee</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Skill Growth</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Flight Risk</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Performance</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {initialPredictions.map((pred) => (
                                    <tr key={pred.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 text-sm">{pred.name}</div>
                                            <div className="text-xs text-slate-500">{pred.role}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pred.skillGrowth}%` }}></div>
                                                </div>
                                                <span className="text-xs font-bold text-emerald-600">+{pred.skillGrowth}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block ${
                                                pred.flightRisk > 50 ? 'bg-red-50 text-red-600' : 
                                                pred.flightRisk > 20 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                                {pred.flightRisk}% Risk
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-700">{pred.performance}%</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="sm" variant="ghost" onClick={() => handleViewEmployeeDetail(pred.id)}>
                                                View Info
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                  </Card>

                  {/* Promotion Recommendations Table */}
                  <Card className="p-0 overflow-hidden fill-mode-both shadow-sm border-0 ring-1 ring-slate-200">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <Award className="h-5 w-5" />
                           </div>
                           <div>
                              <h3 className="text-lg font-bold text-slate-900">Promotion Recommendations</h3>
                              <p className="text-xs text-slate-500">Candidates ready for next role</p>
                           </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Employee</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Recommendation</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Readiness</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {initialPromotionRecs.map((promo) => (
                                    <tr key={promo.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                                                    {promo.name.substring(0,2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 text-sm">{promo.name}</div>
                                                    <div className="text-xs text-slate-500">{promo.currentRole}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-primary-700">{promo.recommendedRole}</div>
                                            <div className="text-xs text-slate-500 line-clamp-1" title={promo.reason}>{promo.reason}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <div className="flex">
                                                    {[1,2,3,4,5].map(star => (
                                                        <div key={star} className={`h-1.5 w-1.5 rounded-full mx-0.5 ${star <= (promo.readiness / 20) ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                                    ))}
                                                </div>
                                                <span className="text-xs font-bold ml-2 text-slate-700">{promo.readiness}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleViewEmployeeDetail(promo.id)}>
                                                View Info
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                  </Card>
                </div>

              
              </div>
            )}

            {/* --- EMPLOYEES TAB --- */}
            {activeTab === 'employees' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Search employees..." 
                        className="pl-10 w-full sm:w-64"
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleOpenAddEmp}>
                      <UserPlus className="h-4 w-4 mr-2" /> Add Employee
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
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Department</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Team</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allEmployees.length > 0 ? (
                          allEmployees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                                    {emp.name.substring(0,2).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-slate-900">{emp.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">{emp.role}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{emp.deptName}</td>
                              <td className="px-6 py-4 text-sm text-slate-600">{emp.teamName}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleOpenEditEmp(emp)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleDeleteEmployeeGlobal(emp.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                              No employees found matching your search.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* --- TRAINER TAB --- */}
            {activeTab === 'trainer' && (
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
                        {allEmployees
                          .filter(emp => emp.name.toLowerCase().includes(trainerSearch.toLowerCase()))
                          .map((emp) => (
                            <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                    {emp.name.substring(0,2).toUpperCase()}
                                  </div>
                                  <span className="font-medium text-slate-900">{emp.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">{emp.role}</td>
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
                  </div>
                </Card>
              </div>
            )}

            {/* --- COMPANY TAB --- */}
            {activeTab === 'company' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
                      <Button onClick={handleOpenEditProfile}>
                          <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                      </Button>
                  </div>

                  {/* Profile Content */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      {/* Banner */}
                      <div className="h-48 bg-gradient-to-r from-primary-600 to-indigo-700 w-full relative">
                          <div className="absolute inset-0 bg-mesh-color opacity-10 mix-blend-overlay"></div>
                      </div>
                      
                      {/* Main Info */}
                      <div className="px-8 pb-8">
                          <div className="relative -mt-16 mb-6 flex justify-between items-end">
                              <div className="h-32 w-32 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-100">
                                  <div className="h-full w-full bg-slate-100 rounded-xl flex items-center justify-center text-4xl font-bold text-slate-400">
                                      {profileData.name.substring(0,1).toUpperCase()}
                                  </div>
                              </div>
                              <div className="flex gap-3 mb-2">
                                  <a href={profileData.website} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50">
                                      <Globe className="h-4 w-4 mr-2 text-slate-500" /> Website
                                  </a>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                              {/* Left Column: Core Info */}
                              <div className="col-span-2 space-y-8">
                                  <div>
                                      <h2 className="text-3xl font-bold text-slate-900 mb-2">{profileData.name}</h2>
                                      <div className="flex items-center gap-4 text-slate-500 text-sm">
                                          <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1" /> {profileData.industry}</span>
                                          <span className="flex items-center"><Users className="h-4 w-4 mr-1" /> {profileData.size} Employees</span>
                                          <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {profileData.address.city}, {profileData.address.country}</span>
                                      </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                     <Card className="p-4 bg-slate-50/50 border-0">
                                         <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                             <Building className="h-4 w-4 text-primary-600" /> Headquarters
                                         </h3>
                                         <address className="not-italic text-sm text-slate-600 space-y-1">
                                             <p>{profileData.address.street}</p>
                                             <p>{profileData.address.city}, {profileData.address.state} {profileData.address.zipCode}</p>
                                             <p>{profileData.address.country}</p>
                                         </address>
                                     </Card>
                                     <Card className="p-4 bg-slate-50/50 border-0">
                                         <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                             <Phone className="h-4 w-4 text-primary-600" /> Contact Info
                                         </h3>
                                         <div className="text-sm text-slate-600 space-y-2">
                                             <div className="flex items-center gap-2">
                                                 <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                 {profileData.companyEmail}
                                             </div>
                                             <div className="flex items-center gap-2">
                                                 <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                 {profileData.companyContact}
                                             </div>
                                         </div>
                                     </Card>
                                  </div>
                              </div>

                              {/* Right Column: Account Stats */}
                              <div className="space-y-4">
                                  <Card className="p-5 border-l-4 border-l-primary-500">
                                      <h3 className="text-sm font-medium text-slate-500 mb-1">Account Status</h3>
                                      <div className="flex items-center gap-2">
                                          <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                          </span>
                                          <span className="text-lg font-bold text-slate-900">Active</span>
                                      </div>
                                  </Card>
                                  <Card className="p-5">
                                      <h3 className="text-sm font-medium text-slate-500 mb-1">Admin Account</h3>
                                      <p className="text-sm font-semibold text-slate-900">{profileData.ownerEmail}</p>
                                  </Card>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            )}

            {/* --- MANAGERS TAB --- */}
            {activeTab === 'managers' && (
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
                              <Plus className="h-4 w-4 mr-2" /> Add Manager
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
              </div>
            )}

            {/* --- LEARNING PATHS TAB --- */}
            {activeTab === 'learning' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-slate-900">Learning Paths</h1>
                  <Button><Plus className="h-4 w-4 mr-2" /> Assign Path</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Card key={course.id} className="overflow-hidden flex flex-col h-full group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 ring-1 ring-slate-200" onClick={() => handleOpenCourse(course)}>
                      <div className="relative h-48 overflow-hidden">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute top-3 left-3">
                           <Badge variant="neutral" className="bg-white/90 backdrop-blur-sm shadow-sm">{course.category}</Badge>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">{course.provider}</span>
                           <span className="text-xs text-slate-500 flex items-center"><Clock className="h-3 w-3 mr-1" /> {course.duration}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">{course.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{course.description}</p>
                        
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
                          <span className="flex items-center"><Users className="h-4 w-4 mr-1.5" /> {course.enrolledCount} Enrolled</span>
                          <span className="flex items-center"><Layers className="h-4 w-4 mr-1.5" /> {course.modules} Modules</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* --- ANALYTICS TAB --- */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-slate-900">Structure</h1>
                  <div className="flex gap-2">
                     <Button variant="outline"><Calendar className="h-4 w-4 mr-2" /> This Month</Button>
                     <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
                  </div>
                </div>

                {/* Team Management Section (Moved from Settings for better context or keep here) */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900">Departments & Teams</h2>
                        <Button size="sm" onClick={() => setIsDeptModalOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Department</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {departments.map(dept => (
                            <Card key={dept.id} className="p-0 overflow-hidden border-0 ring-1 ring-slate-200">
                                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900">{dept.name}</h3>
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
              </div>
            )}

            {/* --- SETTINGS TAB --- */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                
                {/* --- SETTINGS TAB --- */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-2xl font-bold text-slate-900 md:hidden">Settings</h1>
                
                {/* Subscription Section */}
                <Card className="p-6 border-0 shadow-sm ring-1 ring-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-slate-500" /> Subscription
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Plan</div>
                            <div className="text-2xl font-extrabold text-primary-600">Growth Plan</div>
                            <div className="text-sm text-slate-600 mt-1 font-medium">$49/month • Renews Nov 1, 2024</div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" className="bg-white">View Details</Button>
                            <Button variant="outline" className="bg-white text-red-600 border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700">Cancel Subscription</Button>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Job Roles Section */}
                    <Card className="p-6 border-0 shadow-sm ring-1 ring-slate-200 flex flex-col h-full">
                         <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-slate-500" /> Job Architecture
                            </h3>
                         </div>
                         <div className="flex-1 flex flex-col justify-between">
                             <p className="text-slate-600 text-sm mb-6">
                                Define standard roles, attach skill profiles, and set proficiency expectations to automate gap analysis.
                             </p>
                             <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-6 flex-1">
                                 <div className="flex items-center justify-between mb-2">
                                     <span className="text-xs font-bold text-slate-500 uppercase">Active Roles</span>
                                     <span className="text-xs font-bold text-primary-600">{jobRoles.length} Configured</span>
                                 </div>
                                 <div className="space-y-2 mt-2">
                                     {jobRoles.slice(0, 3).map(role => (
                                         <div key={role.id} className="text-sm text-slate-700 flex items-center gap-2">
                                             <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                                             {role.name}
                                         </div>
                                     ))}
                                     {jobRoles.length > 3 && <div className="text-xs text-slate-400 pl-3.5">+{jobRoles.length - 3} more</div>}
                                 </div>
                             </div>
                             <Button onClick={openJobRoleModal} className="w-full">Manage Job Roles</Button>
                         </div>
                    </Card>

                    {/* Skills Configuration Section */}
                    <Card className="p-6 border-0 shadow-sm ring-1 ring-slate-200 flex flex-col h-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                            <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Layers className="h-5 w-5 text-slate-500" /> Skills Taxonomy
                            </h3>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setIsSkillsModalOpen(true)} className="shrink-0">
                                View All
                            </Button>
                        </div>
                        
                        <div className="space-y-5 flex-1">
                            <p className="text-slate-600 text-sm">Manage the skills tracked across your organization.</p>
                            
                            {/* Add Custom */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Add Custom Skill</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Internal Tool"
                                        value={customSkill}
                                        onChange={(e) => setCustomSkill(e.target.value)}
                                        className="bg-slate-50 h-9"
                                    />
                                    <Button size="sm" onClick={handleAddCustomSkill} disabled={!customSkill.trim()}>Add</Button>
                                </div>
                            </div>

                            {/* Add from Library */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Add from Library</label>
                                <div className="flex gap-2">
                                    <div className="relative w-full">
                                        <select
                                            className="w-full h-9 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                            value={selectedLibrarySkill}
                                            onChange={(e) => setSelectedLibrarySkill(e.target.value)}
                                        >
                                            <option value="">Select a skill...</option>
                                            {defaultLibrarySkills.map(s => (
                                                <option key={s.name} value={s.name} disabled={mySkills.some(ms => ms.name === s.name)}>
                                                {s.name} {mySkills.some(ms => ms.name === s.name) ? '(Added)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Button size="sm" onClick={handleAddLibrarySkill} disabled={!selectedLibrarySkill}>Add</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
              </div>
            )}
              </div>
            )}

          </div>
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* 1. Skills Modal */}
      {isSkillsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Manage Skills Taxonomy</h2>
              <button onClick={() => setIsSkillsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Custom Skill Input */}
                <div>
                   <h3 className="text-sm font-semibold text-slate-900 mb-3">Add Custom Skill</h3>
                   <div className="flex gap-2 mb-4">
                     <Input 
                       placeholder="e.g. Rust, Crisis Mgmt" 
                       value={customSkill}
                       onChange={(e) => setCustomSkill(e.target.value)}
                     />
                     <Button onClick={handleAddCustomSkill}>Add</Button>
                   </div>
                </div>
                {/* Library Selection */}
                <div>
                   <h3 className="text-sm font-semibold text-slate-900 mb-3">Add from Library</h3>
                   <div className="flex gap-2 mb-4">
                     <select 
                       className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-sm focus:border-primary-500 focus:outline-none"
                       value={selectedLibrarySkill}
                       onChange={(e) => setSelectedLibrarySkill(e.target.value)}
                     >
                       <option value="">Select a skill...</option>
                       {defaultLibrarySkills.filter(s => !mySkills.some(ms => ms.name === s.name)).map(s => (
                         <option key={s.name} value={s.name}>{s.name} ({s.type})</option>
                       ))}
                     </select>
                     <Button variant="outline" onClick={handleAddLibrarySkill}>Add</Button>
                   </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Active Skills ({mySkills.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {mySkills.map((skill) => (
                    <span key={skill.name} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                      {skill.name}
                      <button 
                        onClick={() => setMySkills(mySkills.filter(s => s.name !== skill.name))}
                        className="ml-2 text-slate-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <Button onClick={() => setIsSkillsModalOpen(false)}>Done</Button>
            </div>
          </Card>
        </div>
      )}

      {/* 2. Job Roles Modal */}
      {isJobRolesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
             {/* Header */}
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {jobRoleMode === 'list' ? 'Job Roles' : jobRoleMode === 'create' ? 'Create New Role' : 'Edit Role'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {jobRoleMode === 'list' ? 'Manage roles and their skill requirements' : 'Define role details and required skills'}
                  </p>
                </div>
                <button onClick={() => setIsJobRolesModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
             </div>

             {/* Content */}
             <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                {jobRoleMode === 'list' ? (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Button onClick={handleCreateRole}><Plus className="h-4 w-4 mr-2" /> Create Role</Button>
                    </div>
                    <div className="grid gap-4">
                      {jobRoles.map(role => (
                        <div key={role.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-primary-300 transition-colors">
                          <div>
                            <h3 className="font-bold text-slate-900">{role.name}</h3>
                            <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                            <div className="flex gap-2 mt-3">
                               {role.skills.slice(0, 3).map(s => (
                                 <Badge key={s.skillName} variant="neutral">{s.skillName}</Badge>
                               ))}
                               {role.skills.length > 3 && <span className="text-xs text-slate-400 py-1">+ {role.skills.length - 3} more</span>}
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteRole(role.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 max-w-2xl mx-auto">
                     <div className="space-y-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <Input 
                          label="Role Title" 
                          value={editingRole?.name || ''} 
                          onChange={e => setEditingRole(prev => prev ? {...prev, name: e.target.value} : null)}
                          placeholder="e.g. Senior Product Designer"
                        />
                        <div className="space-y-1.5">
                           <label className="text-sm font-medium text-slate-700">Description</label>
                           <textarea 
                              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                              rows={3}
                              value={editingRole?.description || ''}
                              onChange={e => setEditingRole(prev => prev ? {...prev, description: e.target.value} : null)}
                           />
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Required Skills</h3>
                        
                        {/* Add Skill Form */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                           <div className="flex-1">
                             <select 
                               className="w-full rounded-lg border border-slate-300 text-sm p-2.5"
                               value={newRoleSkill.skillName}
                               onChange={e => setNewRoleSkill({...newRoleSkill, skillName: e.target.value})}
                             >
                               <option value="">Select skill...</option>
                               {mySkills.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                             </select>
                           </div>
                           <div className="w-32">
                              <select 
                                className="w-full rounded-lg border border-slate-300 text-sm p-2.5"
                                value={newRoleSkill.proficiency}
                                onChange={e => setNewRoleSkill({...newRoleSkill, proficiency: e.target.value as any})}
                              >
                                {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                           </div>
                           <Button onClick={addSkillToEditingRole} disabled={!newRoleSkill.skillName}>Add</Button>
                        </div>

                        {/* Skill List */}
                        <div className="space-y-2">
                           {editingRole?.skills.map(skill => (
                             <div key={skill.skillName} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg">
                                <div>
                                  <span className="font-medium text-slate-900 mr-2">{skill.skillName}</span>
                                  <Badge variant="neutral">{skill.proficiency}</Badge>
                                </div>
                                <button onClick={() => removeSkillFromEditingRole(skill.skillName)} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                             </div>
                           ))}
                           {editingRole?.skills.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">No skills added yet.</p>}
                        </div>
                     </div>
                  </div>
                )}
             </div>

             {/* Footer */}
             <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                {jobRoleMode !== 'list' && (
                  <>
                    <Button variant="outline" onClick={() => setJobRoleMode('list')}>Cancel</Button>
                    <Button onClick={handleSaveRole}>Save Role</Button>
                  </>
                )}
                {jobRoleMode === 'list' && <Button onClick={() => setIsJobRolesModalOpen(false)}>Close</Button>}
             </div>
          </Card>
        </div>
      )}

      {/* 3. Team Management Modal (View/Edit Team) */}
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
                     <p className="text-sm text-slate-600">{selectedTeam.team.description}</p>
                   )}
                </div>

                {/* Members Section */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-900 mb-4">Members ({selectedTeam.team.members.length})</h3>
                   
                   {/* Add Member Row */}
                   <div className="flex gap-2 mb-4">
                      <Input 
                        placeholder="Name" 
                        className="flex-1" 
                        value={newMemberName} 
                        onChange={(e) => setNewMemberName(e.target.value)} 
                      />
                      <Input 
                        placeholder="Role" 
                        className="flex-1" 
                        value={newMemberRole} 
                        onChange={(e) => setNewMemberRole(e.target.value)} 
                      />
                      <Button onClick={handleAddMember} disabled={!newMemberName || !newMemberRole}>Add</Button>
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

      {/* 4. Employee Modal (Add/Edit) */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">{isEditingEmp ? 'Edit Employee' : 'Add Employee'}</h2>
                <button onClick={() => setIsEmpModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
             </div>
             <div className="p-6 space-y-4">
                <Input label="Full Name" value={empName} onChange={e => setEmpName(e.target.value)} />
                <Input label="Job Title" value={empRole} onChange={e => setEmpRole(e.target.value)} />
                
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-slate-700">Department</label>
                   <select 
                     className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                     value={empDeptId}
                     onChange={e => { setEmpDeptId(e.target.value); setEmpTeamId(''); }}
                   >
                     <option value="">Select Department...</option>
                     {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                   </select>
                </div>

                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-slate-700">Team</label>
                   <select 
                     className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                     value={empTeamId}
                     onChange={e => setEmpTeamId(e.target.value)}
                     disabled={!empDeptId}
                   >
                     <option value="">Select Team...</option>
                     {departments.find(d => d.id === empDeptId)?.teams.map(t => (
                       <option key={t.id} value={t.id}>{t.name}</option>
                     ))}
                   </select>
                </div>
             </div>
             <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsEmpModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveEmployee} disabled={!empName || !empTeamId}>{isEditingEmp ? 'Save Changes' : 'Add Employee'}</Button>
             </div>
          </Card>
        </div>
      )}

      {/* 5. Create Department Modal */}
      {isDeptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <Card className="w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
                  <div className="p-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-4">Create New Department</h2>
                      <Input label="Department Name" placeholder="e.g. Marketing" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} />
                      <div className="flex justify-end gap-2 mt-6">
                          <Button variant="ghost" onClick={() => setIsDeptModalOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddDepartment}>Create</Button>
                      </div>
                  </div>
              </Card>
          </div>
      )}

      {/* 6. Create Team Modal */}
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

      {/* 8. Course Details Modal */}
      {isCourseModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="relative h-48 sm:h-64 flex-shrink-0">
                <img src={selectedCourse.image} alt={selectedCourse.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <button onClick={() => setIsCourseModalOpen(false)} className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-colors">
                  <X className="h-6 w-6" />
                </button>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                   <div className="flex gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary-600/90 rounded text-xs font-bold uppercase tracking-wider">{selectedCourse.category}</span>
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-medium">{selectedCourse.provider}</span>
                   </div>
                   <h2 className="text-3xl font-bold leading-tight">{selectedCourse.title}</h2>
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col md:flex-row">
                <div className="p-6 md:w-2/3 space-y-6">
                   <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Course Overview</h3>
                      <p className="text-slate-600 leading-relaxed mb-6">{selectedCourse.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                         <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">{selectedCourse.modules}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Modules</div>
                         </div>
                         <div className="text-center border-l border-slate-100">
                            <div className="text-2xl font-bold text-slate-900">{selectedCourse.duration}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Duration</div>
                         </div>
                         <div className="text-center border-l border-slate-100">
                            <div className="text-2xl font-bold text-slate-900">{selectedCourse.enrolledCount}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Enrolled</div>
                         </div>
                      </div>
                   </div>

                   {/* Module List (Dummy) */}
                   <div className="space-y-3">
                      <h3 className="text-lg font-bold text-slate-900">Curriculum</h3>
                      {[1,2,3].map(m => (
                        <div key={m} className="bg-white p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">{m}</div>
                              <div>
                                 <div className="font-medium text-slate-900">Module {m}: Fundamentals</div>
                                 <div className="text-xs text-slate-500">Video • 15 mins</div>
                              </div>
                           </div>
                           <Lock className="h-4 w-4 text-slate-300" />
                        </div>
                      ))}
                   </div>
                </div>

                <div className="p-6 md:w-1/3 border-l border-slate-200 bg-white">
                   <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Current Students</h3>
                   <div className="space-y-3">
                      {allEmployees.slice(0, 5).map(emp => (
                         <div 
                           key={emp.id} 
                           onClick={() => handleSelectStudentForCourse(emp)}
                           className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedStudent?.id === emp.id ? 'bg-primary-50 ring-1 ring-primary-500' : 'hover:bg-slate-50'}`}
                         >
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                              {emp.name.substring(0,2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="text-sm font-medium text-slate-900 truncate">{emp.name}</div>
                               <div className="text-xs text-slate-500 truncate">{emp.role}</div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                         </div>
                      ))}
                   </div>

                   {/* Drill Down View */}
                   {selectedStudent && (
                      <div className="mt-8 animate-in slide-in-from-bottom-2">
                         <div className="p-4 bg-slate-900 rounded-xl text-white">
                            <div className="flex justify-between items-start mb-4">
                               <div>
                                  <div className="text-sm font-medium text-slate-300">Student Progress</div>
                                  <div className="text-lg font-bold">{selectedStudent.name}</div>
                               </div>
                               <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-0">{selectedStudent.progress}%</Badge>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                               <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{width: `${selectedStudent.progress}%`}}></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                               <div>
                                  <div className="text-slate-400 text-xs">Last Active</div>
                                  <div>{selectedStudent.lastActive}</div>
                               </div>
                               <div>
                                  <div className="text-slate-400 text-xs">Quiz Score</div>
                                  <div>{selectedStudent.quizScore}/100</div>
                               </div>
                            </div>
                         </div>
                      </div>
                   )}
                </div>
             </div>
          </Card>
        </div>
      )}

      {/* 9. Create Report Modal */}
      {isCreateReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900">Create New Report</h2>
                <button onClick={() => setIsCreateReportModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
             </div>
             <div className="p-6 space-y-4">
                <Input 
                   label="Report Name" 
                   placeholder="e.g. Q4 Performance Summary"
                   value={newReportForm.name} 
                   onChange={e => setNewReportForm({...newReportForm, name: e.target.value})} 
                />
                
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-slate-700">Report Type</label>
                   <select 
                     className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                     value={newReportForm.type}
                     onChange={e => setNewReportForm({...newReportForm, type: e.target.value})}
                   >
                     {['Skill Gap', 'Training ROI', 'Employee Progress', 'Department Summary'].map(t => (
                       <option key={t} value={t}>{t}</option>
                     ))}
                   </select>
                </div>

                <Input 
                   label="Date Selection" 
                   type="date"
                   value={newReportForm.date} 
                   onChange={e => setNewReportForm({...newReportForm, date: e.target.value})} 
                />
             </div>
             <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsCreateReportModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateReport} disabled={!newReportForm.name || !newReportForm.date}>Generate Report</Button>
             </div>
          </Card>
        </div>
      )}

      {/* 10. View Report Modal */}
      {isViewReportModalOpen && selectedReportForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl shadow-xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
             <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div className="flex items-start gap-4">
                   <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                      <FileText className="h-8 w-8" />
                   </div>
                   <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedReportForView.name}</h2>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                         <span>{selectedReportForView.type}</span>
                         <span>•</span>
                         <span>Created {selectedReportForView.dateCreated}</span>
                      </div>
                   </div>
                </div>
                <button onClick={() => setIsViewReportModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
             </div>
             
             <div className="p-8 flex-1 overflow-y-auto bg-slate-50">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                   <h3 className="font-bold text-slate-900 mb-2">Executive Summary</h3>
                   <p className="text-slate-600 leading-relaxed">{selectedReportForView.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <div className="text-sm text-slate-500 mb-1">Generated By</div>
                      <div className="font-medium text-slate-900">{selectedReportForView.createdBy}</div>
                   </div>
                   <div className="bg-white p-4 rounded-xl border border-slate-200">
                      <div className="text-sm text-slate-500 mb-1">Status</div>
                      <Badge variant="success">{selectedReportForView.status}</Badge>
                   </div>
                </div>
             </div>
          </Card>
        </div>
      )}

      {/* 11. Edit Company Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Edit Company Profile</h2>
                <button onClick={() => setIsEditProfileOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
             </div>
             <div className="p-6 space-y-6 flex-1 overflow-y-auto bg-slate-50">
                {/* Company Identity */}
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                          label="Company Name" 
                          value={editProfileForm.name} 
                          onChange={e => setEditProfileForm({...editProfileForm, name: e.target.value})} 
                        />
                        <Input 
                          label="Website" 
                          value={editProfileForm.website} 
                          onChange={e => setEditProfileForm({...editProfileForm, website: e.target.value})} 
                        />
                        <Input 
                          label="Industry" 
                          value={editProfileForm.industry} 
                          onChange={e => setEditProfileForm({...editProfileForm, industry: e.target.value})} 
                        />
                         <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Size</label>
                            <select 
                                className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                                value={editProfileForm.size}
                                onChange={e => setEditProfileForm({...editProfileForm, size: e.target.value})} 
                            >
                                <option value="1-10">1-10</option>
                                <option value="11-50">11-50</option>
                                <option value="51-200">51-200</option>
                                <option value="201+">201+</option>
                            </select>
                         </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                          label="Company Email" 
                          value={editProfileForm.companyEmail} 
                          onChange={e => setEditProfileForm({...editProfileForm, companyEmail: e.target.value})} 
                        />
                        <Input 
                          label="Phone Number" 
                          value={editProfileForm.companyContact} 
                          onChange={e => setEditProfileForm({...editProfileForm, companyContact: e.target.value})} 
                        />
                    </div>
                </div>

                {/* Address */}
                 <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Location</h3>
                    <div className="space-y-4">
                        <Input 
                          label="Street Address" 
                          value={editProfileForm.address.street} 
                          onChange={e => setEditProfileForm({...editProfileForm, address: {...editProfileForm.address, street: e.target.value}})} 
                        />
                        <div className="grid grid-cols-2 gap-4">
                             <Input 
                                label="City" 
                                value={editProfileForm.address.city} 
                                onChange={e => setEditProfileForm({...editProfileForm, address: {...editProfileForm.address, city: e.target.value}})} 
                            />
                             <Input 
                                label="State" 
                                value={editProfileForm.address.state} 
                                onChange={e => setEditProfileForm({...editProfileForm, address: {...editProfileForm.address, state: e.target.value}})} 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <Input 
                                label="Zip Code" 
                                value={editProfileForm.address.zipCode} 
                                onChange={e => setEditProfileForm({...editProfileForm, address: {...editProfileForm.address, zipCode: e.target.value}})} 
                            />
                             <Input 
                                label="Country" 
                                value={editProfileForm.address.country} 
                                onChange={e => setEditProfileForm({...editProfileForm, address: {...editProfileForm.address, country: e.target.value}})} 
                            />
                        </div>
                    </div>
                </div>
             </div>
             <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsEditProfileOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
             </div>
          </Card>
        </div>
      )}

      {/* Trainer Modal */}
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
                  {selectedTrainee.name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{selectedTrainee.name}</h3>
                  <p className="text-sm text-slate-500">{selectedTrainee.role}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3">Identified Skills</h4>
                <div className="flex flex-wrap gap-2">
                   {/* Mock skills for display */}
                   {['Communication', 'Project Management', 'Technical Leadership', 'Agile'].map(s => (
                     <Badge key={s} variant="neutral">{s}</Badge>
                   ))}
                   <Badge variant="warning">+2 Gaps Detected</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Training Context / Instructions</label>
                <textarea 
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 min-h-[100px]"
                  placeholder="Describe the specific skills or behaviors this employee needs to develop..."
                  value={trainingPrompt}
                  onChange={(e) => setTrainingPrompt(e.target.value)}
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
    </div>
  );
};