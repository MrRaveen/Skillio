'use client';
import React, { useState } from 'react';
import { ArrowRight, Building2 } from 'lucide-react';
import { Button, Input, Card } from '../../Components/Ui/Components';
import { CompanyDetails } from '../../types';
import { useRouter } from "next/navigation";

const CreateAccCompanyInfo = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CompanyDetails>(() => {
    let data: CompanyDetails = {
      name: '',
      size: '',
      industry: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      website: '',
      companyContact: '',
      personalContact: '',
      companyEmail: '',
      ownerEmail: '',
      password: ''
    };

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboarding_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate enums to prevent stale data errors (like '11-50')
        const validSizes = ["0-10", "10-50", "50-200", "201+"];
        const validIndustries = ["Education", "Medical", "IT", "Engineering"];
        
        if (!validSizes.includes(parsed.size)) parsed.size = '';
        if (!validIndustries.includes(parsed.industry)) parsed.industry = '';
        
        data = { ...data, ...parsed };
      }
    }
    return data;
  });

  const handleNext = () => {
    localStorage.setItem('onboarding_data', JSON.stringify(formData));
    router.push("/CreateAccount/CreateAccSecurity2");
  };

  const handleChange = (field: keyof CompanyDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onCancel = () => router.push('/');

  return (
    <div className="min-h-screen bg-mesh-color flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid pointer-events-none"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300/20 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>

      <div className="relative z-10">
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8 text-center">
           <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl shadow-primary-500/30">
                <Building2 className="h-7 w-7" />
              </div>
           </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Tell us about your company
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Step 2 of 5
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="px-4 py-8 sm:px-10 shadow-xl border-slate-200/60 backdrop-blur-sm bg-white/80 ring-1 ring-slate-200/50">
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                <Input 
                  label="Company Name" 
                  placeholder="Acme Inc." 
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Company Size</label>
                  <select 
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={formData.size}
                    onChange={(e) => handleChange('size', e.target.value)}
                  >
                    <option value="">Select size...</option>
                    <option value="0-10">0-10 employees</option>
                    <option value="10-50">10-50 employees</option>
                    <option value="50-200">50-200 employees</option>
                    <option value="201+">201+ employees</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Industry</label>
                  <select 
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    value={formData.industry}
                    onChange={(e) => handleChange('industry', e.target.value)}
                  >
                    <option value="">Select industry...</option>
                    <option value="Education">Education</option>
                    <option value="Medical">Medical</option>
                    <option value="IT">IT</option>
                    <option value="Engineering">Engineering</option>
                  </select>
                </div>
                <div className="pt-4 flex items-center gap-3">
                  <Button variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                    Cancel
                  </Button>
                  <Button onClick={handleNext} className="flex-1" disabled={!formData.name || !formData.size}>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateAccCompanyInfo;
