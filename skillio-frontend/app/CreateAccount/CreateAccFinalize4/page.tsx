'use client';
import { Button, Card } from "@/app/Components/Ui/Components";
import { Building2, Check, Upload, Loader2, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall, devStatus } from "@/app/lib/api";
import { CompanyDetails } from "@/app/types";

const CreateAccFinalize4 = () => {
    const router = useRouter();
    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadToCloudinary = async (file: File) => {
        // 1. Get signature from backend
        const sigRes = await apiCall('/generate-signature', { method: 'GET' });
        if (!sigRes.ok) throw new Error("Failed to generate upload signature");
        const sigData = await sigRes.json();

        // 2. Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('timestamp', sigData.timestamp);
        formData.append('signature', sigData.signature);
        formData.append('api_key', sigData.api_key);
        formData.append('folder', sigData.folder);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`, {
            method: 'POST',
            body: formData
        });

        if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
        const uploadData = await uploadRes.json();
        return uploadData.secure_url;
    };

    const handleNext = async () => {
        if (devStatus === 'ui-only') {
            console.log("[UI-ONLY] Skipping API call, redirecting...");
            router.push('/CreateAccount/SelectPlan');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const savedData = localStorage.getItem('onboarding_data');
            if (!savedData) throw new Error("Onboarding data not found. Please restart the process.");
            const formData: CompanyDetails = JSON.parse(savedData);

            let logoUrl = "";
            let bannerUrl = "";

            if (logoFile) {
                logoUrl = await uploadToCloudinary(logoFile);
            }
            if (bannerFile) {
                bannerUrl = await uploadToCloudinary(bannerFile);
            }

            const payload = {
                companyName: formData.name,
                companySize: formData.size,
                companyIndustry: formData.industry,
                companyEmail: formData.companyEmail,
                contactNumber: formData.companyContact,
                ownerEmail: formData.ownerEmail,
                personalNumber: formData.personalContact,
                password: formData.password,
                address: formData.address.street,
                city: formData.address.city,
                state: formData.address.state,
                zipCode: formData.address.zipCode,
                country: formData.address.country,
                companyWebsiteUrl: formData.website,
                companyLogoUrl: logoUrl,
                companyBannerUrl: bannerUrl
            };

            console.log("Sending payload to /create-org-acc:", payload);

            const response = await apiCall("/create-org-acc", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (data.orgID) localStorage.setItem('orgID', data.orgID);
                router.push('/CreateAccount/SelectPlan');
            } else {
                const errorData = await response.json();
                console.error("Server returned error:", errorData);
                setError(errorData.error || errorData.message || "Failed to create organization account.");
            }
        } catch (err: any) {
            console.error("Error creating organization:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const onCancel = () => router.push('/');
    const handleBack = () => router.push('/CreateAccount/CreateAccLocation3');

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
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Finalize Branding</h2>
                    <p className="mt-2 text-sm text-slate-600">Step 5 of 5</p>
                </div>

                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Card className="px-4 py-8 sm:px-10 shadow-xl border-slate-200/60 backdrop-blur-sm bg-white/80 ring-1 ring-slate-200/50">
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex gap-3 text-sm text-red-600 animate-in fade-in zoom-in-95 duration-200">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Company Logo</label>
                                    <div 
                                        onClick={() => logoInputRef.current?.click()}
                                        className="mt-1 flex justify-center rounded-lg border border-dashed border-slate-300 px-4 py-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                                    >
                                        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                                        <div className="text-center">
                                            {logoFile ? (
                                                <div className="flex items-center gap-2 text-primary-600"><Check className="h-5 w-5" /> <span className="text-sm font-medium">{logoFile.name}</span></div>
                                            ) : (
                                                <div className="flex flex-col items-center"><Upload className="h-8 w-8 text-slate-300 group-hover:text-primary-500 transition-colors" /><p className="mt-1 text-xs text-slate-500">Upload Logo</p></div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Company Banner</label>
                                    <div 
                                        onClick={() => bannerInputRef.current?.click()}
                                        className="mt-1 flex justify-center rounded-lg border border-dashed border-slate-300 px-4 py-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                                    >
                                        <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
                                        <div className="text-center">
                                            {bannerFile ? (
                                                <div className="flex items-center gap-2 text-primary-600"><Check className="h-5 w-5" /> <span className="text-sm font-medium">{bannerFile.name}</span></div>
                                            ) : (
                                                <div className="flex flex-col items-center"><Upload className="h-8 w-8 text-slate-300 group-hover:text-primary-500 transition-colors" /><p className="mt-1 text-xs text-slate-500">Upload Banner</p></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="terms" className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                <label htmlFor="terms" className="text-sm text-slate-600">I agree to the Terms and Privacy Policy</label>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <Button variant="ghost" onClick={onCancel} className="text-slate-500" disabled={isLoading}>Cancel</Button>
                                <Button variant="outline" onClick={handleBack} disabled={isLoading}>Back</Button>
                                <Button onClick={handleNext} className="flex-1 shadow-lg shadow-primary-500/20" disabled={isLoading}>
                                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 'Complete Setup'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default CreateAccFinalize4;
