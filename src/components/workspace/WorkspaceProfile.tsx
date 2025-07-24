import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkspaceProfile, WorkspaceProfile, updateWorkspaceProfile, scrapWorkspaceProfile } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import countries from '@/data/countries.json';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkspaceRole, WorkspaceError } from "@/types";
import { hasPermission } from "@/utils/workspacePermissions";
import { handleWorkspaceError } from "@/utils/errorHandler";

interface WorkspaceProfileFormProps {
  workspaceId: string;
  userRole: WorkspaceRole;
  initialData?: WorkspaceProfile;
  onSubmit?: (data: WorkspaceProfile) => Promise<void>;
  onSuccess?: () => void;
}

export function WorkspaceProfileForm({ workspaceId, userRole, initialData, onSubmit, onSuccess }: WorkspaceProfileFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<WorkspaceProfile, "workspace_id">>({
    brand_name: "",
    business_type: "",
    default_language_code: "en",
    default_location_code: "VN",
    brand_description: "",
    brand_products_services: "",
    website_url: "",
    brand_logo_url: "",
  });
  const [websiteInput, setWebsiteInput] = useState("");
  const [scrapLoading, setScrapLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [scrapResult, setScrapResult] = useState<Record<string, unknown> | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [languageOptions, setLanguageOptions] = useState<{code: string, name: string}[]>([]);
  const [languageOptionsLoading, setLanguageOptionsLoading] = useState(true);
  const [languageOptionsError, setLanguageOptionsError] = useState(false);
  const [countryOptions, setCountryOptions] = useState<{code: string, name: string}[]>([]);
  const [countryOptionsLoading, setCountryOptionsLoading] = useState(true);
  const [countryOptionsError, setCountryOptionsError] = useState(false);

  const canManageProfile = hasPermission(userRole, 'manage_profile');

  useEffect(() => {
    if (initialData) {
      setFormData({
        brand_name: initialData.brand_name || "",
        business_type: initialData.business_type || "",
        default_language_code: initialData.default_language_code || "en",
        default_location_code: initialData.default_location_code || "VN",
        brand_description: initialData.brand_description || "",
        brand_products_services: initialData.brand_products_services || "",
        website_url: initialData.website_url || "",
        brand_logo_url: initialData.brand_logo_url || "",
      });
      setStep(2);
    }
  }, [initialData]);

  useEffect(() => {
    setLanguageOptionsLoading(true);
    fetch('https://libretranslate.com/languages')
      .then(res => res.json())
      .then(data => {
        setLanguageOptions(data);
        setLanguageOptionsLoading(false);
      })
      .catch(() => {
        setLanguageOptionsError(true);
        setLanguageOptionsLoading(false);
      });
  }, []);

  useEffect(() => {
    setCountryOptionsLoading(true);
    try {
      setCountryOptions(countries);
      setCountryOptionsLoading(false);
    } catch {
      setCountryOptionsError(true);
      setCountryOptionsLoading(false);
    }
  }, []);

  const handleScrapUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteInput) return toast.error("Vui lòng nhập website công ty");
    if (!canManageProfile) {
      toast.error("Bạn không có quyền quản lý thông tin workspace");
      return;
    }
    setScrapLoading(true);
    setProfileLoading(true);
    setStep(2);
    try {
      const res = await scrapWorkspaceProfile({ workspace_id: workspaceId, website_url: websiteInput });
      if (res && typeof res === "object" && res.data) {
        setScrapResult(res.data);
        let langCode = "en";
        let countryCode = "VN";
        if (res.data.default_language_code) {
          const lang = languageOptions.find(l => l.name === res.data.default_language_code || l.code === res.data.default_language_code);
          langCode = lang ? lang.code : "en";
        }
        if (res.data.default_location_code) {
          const country = countryOptions.find(c => c.name === res.data.default_location_code || c.code === res.data.default_location_code);
          countryCode = country ? country.code : "VN";
        }
        setFormData((prev) => ({
          ...prev,
          ...res.data,
          default_language_code: langCode,
          default_location_code: countryCode,
          website_url: websiteInput,
        }));
        setProfileLoading(false);
        toast.success("Lấy thông tin doanh nghiệp thành công!");
      } else {
        toast.error("Không lấy được thông tin doanh nghiệp");
      }
    } catch (err: unknown) {
      setProfileLoading(false);
      if (err && typeof err === 'object' && 'tag' in err) {
        handleWorkspaceError(err as WorkspaceError);
      } else {
        toast.error("Không thể lấy thông tin doanh nghiệp từ website");
      }
    } finally {
      setScrapLoading(false);
    }
  };

  const handleSkip = () => {
    if (!canManageProfile) {
      toast.error("Bạn không có quyền quản lý thông tin workspace");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageProfile) {
      toast.error("Bạn không có quyền quản lý thông tin workspace");
      return;
    }
    setIsLoading(true);
    try {
      const fullData = {
        ...formData,
        workspace_id: workspaceId,
      };
      if (initialData) {
        await updateWorkspaceProfile(workspaceId, fullData);
        toast.success("Cập nhật workspace profile thành công!");
      } else {
        await createWorkspaceProfile(fullData as WorkspaceProfile);
        toast.success("Tạo workspace profile thành công!");
        navigate("/workspace");
      }
      onSuccess?.();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'tag' in error) {
        handleWorkspaceError(error as WorkspaceError);
      } else {
        toast.error("Lỗi khi lưu thông tin workspace");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formTitle = initialData ? "Edit Workspace Information" : "Workspace Information";

  // If user can't manage profile, show read-only view
  if (!canManageProfile && step === 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{formTitle}</CardTitle>
          <CardDescription>Thông tin hồ sơ workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Brand Name</Label>
            <p className="text-sm">{formData.brand_name || "N/A"}</p>
          </div>
          <div className="space-y-2">
            <Label>Business Type</Label>
            <p className="text-sm">{formData.business_type || "N/A"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <p className="text-sm">
                {languageOptions.find(l => l.code === formData.default_language_code)?.name || formData.default_language_code || "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <p className="text-sm">
                {countryOptions.find(c => c.code === formData.default_location_code)?.name || formData.default_location_code || "N/A"}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Brand Description</Label>
            <p className="text-sm whitespace-pre-wrap">{formData.brand_description || "N/A"}</p>
          </div>
          <div className="space-y-2">
            <Label>Products/Services</Label>
            <p className="text-sm whitespace-pre-wrap">{formData.brand_products_services || "N/A"}</p>
          </div>
          {formData.website_url && (
            <div className="space-y-2">
              <Label>Website</Label>
              <a href={formData.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                {formData.website_url}
              </a>
            </div>
          )}
          {formData.brand_logo_url && (
            <div className="space-y-2">
              <Label>Logo</Label>
              <img src={formData.brand_logo_url} alt="Brand Logo" className="max-w-xs h-auto" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {step === 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nhập website công ty</CardTitle>
            <CardDescription>Bạn có thể nhập website để tự động lấy thông tin, hoặc bỏ qua để điền thủ công.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScrapUrl} className="space-y-2">
              <Label htmlFor="websiteInput" className="font-medium text-sm text-slate-800 dark:text-zinc-200">Website công ty</Label>
              <div className="flex gap-2">
                <Input
                  id="websiteInput"
                  name="websiteInput"
                  value={websiteInput}
                  onChange={e => setWebsiteInput(e.target.value)}
                  placeholder="https://tencongty.com"
                  className="border-zinc-400 focus:border-primary focus:ring-1 focus:ring-primary/60 text-base py-2.5 px-3.5 bg-white text-slate-900 placeholder:text-zinc-500 rounded-md dark:bg-zinc-800/80 dark:text-white dark:placeholder:text-zinc-400"
                  disabled={scrapLoading}
                />
                <Button type="submit" className="" disabled={scrapLoading}>
                  {scrapLoading ? "Đang lấy..." : "Lấy thông tin"}
                </Button>
                <Button type="button" variant="outline" onClick={handleSkip} disabled={scrapLoading}>
                  Bỏ qua
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{formTitle}</CardTitle>
            <CardDescription>Thông tin hồ sơ workspace của bạn</CardDescription>
          </CardHeader>
          {profileLoading ? (
            <SkeletonProfileForm />
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand_name">Brand Name</Label>
                  <Input
                    id="brand_name"
                    name="brand_name"
                    value={formData.brand_name}
                    onChange={handleChange}
                    required
                    placeholder="Enter brand name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type</Label>
                  <Input
                    id="business_type"
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    required
                    placeholder="Enter business type"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default_language_code">Language Code</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {languageOptionsLoading ? 'Loading...' :
                            languageOptionsError ? 'Error loading languages' :
                            (languageOptions.find(l => l.code === formData.default_language_code)?.name + ' (' + formData.default_language_code + ')') || 'Select language'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full max-h-72 overflow-y-auto">
                        {languageOptions.map(lang => (
                          <DropdownMenuItem
                            key={lang.code}
                            onSelect={() => setFormData(prev => ({ ...prev, default_language_code: lang.code }))}
                          >
                            {lang.name} ({lang.code})
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default_location_code">Country Code</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {countryOptionsLoading ? 'Loading...' :
                            countryOptionsError ? 'Error loading countries' :
                            (countryOptions.find(c => c.code === formData.default_location_code)?.name + ' (' + formData.default_location_code + ')') || 'Select country'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full max-h-72 overflow-y-auto">
                        {countryOptions.map(c => (
                          <DropdownMenuItem
                            key={c.code}
                            onSelect={() => setFormData(prev => ({ ...prev, default_location_code: c.code }))}
                          >
                            {c.name} ({c.code})
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand_description">Brand Description</Label>
                  <Textarea
                    id="brand_description"
                    name="brand_description"
                    value={formData.brand_description}
                    onChange={handleChange}
                    required
                    placeholder="Enter brand description"
                    rows={3}
                    className="border-zinc-400 focus:border-primary focus:ring-1 focus:ring-primary/60 text-base py-2.5 px-3.5 bg-white text-slate-900 placeholder:text-zinc-500 rounded-md dark:bg-zinc-800/80 dark:text-white dark:placeholder:text-zinc-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand_products_services">Products/Services</Label>
                  <Textarea
                    id="brand_products_services"
                    name="brand_products_services"
                    value={formData.brand_products_services}
                    onChange={handleChange}
                    required
                    placeholder="Enter products and services"
                    rows={3}
                    className="border-zinc-400 focus:border-primary focus:ring-1 focus:ring-primary/60 text-base py-2.5 px-3.5 bg-white text-slate-900 placeholder:text-zinc-500 rounded-md dark:bg-zinc-800/80 dark:text-white dark:placeholder:text-zinc-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL (Optional)</Label>
                  <Input
                    id="website_url"
                    name="website_url"
                    value={formData.website_url}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand_logo_url">Logo URL (Optional)</Label>
                  <Input
                    id="brand_logo_url"
                    name="brand_logo_url"
                    value={formData.brand_logo_url}
                    onChange={handleChange}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full superb-button" disabled={isLoading}>
                  {isLoading ? "Processing..." : initialData ? "Update Information" : "Save Information"}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}

function SkeletonProfileForm() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
} 