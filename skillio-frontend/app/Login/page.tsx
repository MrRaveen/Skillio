'use client';
import React, { useState } from 'react';
import { Building2, Users, ArrowRight, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button, Input, Card } from '../Components/Ui/Components';
import { useRouter } from "next/navigation";
import { apiCall } from '../lib/api';


interface LoginScreenProps {
  onLogin: (type: 'company' | 'employee', email: string) => void;
  onCancel: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onCancel }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'company' | 'employee'>('company');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email && password) {
      try {
        const endpoint = activeTab === 'company' ? "/login" : "/employee-login";
        const res = await apiCall(endpoint, {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.token) {
             localStorage.setItem('token', data.token);
             localStorage.setItem('userType', activeTab);
             
             if (activeTab === 'company') {
               localStorage.setItem('orgID', data.orgID);
               localStorage.setItem('companyName', data.companyName);
             } else {
               localStorage.setItem('employeeID', data.employee.id);
               localStorage.setItem('employeeName', data.employee.name);
               localStorage.setItem('orgID', data.employee.orgAccID || data.orgAccID);
             }
          }
          router.push("/Dashboard");
        } else {
          const data = await res.json();
          alert(data.message || "Invalid credentials");
        }
      } catch (error) {
        console.error("Login failed:", error);
        alert("An error occurred during login. Please try again.");
      }
    }
  };


  return (
    <div className="min-h-screen bg-mesh-color flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative AI background elements */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
           <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
           <p className="mt-2 text-sm text-slate-600">Sign in to your Skillio account</p>
        </div>

        <Card className="overflow-hidden shadow-xl border-slate-200/60 backdrop-blur-sm bg-white/90 ring-1 ring-slate-200">
          {/* Tabs */}
          <div className="grid grid-cols-2 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('company')}
              className={`flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                activeTab === 'company'
                  ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                  : 'bg-slate-50/50 text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Company
            </button>
            <button
              onClick={() => setActiveTab('employee')}
              className={`flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                activeTab === 'employee'
                  ? 'bg-white text-primary-600 border-b-2 border-primary-600'
                  : 'bg-slate-50/50 text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              <Users className="h-4 w-4" />
              Employee
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">
                  {activeTab === 'company' ? 'Company Administrator' : 'Employee Portal'}
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  {activeTab === 'company' 
                    ? 'Manage your organization settings and training programs.' 
                    : 'Access your learning path and skills profile.'}
                </p>
              </div>

              <Input
                label="Email address"
                type="email"
                placeholder={activeTab === 'company' ? 'admin@company.com' : 'you@company.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail className="h-4 w-4 text-slate-400" />}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<Lock className="h-4 w-4 text-slate-400" />}
                />
                <div className="flex justify-end mt-1">
                  <button type="button" className="text-xs font-medium text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button type="submit" className="w-full shadow-lg shadow-primary-500/20">
                  Log in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="ghost" type="button" onClick={onCancel} className="w-full text-slate-500">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
        
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <button onClick={onCancel} className="font-medium text-primary-600 hover:text-primary-500">
            Sign up for free
          </button>
        </p>
      </div>
    </div>
  );
};
export default LoginScreen;


