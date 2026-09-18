import { Button, Card, Input } from "@/app/Components/Ui/Components";
import { Edit2, Globe, Briefcase, Users, MapPin, Building, Phone, Mail, X, Image as ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { apiCall } from "@/app/lib/api";

interface CompanyDetails {
  companyName: string;
  companySize: string;
  companyIndustry: string;
  companyEmail: string;
  contactNumber: string;
  personalNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  companyWebsiteUrl: string;
  companyLogoUrl: string;
  companyBannerUrl: string;
}

const INDUSTRY_OPTIONS = ["Education", "Medical", "IT", "Engineering"];
const SIZE_OPTIONS = ["0-10", "10-50", "50-200", "201+"];

export default function CompanyTab(){
    const [isLoading, setIsLoading] = useState(true);
    const [profileData, setProfileData] = useState<CompanyDetails>({
      companyName: '',
      companySize: '',
      companyIndustry: '',
      companyEmail: '',
      contactNumber: '',
      personalNumber: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      companyWebsiteUrl: '',
      companyLogoUrl: '',
      companyBannerUrl: ''
    });

    const [editProfileForm, setEditProfileForm] = useState<CompanyDetails>(profileData);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await apiCall('/company-profile', { method: 'GET' });
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'success' && data.data) {
                        setProfileData(data.data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch company profile', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleOpenEditProfile = () => {
        setEditProfileForm({...profileData});
        setIsEditProfileOpen(true);
    };

    const handleSaveProfile = async () => {
        try {
            const res = await apiCall('/company-profile', {
                method: 'PUT',
                body: JSON.stringify(editProfileForm)
            });
            if (res.ok) {
                setProfileData(editProfileForm);
                setIsEditProfileOpen(false);
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Failed to save profile', error);
            alert('An error occurred while saving.');
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;
    }

    return(
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
            <div 
                className="h-48 bg-gradient-to-r from-primary-600 to-indigo-700 w-full relative bg-cover bg-center"
                style={profileData.companyBannerUrl ? { backgroundImage: `url(${profileData.companyBannerUrl})` } : {}}
            >
                {!profileData.companyBannerUrl && <div className="absolute inset-0 bg-mesh-color opacity-10 mix-blend-overlay"></div>}
            </div>
            
            {/* Main Info */}
            <div className="px-8 pb-8">
                <div className="relative -mt-16 mb-6 flex justify-between items-end">
                    <div className="h-32 w-32 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-100">
                        <div className="h-full w-full bg-slate-100 rounded-xl flex items-center justify-center text-4xl font-bold text-slate-400 overflow-hidden">
                            {profileData.companyLogoUrl ? (
                                <img src={profileData.companyLogoUrl} alt="Company Logo" className="w-full h-full object-cover" />
                            ) : (
                                profileData.companyName ? profileData.companyName.substring(0,1).toUpperCase() : 'C'
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3 mb-2">
                        {profileData.companyWebsiteUrl && (
                            <a href={profileData.companyWebsiteUrl.startsWith('http') ? profileData.companyWebsiteUrl : `https://${profileData.companyWebsiteUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50">
                                <Globe className="h-4 w-4 mr-2 text-slate-500" /> Website
                            </a>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Core Info */}
                    <div className="col-span-2 space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">{profileData.companyName || 'Your Company Name'}</h2>
                            <div className="flex items-center gap-4 text-slate-500 text-sm">
                                <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1" /> {profileData.companyIndustry || 'Industry not set'}</span>
                                <span className="flex items-center"><Users className="h-4 w-4 mr-1" /> {profileData.companySize || 'Size not set'} employees</span>
                                <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {profileData.city || 'City'}, {profileData.country || 'Country'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Card className="p-4 bg-slate-50/50 border-0">
                                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <Building className="h-4 w-4 text-primary-600" /> Headquarters
                                </h3>
                                <address className="not-italic text-sm text-slate-600 space-y-1">
                                    <p>{profileData.address || 'Street address not set'}</p>
                                    <p>{profileData.city ? `${profileData.city}, ` : ''}{profileData.state} {profileData.zipCode}</p>
                                    <p>{profileData.country}</p>
                                </address>
                            </Card>
                            <Card className="p-4 bg-slate-50/50 border-0">
                                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-primary-600" /> Contact Info
                                </h3>
                                <div className="text-sm text-slate-600 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                                        {profileData.companyEmail || 'Email not set'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                        {profileData.contactNumber || 'Phone not set'}
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
                    </div>
                </div>
            </div>
        </div>
        {/*Edit Company Profile popup */}
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
                          value={editProfileForm.companyName || ''} 
                          onChange={e => setEditProfileForm({...editProfileForm, companyName: e.target.value})} 
                        />
                        <Input 
                          label="Website URL" 
                          value={editProfileForm.companyWebsiteUrl || ''} 
                          onChange={e => setEditProfileForm({...editProfileForm, companyWebsiteUrl: e.target.value})} 
                        />
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Industry</label>
                            <select 
                                className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
                                value={editProfileForm.companyIndustry || ''}
                                onChange={e => setEditProfileForm({...editProfileForm, companyIndustry: e.target.value})} 
                            >
                                <option value="" disabled>Select industry</option>
                                {INDUSTRY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Company Size</label>
                            <select 
                                className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
                                value={editProfileForm.companySize || ''}
                                onChange={e => setEditProfileForm({...editProfileForm, companySize: e.target.value})} 
                            >
                                <option value="" disabled>Select size</option>
                                {SIZE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                         </div>
                    </div>
                </div>

                {/* Media */}
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-slate-400" /> Branding
                    </h3>
                    <div className="space-y-4">
                        <Input 
                          label="Logo URL" 
                          value={editProfileForm.companyLogoUrl || ''} 
                          onChange={e => setEditProfileForm({...editProfileForm, companyLogoUrl: e.target.value})} 
                          placeholder="https://example.com/logo.png"
                        />
                        <Input 
                          label="Banner URL" 
                          value={editProfileForm.companyBannerUrl || ''} 
                          onChange={e => setEditProfileForm({...editProfileForm, companyBannerUrl: e.target.value})} 
                          placeholder="https://example.com/banner.jpg"
                        />
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                          label="Company Email" 
                          value={editProfileForm.companyEmail || ''} 
                          onChange={e => setEditProfileForm({...editProfileForm, companyEmail: e.target.value})} 
                        />
                        <Input 
                          label="Company Phone Number" 
                          value={editProfileForm.contactNumber || ''} 
                          onChange={e => setEditProfileForm({...editProfileForm, contactNumber: e.target.value})} 
                        />
                        <Input 
                          label="Personal Phone Number" 
                          value={editProfileForm.personalNumber || ''} 
                          onChange={e => setEditProfileForm({...editProfileForm, personalNumber: e.target.value})} 
                        />
                    </div>
                </div>

                {/* Address */}
                 <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4">Location</h3>
                    <div className="space-y-4">
                        <Input 
                          label="Street Address" 
                          value={editProfileForm.address || ''} 
                          onChange={e => setEditProfileForm({...editProfileForm, address: e.target.value})} 
                        />
                        <div className="grid grid-cols-2 gap-4">
                             <Input 
                                label="City" 
                                value={editProfileForm.city || ''} 
                                onChange={e => setEditProfileForm({...editProfileForm, city: e.target.value})} 
                            />
                             <Input 
                                label="State" 
                                value={editProfileForm.state || ''} 
                                onChange={e => setEditProfileForm({...editProfileForm, state: e.target.value})} 
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <Input 
                                label="Zip Code" 
                                value={editProfileForm.zipCode || ''} 
                                onChange={e => setEditProfileForm({...editProfileForm, zipCode: e.target.value})} 
                            />
                             <Input 
                                label="Country" 
                                value={editProfileForm.country || ''} 
                                onChange={e => setEditProfileForm({...editProfileForm, country: e.target.value})} 
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
     </div>
    );
}
