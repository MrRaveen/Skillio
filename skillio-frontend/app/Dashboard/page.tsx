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
import { Card, Button, Badge, Input } from '../Components/Ui/Components';
import { CompanyDetails } from '../types';
import { useRouter } from "next/navigation";
import Overview from './DashboardComponent/Overview';
import EmployeesTab from './DashboardComponent/EmployeesTab';
import TrainerTab from './DashboardComponent/TrainerTab';
import CompanyTab from './DashboardComponent/CompanyTab';
import LearningPathTab from './DashboardComponent/LearningPathTab';
import StructureTab from './DashboardComponent/StructureTab';
import SettingsTab from './DashboardComponent/SettingsTab';
import NotificationSection from './DashboardComponent/NotificationSection';
import ProgressTab from './DashboardComponent/ProgressTab';
import { apiCall } from "@/app/lib/api";

interface DashboardProps {
  companyDetails: CompanyDetails;
}

const Dashboard: React.FC<DashboardProps> = ({ companyDetails }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('employees');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Notifications State
  interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'alert' | 'info' | 'success';
    read: boolean;
  }

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Skill Gap Detected', message: 'Engineering team is missing critical React skills.', time: '2 hrs ago', type: 'alert', read: false },
    { id: '2', title: 'Training Completed', message: 'Alice Johnson completed "Advanced React Patterns".', time: '5 hrs ago', type: 'success', read: false },
  ]);

  const [activeToast, setActiveToast] = useState<Notification | null>(null);
  const [aiData, setAIData] = useState<any>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  // SSE Connection
  React.useEffect(() => {
    let isMounted = true;
    const connectSSE = async () => {
      try {
        const type = localStorage.getItem('userType');
        const endpoint = type === 'employee' ? '/stream-em' : '/stream';
        const response = await apiCall(endpoint);
        console.log("stream got response : " + response.body)
        if (!response.ok || !response.body) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (isMounted) {
          console.log("isMounted true")
          const { value, done } = await reader.read();
          console.log("value : " + value)
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log("Global SSE update:", data);

                if (data.type === 'AI') {
                  setAIData(data.additionalData);
                  setIsAIModalOpen(true);
                  setIsGlobalLoading(false);
                }

                if (data.message && data.status !== 'connected') {
                  const newNotification: Notification = {
                    id: Date.now().toString(),
                    title: data.title || (type === 'employee' ? 'Notification' : 'AI Training Update'),
                    message: data.message,
                    time: 'Just now',
                    type: data.status === 'success' ? 'success' : 'info',
                    read: false
                  };
                  setNotifications(prev => [newNotification, ...prev]);

                  // Show Toast
                  setActiveToast(newNotification);
                  setTimeout(() => setActiveToast(null), 5000);
                }
              } catch (e) { console.error("Error parsing SSE data", e); }
            }
          }
        }
      } catch (err) {
        console.error("SSE connection error", err);
        if (isMounted) setTimeout(connectSSE, 5000);
      }
    };
    connectSSE();
    return () => { isMounted = false; };
  }, []);

  const onLogout = () => {
    router.push('/');
  }

  const [profileData, setProfileData] = useState<CompanyDetails>({
    name: 'Test Company',
    size: '50–100',
    industry: 'Software',
    address: {
      street: '123 Test Street',
      city: 'Testville',
      state: 'CA',
      zipCode: '90001',
      country: 'USA'
    },
    website: 'https://testcompany.com',
    companyContact: '123-456-7890',
    personalContact: '987-654-3210',
    companyEmail: 'info@testcompany.com',
    accountEmail: 'accounts@testcompany.com',
    ownerEmail: 'owner@testcompany.com',
    password: 'TestPassword123'
  });

  const [userType, setUserType] = useState<'company' | 'employee' | null>(null);

  React.useEffect(() => {
    const type = localStorage.getItem('userType') as 'company' | 'employee';
    setUserType(type || 'company');
    
    if (type === 'employee') {
      const empName = localStorage.getItem('employeeName');
      setProfileData(prev => ({ ...prev, name: empName || 'Employee' }));
      setActiveTab('overview');
    } else {
      setActiveTab('employees');
    }
  }, []);

  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, id: 'overview', roles: ['employee'] },
    { name: 'Employees', icon: Users, id: 'employees', roles: ['company'] },
    { name: 'AI Trainer', icon: Bot, id: 'trainer', roles: ['company'] },
    { name: 'Company', icon: Building, id: 'company', roles: ['company'] },
    { name: 'Learning Paths', icon: BookOpen, id: 'learning' },
    { name: 'Progress', icon: BarChart, id: 'progress', roles: ['company'] },
    { name: 'Structure', icon: TrendingUp, id: 'analytics', roles: ['company'] },
    { name: 'Settings', icon: Settings, id: 'settings' },
  ].filter(item => !item.roles || item.roles.includes(userType || 'company'));

  const getTabTitle = () => {
    const item = navItems.find(i => i.id === activeTab);
    return item ? item.name : 'Dashboard';
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const appFeatures = [
    { name: 'Dashboard Overview', keywords: 'home stats metrics summary', tab: 'overview', icon: LayoutDashboard, roles: ['employee'] },
    { name: 'Manage Employees', keywords: 'staff workers list view', tab: 'employees', icon: Users, roles: ['company'] },
    { name: 'Add New Employee', keywords: 'hire recruit user plus', tab: 'employees', icon: UserPlus, roles: ['company'] },
    { name: 'AI Trainer', keywords: 'bot coach architect training', tab: 'trainer', icon: Bot, roles: ['company'] },
    { name: 'Company Profile', keywords: 'info update address business', tab: 'company', icon: Building, roles: ['company'] },
    { name: 'Learning Paths', keywords: 'courses curriculum tracks education', tab: 'learning', icon: BookOpen },
    { name: 'Employee Progress', keywords: 'progress evaluation training scores results', tab: 'progress', icon: BarChart, roles: ['company'] },
    { name: 'Organization Structure', keywords: 'hierarchy teams departments analytics', tab: 'analytics', icon: TrendingUp, roles: ['company'] },
    { name: 'Account Settings', keywords: 'preferences config security password', tab: 'settings', icon: Settings, roles: ['company'] },
  ].filter(feature => !feature.roles || feature.roles.includes(userType || 'company'));

  const filteredFeatures = globalSearch.trim() === '' ? [] : appFeatures.filter(f => 
    f.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
    f.keywords.toLowerCase().includes(globalSearch.toLowerCase())
  );

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
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === item.id
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
              {profileData.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-slate-900">{profileData.name}</p>
              <p className="truncate text-xs text-slate-500">{userType === 'company' ? 'Admin Workspace' : 'Employee Portal'}</p>
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
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 z-20 shrink-0">
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
              <Search className={`absolute left-3 top-2.5 h-4 w-4 transition-colors ${isSearchFocused ? 'text-primary-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search features (e.g. 'Update company')..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />

              {/* Global Search Results Dropdown */}
              {isSearchFocused && filteredFeatures.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-[60] animate-in slide-in-from-top-2 duration-200">
                  <div className="p-2 space-y-1">
                    {filteredFeatures.map((feature, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveTab(feature.tab);
                          setGlobalSearch('');
                          setIsSearchFocused(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary-50 text-left transition-colors group"
                      >
                        <div className="h-8 w-8 rounded-lg bg-slate-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                          <feature.icon className="h-4 w-4 text-slate-500 group-hover:text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{feature.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Go to {feature.tab}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 ml-auto text-slate-300 group-hover:text-primary-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Notifications Section */}
            <NotificationSection
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onClearAll={handleClearAll}
            />
            <div className="h-8 w-8 rounded-full bg-slate-200 md:hidden flex items-center justify-center text-xs font-bold text-slate-600">
              {profileData.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* 😋😊😊😊😊😉😉 Dashboard Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 scrollbar-hide">
          <div className="mx-auto max-w-7xl space-y-6">

            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && (
              <Overview></Overview>
            )}

            {/* --- EMPLOYEES TAB --- */}
            {activeTab === 'employees' && (
              <EmployeesTab></EmployeesTab>
            )}

            {/* --- TRAINER TAB --- */}
            {activeTab === 'trainer' && (
              <TrainerTab setIsGlobalLoading={setIsGlobalLoading}></TrainerTab>
            )}

            {/* --- COMPANY TAB --- */}
            {activeTab === 'company' && (
              <CompanyTab></CompanyTab>
            )}

            {/* --- LEARNING PATHS TAB --- */}
            {activeTab === 'learning' && (
              <LearningPathTab></LearningPathTab>
            )}

            {/* --- PROGRESS TAB --- */}
            {activeTab === 'progress' && (
              <ProgressTab />
            )}

            {/* --- ANALYTICS TAB --- */}
            {activeTab === 'analytics' && (
              <StructureTab></StructureTab>
            )}

            {/* --- SETTINGS TAB --- */}
            {activeTab === 'settings' && (
              <SettingsTab userType={userType}></SettingsTab>
            )}

          </div>
        </div>
      </main>

      {/* Toast Notification Popup */}
      {activeToast && (
        <div className="fixed top-20 right-6 z-[100] transition-all duration-500 ease-in-out">
          <div className="w-80 p-4 border border-slate-200 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex gap-3 items-start border-l-4 border-l-primary-500">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${activeToast.type === 'alert' ? 'bg-red-100 text-red-600' :
                activeToast.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-blue-100 text-blue-600'
              }`}>
              {activeToast.type === 'alert' && <AlertCircle className="h-4 w-4" />}
              {activeToast.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
              {activeToast.type === 'info' && <Info className="h-4 w-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900">{activeToast.title}</h4>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{activeToast.message}</p>
            </div>
            <button onClick={() => setActiveToast(null)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Global AI Loading Overlay */}
      {isGlobalLoading && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin"></div>
            <Bot className="absolute inset-0 m-auto h-10 w-10 text-primary-400 animate-pulse" />
          </div>
          <h2 className="mt-8 text-2xl font-bold tracking-tight">AI is Architecting...</h2>
          <p className="mt-2 text-slate-300 font-medium animate-pulse">Generating personalized training modules based on skills & role</p>
          <div className="mt-10 flex gap-2">
            <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 rounded-full bg-primary-500 animate-bounce"></div>
          </div>
        </div>
      )}

      {/* AI Result Modal (Chat style) */}
      {isAIModalOpen && aiData && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-primary-600 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI Training Plan Generated</h3>
                  <p className="text-xs text-primary-100">Tailored evaluation module ready</p>
                </div>
              </div>
              <button
                onClick={() => setIsAIModalOpen(false)}
                className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content (Chat Style) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-slate-50">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0 border border-primary-200">
                  <Bot className="h-5 w-5 text-primary-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm max-w-[85%]">
                  <p className="text-sm text-slate-700 leading-relaxed">
                    I've analyzed the employee's role and target skills. I've generated an initial evaluation module consisting of <strong>{aiData.test_questions?.length || 0} questions</strong> to assess their baseline proficiency.
                  </p>
                </div>
              </div>

              {aiData.test_questions?.map((q: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0 border border-primary-200">
                    <Bot className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="bg-white p-5 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm w-full space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" className="bg-primary-50 text-primary-700 border-primary-100">Question {idx + 1}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">{q.question}</p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.answerChoices?.map((choice: string, cIdx: number) => (
                        <div key={cIdx} className={`p-3 rounded-xl border text-xs flex justify-between items-center ${cIdx === q.correctAnswer
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-50 border-slate-100 text-slate-600'
                          }`}>
                          <span>{choice}</span>
                          {cIdx === q.correctAnswer && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0 border border-primary-200">
                  <Bot className="h-5 w-5 text-primary-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm max-w-[85%]">
                  <p className="text-sm text-slate-700">
                    The evaluation is now pending. The employee will be notified to start the session.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end">
              <Button onClick={() => setIsAIModalOpen(false)} className="px-8">
                Acknowledged
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Dashboard;