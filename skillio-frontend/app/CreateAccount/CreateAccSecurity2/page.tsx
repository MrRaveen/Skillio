'use client';
import { Button, Card, Input } from "@/app/Components/Ui/Components";
import { CompanyDetails } from "@/app/types";
import { ArrowRight, Building2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CreateAccSecurity2 = () => {
    const [formData, setFormData] = useState<CompanyDetails>(() => {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('onboarding_data');
          if (saved) return JSON.parse(saved);
        }
        return {
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
      });
      const router = useRouter();
      const handleChange = (field: keyof CompanyDetails, value: string) => {
          setFormData(prev => ({ ...prev, [field]: value }));
      };
      const handleNext = () => {
        localStorage.setItem('onboarding_data', JSON.stringify(formData));
        router.push('/CreateAccount/CreateAccLocation3');
      };
      const onCancel = () => {
        router.push('/');
      };
      const handleBack = () => {
        router.push('/CreateAccount/CreateAccCompanyInfo');
      };
    return(

      <div className="min-h-screen bg-mesh-color flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative AI background elements */}
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
           Contact & Security
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Step 3 of 5
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Card className="px-4 py-8 sm:px-10 shadow-xl border-slate-200/60 backdrop-blur-sm bg-white/80 ring-1 ring-slate-200/50">
          <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="grid grid-cols-1 gap-4">
                  <Input 
                    label="Company Email" 
                    type="email"
                    placeholder="info@company.com"
                    value={formData.companyEmail}
                    onChange={(e) => handleChange('companyEmail', e.target.value)}
                  />
                  <Input 
                    label="Company Contact" 
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.companyContact}
                    onChange={(e) => handleChange('companyContact', e.target.value)}
                  />
                </div>

                <div className="relative pt-2 pb-2">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-slate-400">Owner & Account</span>
                  </div>
                </div>

                <Input 
                  label="Owner Email" 
                  type="email"
                  placeholder="owner@company.com"
                  value={formData.ownerEmail}
                  readOnly
                  className="bg-slate-50 cursor-not-allowed"
                />
                <div className="grid grid-cols-1 gap-4">
                  <Input 
                    label="Personal Contact" 
                    type="tel"
                    placeholder="+1 (555) 999-9999"
                    value={formData.personalContact}
                    onChange={(e) => handleChange('personalContact', e.target.value)}
                  />
                </div>
                <Input 
                  label="Owner Password" 
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                />

                <div className="pt-4 flex items-center gap-3">
                  <Button variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                    Cancel
                  </Button>
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>  
          </Card>
        </div>
      </div>
    </div>



        
    );
}
export default CreateAccSecurity2;
