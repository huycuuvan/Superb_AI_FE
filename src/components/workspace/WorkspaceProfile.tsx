import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createWorkspaceProfile, WorkspaceProfile, updateWorkspaceProfile, scrapWorkspaceProfile } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface WorkspaceProfileFormProps {
  workspaceId: string;
  initialData?: WorkspaceProfile;
  onSubmit?: (data: WorkspaceProfile) => Promise<void>;
  onSuccess?: () => void;
}

export function WorkspaceProfileForm({ workspaceId, initialData, onSubmit, onSuccess }: WorkspaceProfileFormProps) {
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
  // State cho nhập website và loading scrap
  const [websiteInput, setWebsiteInput] = useState("");
  const [scrapLoading, setScrapLoading] = useState(false);
  // State điều khiển bước: 1 = nhập website, 2 = điền profile
  const [step, setStep] = useState(1);
  // State lưu kết quả scrap (nếu có)
  const [scrapResult, setScrapResult] = useState<Record<string, unknown> | null>(null);

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
      setStep(2); // Nếu có initialData thì vào luôn bước profile
    }
  }, [initialData]);

  // Xử lý scrap-url
  const handleScrapUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteInput) return toast.error("Vui lòng nhập website công ty");
    setScrapLoading(true);
    try {
      const res = await scrapWorkspaceProfile({ workspace_id: workspaceId, website_url: websiteInput });
      if (res && typeof res === "object" && res.data) {
        setScrapResult(res.data);
        setFormData((prev) => ({
          ...prev,
          ...res.data,
          website_url: websiteInput,
        }));
        setStep(2);
        toast.success("Lấy thông tin doanh nghiệp thành công!");
      } else {
        toast.error("Không lấy được thông tin doanh nghiệp");
      }
    } catch (err) {
      toast.error("Không thể lấy thông tin doanh nghiệp từ website");
    } finally {
      setScrapLoading(false);
    }
  };

  // Xử lý skip
  const handleSkip = () => {
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fullData = {
        ...formData,
        workspace_id: workspaceId,
      };
      if (initialData) {
        // Đã có profile, gọi update
        await updateWorkspaceProfile(workspaceId, fullData);
        toast.success("Cập nhật workspace profile thành công!");
      } else {
        // Chưa có profile, gọi create
        await createWorkspaceProfile(fullData as WorkspaceProfile);
        toast.success("Tạo workspace profile thành công!");
        navigate("/workspace");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Lỗi khi lưu thông tin workspace");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formTitle = initialData ? "Edit Workspace Information" : "Workspace Information";

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
              <Label htmlFor="websiteInput" className="font-medium text-sm">Website công ty</Label>
              <div className="flex gap-2">
                <Input
                  id="websiteInput"
                  name="websiteInput"
                  value={websiteInput}
                  onChange={e => setWebsiteInput(e.target.value)}
                  placeholder="https://tencongty.com"
                  className=""
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
            <CardTitle>Workspace Profile</CardTitle>
            <CardDescription>Thông tin hồ sơ workspace của bạn</CardDescription>
          </CardHeader>
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
                  <Input
                    id="default_language_code"
                    name="default_language_code"
                    value={formData.default_language_code}
                    onChange={handleChange}
                    required
                    placeholder="en"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_location_code">Country Code</Label>
                  <Input
                    id="default_location_code"
                    name="default_location_code"
                    value={formData.default_location_code}
                    onChange={handleChange}
                    required
                    placeholder="VN"
                  />
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
        </Card>
      )}
    </div>
  );
} 