import { Badge, Button, Card, Input } from "@/app/Components/Ui/Components";
import { Briefcase, Check, CreditCard, Layers, Plus, Trash2, X, Camera, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { apiCall } from "@/app/lib/api";

interface Skill {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  skillIds: string[];
  skillLevel: string;
}

export default function SettingsTab({ userType }: { userType?: 'company' | 'employee' | null }){
    // Employee states
    const [employeeName, setEmployeeName] = useState('');
    const [employeeEmail, setEmployeeEmail] = useState('');
    const [employeeContact, setEmployeeContact] = useState('');
    const [employeeAddress, setEmployeeAddress] = useState('');
    const [employeeImgUrl, setEmployeeImgUrl] = useState('');
    const [employeePassword, setEmployeePassword] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Email update states
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [isEmailProcessing, setIsEmailProcessing] = useState(false);

    interface Plan {
        id: string;
        name: string;
        description: string;
        priceMonth: number;
        features: string[];
        stripePriceID: string;
    }

    interface SubscriptionData {
        plan: {
            name: string;
            priceMonth: number;
            stripePriceID: string;
            id: string;
        };
        subscription: {
            status: string;
            current_period_end: string;
            current_period_start: string;
            stripe_subscription_id: string;
        };
    }

    const [isLoading, setIsLoading] = useState(true);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const defaultLibrarySkills = [
        { name: 'Public Speaking', description: 'Soft skill' },
        { name: 'Negotiation', description: 'Soft skill' },
        { name: 'Machine Learning', description: 'Hard skill' },
        { name: 'Kubernetes', description: 'Hard skill' },
        { name: 'Sales Strategy', description: 'Soft skill' },
        { name: 'SEO Marketing', description: 'Hard skill' },
        { name: 'Financial Modeling', description: 'Hard skill' },
        { name: 'Conflict Resolution', description: 'Soft skill' },
    ];

    const [subData, setSubData] = useState<SubscriptionData | null>(null);
    const [allPlans, setAllPlans] = useState<Plan[]>([]);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);

    const getId = (item: any) => item._id?.$oid || item.id || '';

    const [isJobRolesModalOpen, setIsJobRolesModalOpen] = useState(false);
    const [jobRoleMode, setJobRoleMode] = useState<'list' | 'edit' | 'create'>('list');
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [newRoleSkillId, setNewRoleSkillId] = useState<string>('');

    const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
    const [customSkill, setCustomSkill] = useState('');
    const [customSkillDesc, setCustomSkillDesc] = useState('');
    const [selectedLibrarySkill, setSelectedLibrarySkill] = useState('');

    const fetchEmployeeProfile = async () => {
        setIsLoading(true);
        try {
            const res = await apiCall('/get-employee-profile', { method: 'GET' });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') {
                    setEmployeeName(data.employee.name || '');
                    setEmployeeEmail(data.employee.email || '');
                    setEmployeeContact(data.employee.contactnumber || '');
                    setEmployeeAddress(data.employee.address || '');
                    setEmployeeImgUrl(data.employee.profileImageUrl || '');
                }
            }
        } catch (error) {
            console.error('Error fetching employee profile', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveEmployeeProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        setSaveSuccess(false);
        try {
            const payload: any = {
                newEmployeeName: employeeName,
                newContact: employeeContact,
                newAddress: employeeAddress,
                newProfileImgUrl: employeeImgUrl,
            };
            if (employeePassword.trim() !== '') {
                payload.password = employeePassword;
            }
            
            const res = await apiCall('/update-employee-profile', {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setSaveSuccess(true);
                localStorage.setItem('employeeName', employeeName);
                setEmployeePassword('');
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                alert(data.message || 'Failed to update profile settings.');
            }
        } catch (error) {
            console.error('Error saving profile settings', error);
            alert('An error occurred while saving your profile.');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSendVerification = async () => {
        if (!newEmail.trim() || !newEmail.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }
        setIsEmailProcessing(true);
        try {
            const res = await apiCall(`/get-code-em-email/${newEmail}`, { method: 'GET' });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                setIsVerificationSent(true);
                alert('Verification code sent to ' + newEmail);
            } else {
                alert(data.message || 'Failed to send verification code.');
            }
        } catch (error) {
            console.error('Error sending code', error);
            alert('An error occurred while sending the code.');
        } finally {
            setIsEmailProcessing(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!verificationCode.trim()) {
            alert('Please enter the verification code.');
            return;
        }
        setIsEmailProcessing(true);
        try {
            const res = await apiCall(`/verify-user/${newEmail}/${verificationCode}`, { method: 'POST' });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                alert('Email updated successfully!');
                setEmployeeEmail(newEmail);
                setIsEmailModalOpen(false);
                setNewEmail('');
                setVerificationCode('');
                setIsVerificationSent(false);
            } else {
                alert(data.message || 'Failed to verify code.');
            }
        } catch (error) {
            console.error('Error verifying code', error);
            alert('An error occurred during verification.');
        } finally {
            setIsEmailProcessing(false);
        }
    };

    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const res = await apiCall('/get-signed-url', { method: 'GET' });
            const data = await res.json();
            if (!res.ok) {
                alert('Could not get upload signature.');
                setIsUploadingImage(false);
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', data.api_key);
            formData.append('timestamp', data.timestamp);
            formData.append('signature', data.signature);

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${data.cloud_name}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            const uploadData = await uploadRes.json();
            if (uploadRes.ok) {
                setEmployeeImgUrl(uploadData.secure_url);
            } else {
                alert('Failed to upload image.');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            alert('An error occurred during upload.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const fetchSubData = async () => {
        try {
            const res = await apiCall('/get-subscription-data', { method: 'GET' });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') {
                    setSubData(data);
                }
            }
        } catch (error) {
            console.error('Error fetching subscription data', error);
        }
    };

    const fetchPlans = async () => {
        try {
            const res = await apiCall('/plans', { method: 'GET' });
            if (res.ok) {
                const data = await res.json();
                if (data.status === 'success') {
                    setAllPlans(data.data.map((p: any) => ({
                        id: p._id?.$oid || p.id,
                        name: p.name,
                        description: p.description,
                        priceMonth: p.priceMonth,
                        features: p.features || [],
                        stripePriceID: p.stripePriceID
                    })));
                }
            }
        } catch (error) {
            console.error('Error fetching plans', error);
        }
    };

    const handleUpgrade = async (plan: Plan) => {
        setIsUpgrading(true);
        try {
            const res = await apiCall('/create-customer-portal-session-update', {
                method: 'POST',
                body: JSON.stringify({
                    priceId: plan.stripePriceID,
                    planID: plan.id
                })
            });
            const data = await res.json();
            if (res.ok && data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Failed to start upgrade session');
            }
        } catch (error) {
            console.error('Upgrade error', error);
            alert('An error occurred while initiating upgrade.');
        } finally {
            setIsUpgrading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) return;
        try {
            // Placeholder for cancel endpoint - assuming it will be implemented
            alert("Cancellation logic is being processed. Please contact support or use the Stripe portal.");
        } catch (error) {
            console.error('Error canceling subscription', error);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                (async () => {
                    const skillRes = await apiCall('/skill-manage', { method: 'GET' });
                    if (skillRes.ok) {
                        const sData = await skillRes.json();
                        if (sData.data) {
                            setSkills(sData.data.map((s: any) => ({
                                id: getId(s),
                                name: s.skill_name,
                                description: s.skill_des
                            })));
                        }
                    }
                })(),
                (async () => {
                    const roleRes = await apiCall('/role-manage', { method: 'GET' });
                    if (roleRes.ok) {
                        const rData = await roleRes.json();
                        if (rData.data) {
                            setRoles(rData.data.map((r: any) => ({
                                id: getId(r),
                                name: r.roleName,
                                description: r.roleDescription || '',
                                skillIds: r.roleSkillid || [],
                                skillLevel: r.skillLevel || 'medium'
                            })));
                        }
                    }
                })(),
                fetchSubData(),
                fetchPlans()
            ]);
        } catch (error) {
            console.error('Error fetching settings data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userType === 'employee') {
            fetchEmployeeProfile();
        } else {
            fetchData();
        }
    }, [userType]);

    const openJobRoleModal = () => {
        setIsJobRolesModalOpen(true);
        setJobRoleMode('list');
    };

    const handleCreateSkill = async (name: string, desc: string) => {
        if (!name.trim()) return;
        try {
            const res = await apiCall('/skill-manage', {
                method: 'POST',
                body: JSON.stringify({ skill_name: name, skill_des: desc || 'Custom skill' })
            });
            if (res.ok) {
                await fetchData();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to create skill');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddCustomSkill = async () => {
        await handleCreateSkill(customSkill, customSkillDesc);
        setCustomSkill('');
        setCustomSkillDesc('');
    };

    const handleAddLibrarySkill = async () => {
        if (selectedLibrarySkill) {
            const skillToAdd = defaultLibrarySkills.find(s => s.name === selectedLibrarySkill);
            if (skillToAdd) {
                await handleCreateSkill(skillToAdd.name, skillToAdd.description);
            }
            setSelectedLibrarySkill('');
        }
    };

    const handleDeleteSkill = async (id: string) => {
        if (!confirm('Are you sure you want to delete this skill?')) return;
        try {
            const res = await apiCall(`/skill-manage/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to delete skill');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateRole = () => {
        setJobRoleMode('create');
        setEditingRole({
            id: '',
            name: '',
            description: '',
            skillIds: [],
            skillLevel: 'medium'
        });
        setNewRoleSkillId('');
    };

    const handleEditRole = (role: Role) => {
        setJobRoleMode('edit');
        setEditingRole({ ...role, skillIds: [...role.skillIds] });
        setNewRoleSkillId('');
    };

    const handleSaveRole = async () => {
        if (!editingRole || !editingRole.name.trim()) return;

        const payload = {
            roleName: editingRole.name,
            roleDescription: editingRole.description,
            roleSkillid: editingRole.skillIds,
            skillLevel: editingRole.skillLevel
        };

        try {
            let res;
            if (jobRoleMode === 'create') {
                res = await apiCall('/role-manage', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            } else {
                res = await apiCall(`/role-manage/${editingRole.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                await fetchData();
                setJobRoleMode('list');
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to save role');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteRole = async (id: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            const res = await apiCall(`/role-manage/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await fetchData();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to delete role');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const addSkillToEditingRole = () => {
        if (editingRole && newRoleSkillId && !editingRole.skillIds.includes(newRoleSkillId)) {
            setEditingRole({
                ...editingRole,
                skillIds: [...editingRole.skillIds, newRoleSkillId]
            });
            setNewRoleSkillId('');
        }
    };

    const removeSkillFromEditingRole = (skillId: string) => {
        if (editingRole) {
            setEditingRole({
                ...editingRole,
                skillIds: editingRole.skillIds.filter(id => id !== skillId)
            });
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div></div>;
    }

    if (userType === 'employee') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
                        <p className="text-sm text-slate-500 mt-1">Manage your personal profile and security preferences.</p>
                    </div>
                </div>

                <div className="max-w-3xl">
                    <form onSubmit={handleSaveEmployeeProfile} className="space-y-6">
                        <Card className="p-8 border-0 shadow-sm ring-1 ring-slate-200 bg-white">
                            <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-100 mb-6">
                                <div className="relative group shrink-0">
                                    <div className="h-20 w-20 rounded-full bg-primary-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-primary-200 overflow-hidden animate-in zoom-in duration-300">
                                        {employeeImgUrl ? (
                                            <img src={employeeImgUrl} alt={employeeName} className="h-full w-full object-cover animate-in fade-in duration-300" />
                                        ) : (
                                            employeeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                        )}
                                    </div>
                                </div>
                                <div className="text-center md:text-left space-y-1">
                                    <h3 className="text-lg font-bold text-slate-900">{employeeName || 'Your Name'}</h3>
                                    <p className="text-sm text-slate-500">{employeeEmail || 'No Email Associated'}</p>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 mt-1">
                                        Employee Account
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Full Name</label>
                                    <Input
                                        placeholder="Full Name"
                                        value={employeeName}
                                        onChange={(e) => setEmployeeName(e.target.value)}
                                        required
                                        className="bg-slate-50 border-slate-200"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Contact Email</label>
                                        <button type="button" onClick={() => setIsEmailModalOpen(true)} className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest">
                                            Change
                                        </button>
                                    </div>
                                    <Input
                                        value={employeeEmail}
                                        disabled
                                        className="bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Contact Number</label>
                                    <Input
                                        placeholder="Contact Number"
                                        value={employeeContact}
                                        onChange={(e) => setEmployeeContact(e.target.value)}
                                        className="bg-slate-50 border-slate-200"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Profile Image URL</label>
                                        <label className={`text-[10px] font-bold uppercase tracking-widest ${isUploadingImage ? 'text-slate-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700 cursor-pointer'}`}>
                                            {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                                        </label>
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="No image uploaded"
                                        value={employeeImgUrl}
                                        disabled
                                        className="bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Home Address</label>
                                    <Input
                                        placeholder="Home Address"
                                        value={employeeAddress}
                                        onChange={(e) => setEmployeeAddress(e.target.value)}
                                        className="bg-slate-50 border-slate-200"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 border-0 shadow-sm ring-1 ring-slate-200 bg-white">
                            <h3 className="text-md font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Lock className="h-5 w-5 text-slate-500" /> Security Settings
                            </h3>
                            <div className="max-w-md space-y-1">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Change Password</label>
                                <Input
                                    type="password"
                                    placeholder="Enter new password (leave blank to keep current)"
                                    value={employeePassword}
                                    onChange={(e) => setEmployeePassword(e.target.value)}
                                    className="bg-slate-50 border-slate-200"
                                />
                            </div>
                        </Card>

                        <div className="flex items-center gap-4 justify-end">
                            {saveSuccess && (
                                <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5 animate-in fade-in duration-300">
                                    <Check className="h-4 w-4" /> Profile updated successfully
                                </span>
                            )}
                            <Button
                                type="submit"
                                disabled={isSavingProfile}
                                className="px-8 py-3 font-bold text-sm"
                            >
                                {isSavingProfile ? 'Saving Changes...' : 'Save Settings'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Email Update Modal */}
                {isEmailModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900">Change Email Address</h3>
                                <button onClick={() => {setIsEmailModalOpen(false); setIsVerificationSent(false);}} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-wider">New Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="Enter new email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        disabled={isVerificationSent || isEmailProcessing}
                                        className="bg-slate-50 border-slate-200"
                                    />
                                </div>
                                {isVerificationSent ? (
                                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Verification Code</label>
                                        <Input
                                            type="text"
                                            placeholder="Enter 6-digit code"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            disabled={isEmailProcessing}
                                            className="bg-slate-50 border-slate-200"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Please check your inbox (and spam folder) for the verification code.</p>
                                    </div>
                                ) : null}
                                <div className="pt-2 flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => {setIsEmailModalOpen(false); setIsVerificationSent(false);}} disabled={isEmailProcessing}>
                                        Cancel
                                    </Button>
                                    {isVerificationSent ? (
                                        <Button onClick={handleVerifyEmail} disabled={isEmailProcessing}>
                                            {isEmailProcessing ? 'Verifying...' : 'Verify & Update'}
                                        </Button>
                                    ) : (
                                        <Button onClick={handleSendVerification} disabled={isEmailProcessing}>
                                            {isEmailProcessing ? 'Sending...' : 'Send Verification Code'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return(
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
            </div>

            <div className="space-y-6 max-w-5xl">
                {/* Subscription Card */}
                <Card className="p-6 border-0 shadow-sm ring-1 ring-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-slate-500" /> Subscription
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Plan</div>
                            <div className="text-2xl font-extrabold text-primary-600">{subData?.plan.name || 'No Active Plan'}</div>
                            <div className="text-sm text-slate-600 mt-1 font-medium">
                                ${subData?.plan.priceMonth || 0}/month • 
                                {subData?.subscription.status === 'active' 
                                    ? ` Renews ${new Date(subData.subscription.current_period_end).toLocaleDateString()}`
                                    : ' Subscription inactive'}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" className="bg-white" onClick={() => setIsUpgradeModalOpen(true)}>Upgrade</Button>
                            <Button variant="outline" className="bg-white text-red-600 border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700" onClick={handleCancelSubscription}>Cancel Subscription</Button>
                        </div>
                    </div>
                </Card>

            {/* Upgrade Modal */}
            {isUpgradeModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white relative">
                            <div>
                                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Upgrade Your Plan</h2>
                                <p className="text-slate-500 mt-2 text-lg">Scale your organization with advanced AI capabilities.</p>
                            </div>
                            <button onClick={() => setIsUpgradeModalOpen(false)} className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="h-6 w-6 text-slate-400" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {allPlans.map((plan) => (
                                    <div 
                                        key={plan.id} 
                                        className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col transition-all duration-300 ${subData?.plan.id === plan.id 
                                            ? 'border-primary-500 ring-4 ring-primary-500/10 scale-[1.02] shadow-xl' 
                                            : 'border-slate-100 hover:border-slate-300 hover:shadow-lg'}`}
                                    >
                                        {subData?.plan.id === plan.id && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                                                Current Plan
                                            </div>
                                        )}
                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                            <div className="mt-4 flex items-baseline gap-1">
                                                <span className="text-4xl font-extrabold text-slate-900">${plan.priceMonth}</span>
                                                <span className="text-slate-500 font-medium">/mo</span>
                                            </div>
                                            <p className="mt-4 text-sm text-slate-600 leading-relaxed min-h-[40px] line-clamp-2">
                                                {plan.description}
                                            </p>
                                        </div>
                                        
                                        <div className="flex-1 space-y-4 mb-8">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Includes</div>
                                            {plan.features.slice(0, 5).map((feature, idx) => (
                                                <div key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                                                    <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                                        <Check className="h-3 w-3 text-emerald-600" />
                                                    </div>
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>

                                        <Button 
                                            onClick={() => handleUpgrade(plan)}
                                            disabled={isUpgrading || subData?.plan.id === plan.id}
                                            variant={subData?.plan.id === plan.id ? 'ghost' : 'primary'}
                                            className="w-full py-6 text-md font-bold rounded-xl"
                                        >
                                            {isUpgrading ? 'Processing...' : subData?.plan.id === plan.id ? 'Active' : 'Upgrade Now'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            )}

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
                                     <span className="text-xs font-bold text-primary-600">{roles.length} Configured</span>
                                 </div>
                                 <div className="space-y-2 mt-2">
                                     {roles.slice(0, 3).map(role => (
                                         <div key={role.id} className="text-sm text-slate-700 flex items-center gap-2">
                                             <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                                             {role.name}
                                         </div>
                                     ))}
                                     {roles.length > 3 && <div className="text-xs text-slate-400 pl-3.5">+{roles.length - 3} more</div>}
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
                                        className="bg-slate-50 h-9 flex-1"
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
                                                <option key={s.name} value={s.name} disabled={skills.some(ms => ms.name === s.name)}>
                                                {s.name} {skills.some(ms => ms.name === s.name) ? '(Added)' : ''}
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

            {/* Skills Modal */}
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
                           <div className="flex flex-col gap-2 mb-4">
                             <Input 
                               placeholder="Skill Name (e.g. Rust)" 
                               value={customSkill}
                               onChange={(e) => setCustomSkill(e.target.value)}
                             />
                             <Input 
                               placeholder="Description (Optional)" 
                               value={customSkillDesc}
                               onChange={(e) => setCustomSkillDesc(e.target.value)}
                             />
                             <Button onClick={handleAddCustomSkill} disabled={!customSkill.trim()}>Add</Button>
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
                               {defaultLibrarySkills.filter(s => !skills.some(ms => ms.name === s.name)).map(s => (
                                 <option key={s.name} value={s.name}>{s.name} ({s.description})</option>
                               ))}
                             </select>
                             <Button variant="outline" onClick={handleAddLibrarySkill} disabled={!selectedLibrarySkill}>Add</Button>
                           </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Active Skills ({skills.length})</h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill) => (
                            <span key={skill.id} className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                              {skill.name}
                              <button 
                                onClick={() => handleDeleteSkill(skill.id)}
                                className="ml-2 text-slate-400 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                          {skills.length === 0 && <p className="text-sm text-slate-400 italic">No skills defined.</p>}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                      <Button onClick={() => setIsSkillsModalOpen(false)}>Done</Button>
                    </div>
                  </Card>
                </div>
            )}

            {/* Job Roles Modal */}
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
                              {roles.map(role => (
                                <div key={role.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group hover:border-primary-300 transition-colors">
                                  <div>
                                    <h3 className="font-bold text-slate-900">{role.name}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                       <Badge variant="neutral">Level: {role.skillLevel}</Badge>
                                       {role.skillIds.slice(0, 3).map(sId => {
                                         const sName = skills.find(s => s.id === sId)?.name || 'Unknown Skill';
                                         return <Badge key={sId} variant="primary">{sName}</Badge>;
                                       })}
                                       {role.skillIds.length > 3 && <span className="text-xs text-slate-400 py-1">+ {role.skillIds.length - 3} more</span>}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="outline" size="sm" onClick={() => handleEditRole(role)}>Edit</Button>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteRole(role.id)}><Trash2 className="h-4 w-4" /></Button>
                                  </div>
                                </div>
                              ))}
                              {roles.length === 0 && <p className="text-center text-slate-500 py-8">No roles defined.</p>}
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
                                <div className="space-y-1.5">
                                   <label className="text-sm font-medium text-slate-700">Overall Skill Requirement Level</label>
                                   <select 
                                     className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-primary-500 focus:outline-none"
                                     value={editingRole?.skillLevel || 'medium'}
                                     onChange={e => setEditingRole(prev => prev ? {...prev, skillLevel: e.target.value} : null)}
                                   >
                                     <option value="low">Low</option>
                                     <option value="medium">Medium</option>
                                     <option value="high">High</option>
                                     <option value="expert">Expert</option>
                                   </select>
                                </div>
                             </div>

                             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="text-sm font-bold text-slate-900 mb-4">Required Skills</h3>
                                
                                {/* Add Skill Form */}
                                <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                   <div className="flex-1 space-y-1.5">
                                     <label className="text-xs font-medium text-slate-700">Select Skill</label>
                                     <select 
                                       className="w-full rounded-lg border border-slate-300 text-sm p-2.5"
                                       value={newRoleSkillId}
                                       onChange={e => setNewRoleSkillId(e.target.value)}
                                     >
                                       <option value="">Select skill...</option>
                                       {skills.map(s => <option key={s.id} value={s.id} disabled={editingRole?.skillIds.includes(s.id)}>{s.name}</option>)}
                                     </select>
                                   </div>
                                   <div className="flex items-end">
                                     <Button onClick={addSkillToEditingRole} disabled={!newRoleSkillId}>Add</Button>
                                   </div>
                                </div>

                                {/* Skill List */}
                                <div className="space-y-2">
                                   {editingRole?.skillIds.map(skillId => {
                                     const skill = skills.find(s => s.id === skillId);
                                     if (!skill) return null;
                                     return (
                                       <div key={skillId} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg">
                                          <div>
                                            <span className="font-medium text-slate-900 mr-2">{skill.name}</span>
                                          </div>
                                          <button onClick={() => removeSkillFromEditingRole(skillId)} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                       </div>
                                     );
                                   })}
                                   {editingRole?.skillIds.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">No skills added yet.</p>}
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
        </div>
    );
}